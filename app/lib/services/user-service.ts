import { db } from '@/lib/db'; // Import Drizzle instance
import * as schema from '@/lib/schema'; // Import ALL schemas via index
import { eq, and, or, ilike, count, desc, sql } from 'drizzle-orm'; // Import Drizzle functions
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { logger } from '../logger';

// --- Type Adaptations ---
type UserSelect = typeof schema.users.$inferSelect;
type UserRole = typeof schema.userRoleEnum.enumValues[number];
type UserWithPasswordHash = UserSelect & { passwordHash: string };

// Interfaces remain largely the same but use UserRole type
export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  // TODO: Add referralCodeUsed?: string | null;
}

export interface UpdateUserParams {
  name?: string;
  email?: string;
  status?: string; // Or schema.UserStatus
  role?: UserRole;
}

export interface AuthResult {
  success: boolean;
  user?: Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'>;
  token?: string;
  message?: string;
}

export interface ChangePasswordParams {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ListUsersResult {
  users: Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'>[];
  pagination: { total: number; page: number; limit: number; totalPages: number; };
}

export interface ApplyWholesaleResult {
  success: boolean;
  applicationId?: string;
  message?: string;
}

// --- UserService Class (Using central schema import) ---
export class UserService {

  async getUserById(userId: string): Promise<Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'> | null> {
    try {
      const result = await db.select({
          id: schema.users.id, email: schema.users.email, name: schema.users.name, role: schema.users.role,
          status: schema.users.status, referralCode: schema.users.referralCode, commissionRate: schema.users.commissionRate,
          commissionBalance: schema.users.commissionBalance, isConsignmentAllowed: schema.users.isConsignmentAllowed,
          outstandingDebt: schema.users.outstandingDebt, wholesaleEligibility: schema.users.wholesaleEligibility,
          wholesaleApprovedAt: schema.users.wholesaleApprovedAt, createdAt: schema.users.createdAt, updatedAt: schema.users.updatedAt,
        })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Error getting user by ID:', { userId, error });
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'> | null> {
    try {
      const lowerCaseEmail = email.toLowerCase();
      const result = await db.select({
          id: schema.users.id, email: schema.users.email, name: schema.users.name, role: schema.users.role,
          status: schema.users.status, referralCode: schema.users.referralCode, commissionRate: schema.users.commissionRate,
          commissionBalance: schema.users.commissionBalance, isConsignmentAllowed: schema.users.isConsignmentAllowed,
          outstandingDebt: schema.users.outstandingDebt, wholesaleEligibility: schema.users.wholesaleEligibility,
          wholesaleApprovedAt: schema.users.wholesaleApprovedAt, createdAt: schema.users.createdAt, updatedAt: schema.users.updatedAt,
        })
        .from(schema.users)
        .where(eq(schema.users.email, lowerCaseEmail))
        .limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Error getting user by email:', { email, error });
      throw error;
    }
  }

  private async getUserWithPasswordByEmail(email: string): Promise<UserWithPasswordHash | null> {
    try {
      const lowerCaseEmail = email.toLowerCase();
      const result = await db.query.users.findFirst({
        where: eq(schema.users.email, lowerCaseEmail),
      });
      return result ? (result as UserWithPasswordHash) : null;
    } catch (error) {
      logger.error('Error getting user with password by email:', { email, error });
      throw error;
    }
  }

  private async getUserPasswordHashById(userId: string): Promise<string | null> {
    try {
      const result = await db.query.users.findFirst({
        columns: { passwordHash: true },
        where: eq(schema.users.id, userId),
      });
      return result?.passwordHash || null;
    } catch (error) {
      logger.error('Error getting user password hash by ID:', { userId, error });
      throw error;
    }
  }

  async createUser(params: CreateUserParams): Promise<Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'>> {
    const { email, password, name, role = 'Customer' } = params;
    // const { referralCodeUsed } = params; // TODO: Accept this
    try {
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) throw new Error('Email already in use');

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      const userId = uuidv4();
      const referralCode = `${name.substring(0, 2).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      let referredById: string | null = null;

      // TODO: Validate referralCodeUsed and find referrer ID
      // if (referralCodeUsed) { ... find user by referral code, set referredById ... }

      const newUser: typeof schema.users.$inferInsert = {
          id: userId, email: email.toLowerCase(), name, passwordHash, role,
          status: 'Active', referralCode, referredBy: referredById,
          commissionBalance: '0.00', isConsignmentAllowed: false, outstandingDebt: '0.00', wholesaleEligibility: false,
      };

      const result = await db.insert(schema.users).values(newUser).returning({
          id: schema.users.id, email: schema.users.email, name: schema.users.name, role: schema.users.role,
          status: schema.users.status, referralCode: schema.users.referralCode, commissionRate: schema.users.commissionRate,
          commissionBalance: schema.users.commissionBalance, isConsignmentAllowed: schema.users.isConsignmentAllowed,
          outstandingDebt: schema.users.outstandingDebt, wholesaleEligibility: schema.users.wholesaleEligibility,
          wholesaleApprovedAt: schema.users.wholesaleApprovedAt, createdAt: schema.users.createdAt, updatedAt: schema.users.updatedAt,
        });
      if (result.length === 0) throw new Error('Failed to create user after insert.');
      return result[0];
    } catch (error) {
      logger.error('Error creating user:', { email, error });
      throw error;
    }
  }

  async updateUser(userId: string, params: UpdateUserParams): Promise<Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'>> {
    const { name, email, status, role } = params;
    const updates: Partial<typeof schema.users.$inferInsert> = {};
    if (name !== undefined) updates.name = name;
    if (status !== undefined) updates.status = status;
    if (role !== undefined) updates.role = role;
    updates.updatedAt = new Date();
    try {
      if (email) {
        const lowerCaseEmail = email.toLowerCase();
        const existingUser = await this.getUserByEmail(lowerCaseEmail);
        if (existingUser && existingUser.id !== userId) throw new Error('Email already in use by another user');
        updates.email = lowerCaseEmail;
      }
      if (Object.keys(updates).length <= 1) {
        const currentUser = await this.getUserById(userId);
        if (!currentUser) throw new Error('User not found when checking for update');
        return currentUser;
      }
      const result = await db.update(schema.users).set(updates).where(eq(schema.users.id, userId)).returning({
          id: schema.users.id, email: schema.users.email, name: schema.users.name, role: schema.users.role,
          status: schema.users.status, referralCode: schema.users.referralCode, commissionRate: schema.users.commissionRate,
          commissionBalance: schema.users.commissionBalance, isConsignmentAllowed: schema.users.isConsignmentAllowed,
          outstandingDebt: schema.users.outstandingDebt, wholesaleEligibility: schema.users.wholesaleEligibility,
          wholesaleApprovedAt: schema.users.wholesaleApprovedAt, createdAt: schema.users.createdAt, updatedAt: schema.users.updatedAt,
        });
      if (result.length === 0) throw new Error('User not found or update failed');
      return result[0];
    } catch (error) {
      logger.error('Error updating user:', { userId, error });
      throw error;
    }
  }

  async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      const user = await this.getUserWithPasswordByEmail(email);
      if (!user || !user.passwordHash) return { success: false, message: 'Invalid credentials' };
      if (user.status !== 'Active') return { success: false, message: 'Account is not active' };
      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) return { success: false, message: 'Invalid credentials' };
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        logger.error('JWT_SECRET environment variable is not set during authentication');
        throw new Error('Authentication configuration error.');
      }
      const payload = { userId: user.id, email: user.email, role: user.role };
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });
      const { passwordHash, referredBy, wholesaleApprovedBy, ...userWithoutSensitiveData } = user;
      return { success: true, user: userWithoutSensitiveData, token };
    } catch (error) {
      logger.error('Error authenticating user:', { email, error });
      return { success: false, message: 'Authentication failed due to an internal error' };
    }
  }

  async changePassword(params: ChangePasswordParams): Promise<{ success: boolean; message: string }> {
    const { userId, currentPassword, newPassword } = params;
    try {
      const currentPasswordHash = await this.getUserPasswordHashById(userId);
      if (!currentPasswordHash) return { success: false, message: 'User not found' };
      const passwordMatches = await bcrypt.compare(currentPassword, currentPasswordHash);
      if (!passwordMatches) return { success: false, message: 'Current password is incorrect' };
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      await db.update(schema.users).set({ passwordHash: newPasswordHash, updatedAt: new Date() }).where(eq(schema.users.id, userId));
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Error changing password:', { userId, error });
      return { success: false, message: 'Failed to change password due to an internal error' };
    }
  }

  async listUsers(options: { page?: number; limit?: number; role?: UserRole; status?: string; search?: string; }): Promise<ListUsersResult> {
    const { page = 1, limit = 20, role, status, search } = options;
    try {
      const offset = (page - 1) * limit;
      const conditions = [];
      if (role) conditions.push(eq(schema.users.role, role));
      if (status) conditions.push(eq(schema.users.status, status));
      if (search) conditions.push(or(ilike(schema.users.name, `%${search}%`), ilike(schema.users.email, `%${search}%`)));
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const selectFields = {
        id: schema.users.id, email: schema.users.email, name: schema.users.name, role: schema.users.role,
        status: schema.users.status, referralCode: schema.users.referralCode, commissionRate: schema.users.commissionRate,
        commissionBalance: schema.users.commissionBalance, isConsignmentAllowed: schema.users.isConsignmentAllowed,
        outstandingDebt: schema.users.outstandingDebt, wholesaleEligibility: schema.users.wholesaleEligibility,
        wholesaleApprovedAt: schema.users.wholesaleApprovedAt, createdAt: schema.users.createdAt, updatedAt: schema.users.updatedAt,
      };
      const usersQuery = db.select(selectFields).from(schema.users).where(whereClause).orderBy(desc(schema.users.createdAt)).limit(limit).offset(offset);
      const countQuery = db.select({ total: count() }).from(schema.users).where(whereClause);
      const [usersResult, countResult] = await Promise.all([usersQuery, countQuery]);
      const total = countResult[0].total;
      return {
        users: usersResult,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('Error listing users:', { options, error });
      throw error;
    }
  }

  async applyForWholesale(userId: string, applicationData: { company_name: string; tax_id: string; business_type: string; address: object; phone: string; website?: string; notes?: string; }): Promise<ApplyWholesaleResult> {
    try {
      const result = await db.transaction(async (tx) => {
        const existingApplications = await tx.select({ status: schema.wholesaleApplications.status }).from(schema.wholesaleApplications).where(eq(schema.wholesaleApplications.userId, userId));
        const pendingOrApproved = existingApplications.find(app => ['Pending', 'Approved'].includes(app.status));
        if (pendingOrApproved) throw new Error(`Application already ${pendingOrApproved.status.toLowerCase()}`);
        const applicationId = uuidv4();
        const insertResult = await tx.insert(schema.wholesaleApplications).values({
            id: applicationId, userId: userId, companyName: applicationData.company_name, taxId: applicationData.tax_id,
            businessType: applicationData.business_type, address: applicationData.address, phone: applicationData.phone,
            website: applicationData.website || null, notes: applicationData.notes || null, status: 'Pending',
          }).returning({ id: schema.wholesaleApplications.id });
        if (insertResult.length === 0) throw new Error("Failed to insert wholesale application record.");
        return { success: true, applicationId: insertResult[0].id };
      });
      logger.info('Wholesale application submitted successfully', { userId, applicationId: result.applicationId });
      return result;
    } catch (error) {
      logger.error('Error applying for wholesale account:', { userId, error });
      if (error instanceof Error && error.message.startsWith('Application already')) {
        return { success: false, message: error.message };
      }
      throw new Error('Failed to submit wholesale application due to an internal error.');
    }
  }
}

export const userService = new UserService();
