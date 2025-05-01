// app/lib/services/user-service.ts
import { db, sql } from '@/lib/db'; // Keep db and sql import
// Specific import from upstream
import { users } from '@/lib/schema/users';
import { referrals } from '@/lib/schema/referrals';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep wildcard for enums/other
import { eq, desc, count, and, gt, lte } from 'drizzle-orm'; // Keep eq operator and add desc, sql, count, and, gt, lte
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Keep bcrypt import
import { v4 as uuidv4 } from 'uuid'; // Keep uuid import
import { logger } from '../logger'; // Keep logger import
import { generateAccessToken, generateRefreshToken } from '@/lib/auth'; // Keep token util import
// --- Export needed Types (Keep updated types from stash) ---
export type UserSelect = typeof schema.users.$inferSelect;
export type UserRole = (typeof schema.userRoleEnum.enumValues)[number];
type UserPublicSelect = Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'>;
type UserWithPasswordHash = UserSelect;
export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  referredByCode?: string | null;
}
export interface UpdateUserParams {
  name?: string;
  email?: string;
  status?: (typeof schema.userStatusEnum.enumValues)[number];
  role?: UserRole;
}
export interface AuthResult {
  success: boolean;
  user?: UserPublicSelect | null; // Allow null based on excludeSensitiveFields return type
  token?: string;
  message?: string;
  refreshToken?: string;
}
export interface ChangePasswordParams {
  userId: string;
  currentPassword: string;
  newPassword: string;
}
export interface ListUsersOptions {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: string;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'role' | 'status';
  sortOrder?: 'asc' | 'desc';
}
// Define a simplified user type for list results to avoid type errors
export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  referralCode: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ListUsersResult {
  users: UserListItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
export interface ApplyWholesaleParams {
  company_name: string;
  business_number?: string | null;
  website?: string | null;
  phone_number?: string | null;
  address?: unknown;
  notes?: string | null;
}
export interface ApplyWholesaleResult {
  success: boolean;
  applicationId?: string;
  message?: string;
}
export interface ListReferralsOptions {
  page?: number;
  limit?: number;
}
export interface Referral {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date | null;
  status: string | null;
}
export interface ReferralListResult {
  referrals: Referral[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
// Helper function to exclude sensitive fields (Keep updated from stash)
function excludeSensitiveFields(user: UserSelect | null): UserPublicSelect | null {
  if (!user) return null;
  // Destructure ALL fields defined in the schema to ensure nothing is missed
  const {
    // Prefix with underscore to indicate intentionally unused variables
    passwordHash: _passwordHash,
    referredBy: _referredBy,
    wholesaleApprovedBy: _wholesaleApprovedBy,
    // Add any other potentially sensitive fields here if they exist in UserSelect
    ...publicData
  } = user;
  return publicData as UserPublicSelect; // Cast after explicitly removing fields
}
// --- UserService Class (Keep implementations from stash) ---
export class UserService {
  async getUserById(userId: string): Promise<UserPublicSelect | null> {
    try {
      logger.debug('Fetching user by ID', { userId });
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId), // Use imported table alias
      });
      if (!user) {
        logger.warn('User not found by ID', { userId });
        return null;
      }
      logger.debug('User found by ID', { userId });
      return excludeSensitiveFields(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching user by ID', { userId }, error);
      throw new Error('Database error retrieving user.');
    }
  }
  async getUserByEmail(email: string): Promise<UserPublicSelect | null> {
    try {
      logger.debug('Fetching user by email', { email });
      const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });
      if (!user) {
        logger.debug('User not found by email', { email });
        return null;
      }
      logger.debug('User found by email', { email });
      return excludeSensitiveFields(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching user by email', { email }, error);
      throw new Error('Database error retrieving user.');
    }
  }
  private async getUserWithPasswordByEmail(email: string): Promise<UserWithPasswordHash | null> {
    try {
      logger.debug('Fetching user with password hash by email', { email });
      const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });
      if (!user) {
        logger.debug('User with password hash not found by email', { email });
        return null;
      }
      logger.debug('User with password hash found by email', { email });
      if (typeof user.passwordHash !== 'string') {
        logger.error('Password hash missing from user object', { userId: user.id });
        return null;
      }
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching user with password hash by email', { email }, error);
      throw new Error('Database error retrieving user data.');
    }
  }
  private async getUserPasswordHashById(userId: string): Promise<string | null> {
    try {
      logger.debug('Fetching user password hash by ID', { userId });

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { passwordHash: true },
      });

      if (!user) {
        logger.warn('User not found when fetching password hash', { userId });
        return null;
      }

      if (!user.passwordHash) {
        logger.warn('Password hash is missing for user', { userId });
        return null;
      }

      return user.passwordHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching user password hash by ID', { userId }, error);
      return null;
    }
  }
  async createUser(params: CreateUserParams): Promise<UserPublicSelect | null> {
    try {
      logger.info('Creating new user', { email: params.email, role: params.role });

      // Check if email already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, params.email.toLowerCase()),
      });

      if (existingUser) {
        logger.warn('User creation failed: Email already exists', { email: params.email });
        throw new Error('Email already in use');
      }

      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(params.password, saltRounds);

      // Generate a unique referral code
      const referralCode = `${params.name.substring(0, 3).toUpperCase()}${Math.floor(
        Math.random() * 10000
      )
        .toString()
        .padStart(4, '0')}`;

      // Set default role if not provided
      const role = params.role || 'Customer';

      // Set default status based on role
      let status = 'Active';
      if (role === 'Distributor') {
        status = 'Pending';
      }

      // Handle referral if provided
      let referredBy = null;
      if (params.referredByCode) {
        const referrer = await db.query.users.findFirst({
          where: eq(users.referralCode, params.referredByCode),
          columns: { id: true },
        });

        if (referrer) {
          referredBy = referrer.id;
          logger.info('Referrer found', {
            referrerId: referredBy,
            referredByCode: params.referredByCode,
          });
        } else {
          logger.warn('Referrer code provided but no matching user found', {
            referredByCode: params.referredByCode,
          });
          // Decide if this should be an error or just ignore the referral code
          // For now, we'll ignore it and proceed with user creation
        }
      }

      const newUser = {
        id: uuidv4(),
        name: params.name,
        email: params.email.toLowerCase(),
        passwordHash,
        role,
        status,
        referralCode,
        referredBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(users).values(newUser);

      logger.info('User created successfully', { userId: newUser.id });

      // Potentially create task for admin review if Distributor
      if (role === 'Distributor') {
        // TODO: Integrate with TaskService
        logger.info('Distributor requires admin review', { userId: newUser.id });
      }

      return excludeSensitiveFields(newUser as UserSelect); // Cast to satisfy input type
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // Log redacted params
      logger.error('Error creating user', { params: { ...params, password: '[REDACTED]' } }, error);
      throw new Error(errorMessage || 'Failed to create user.');
    }
  }
  async updateUser(userId: string, params: UpdateUserParams): Promise<UserPublicSelect | null> {
    try {
      logger.info('Updating user', { userId, params });

      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!existingUser) {
        logger.warn('User update failed: User not found', { userId });
        return null;
      }

      // Check if email is being updated and if the new email already exists
      if (params.email && params.email.toLowerCase() !== existingUser.email) {
        const emailExists = await db.query.users.findFirst({
          where: eq(users.email, params.email.toLowerCase()),
        });
        if (emailExists) {
          logger.warn('User update failed: Email already in use', { email: params.email });
          throw new Error('Email already in use');
        }
      }

      const updateData: Partial<Omit<UserSelect, 'id' | 'createdAt' | 'passwordHash'>> = {
        updatedAt: new Date(),
      };

      if (params.name) updateData.name = params.name;
      if (params.email) updateData.email = params.email.toLowerCase();
      if (params.status) updateData.status = params.status;
      if (params.role) updateData.role = params.role;

      if (Object.keys(updateData).length === 1 && 'updatedAt' in updateData) {
        logger.info('No fields to update for user.', { userId });
        return excludeSensitiveFields(existingUser);
      }

      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        logger.error('User update failed after attempting DB operation.', { userId });
        return null; // Should ideally not happen if existingUser was found
      }

      // If role changed to Distributor and status isn't explicitly set, set status to Pending
      if (params.role === 'Distributor' && existingUser.role !== 'Distributor' && !params.status) {
        await db
          .update(users)
          .set({ status: 'Pending', updatedAt: new Date() })
          .where(eq(users.id, userId));
        updatedUser.status = 'Pending'; // Reflect change locally
        logger.info('User role changed to Distributor, admin review required', { userId });
        // TODO: Create admin task
      }

      logger.info('User updated successfully', { userId });
      return excludeSensitiveFields(updatedUser);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error updating user', { userId, params }, error);
      throw new Error(errorMessage || 'Failed to update user.');
    }
  }
  async authenticate(email: string, password: string): Promise<AuthResult> {
    logger.info('Attempting authentication', { email });
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET environment variable is not set!');
      return { success: false, message: 'Authentication configuration error.' };
    }
    try {
      const user = await this.getUserWithPasswordByEmail(email);
      if (!user) {
        logger.warn('Authentication failed: User not found', { email });
        return { success: false, message: 'Invalid credentials.' };
      }
      if (user.status !== 'Active') {
        logger.warn('Authentication failed: User account not active', {
          email,
          status: user.status,
        });
        return { success: false, message: `Account is ${user.status}. Please contact support.` };
      }
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        logger.warn('Authentication failed: Invalid password', { email });
        return { success: false, message: 'Invalid credentials.' };
      }
      logger.info('Authentication successful', { userId: user.id, email });
      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(user.id);

      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

      return {
        success: true,
        user: excludeSensitiveFields(user),
        token: accessToken,
        refreshToken: refreshToken,
        message: 'Authentication successful.',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error during authentication process', { email }, error);
      return { success: false, message: errorMessage || 'Authentication failed.' };
    }
  }
  async changePassword(
    params: ChangePasswordParams
  ): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Changing user password', { userId: params.userId });

      // Fetch the current password hash
      const currentPasswordHash = await this.getUserPasswordHashById(params.userId);

      if (!currentPasswordHash) {
        logger.warn('Password change failed: User not found or no password hash', {
          userId: params.userId,
        });
        return { success: false, message: 'User not found.' };
      }

      // Verify the current password
      const isCurrentPasswordValid = await bcrypt.compare(
        params.currentPassword,
        currentPasswordHash
      );

      if (!isCurrentPasswordValid) {
        logger.warn('Password change failed: Current password is incorrect', {
          userId: params.userId,
        });
        return { success: false, message: 'Current password incorrect.' };
      }

      // Hash the new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(params.newPassword, saltRounds);

      // Update the user's password hash
      await db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, params.userId));

      logger.info('Password changed successfully', { userId: params.userId });

      // TODO: Potentially invalidate sessions/tokens here

      return { success: true, message: 'Password changed successfully.' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error changing password', { userId: params.userId }, error);
      return { success: false, message: errorMessage || 'Failed to change password.' };
    }
  }
  async listUsers(options: ListUsersOptions = {}): Promise<ListUsersResult> {
    try {
      logger.info('Listing users with options', { options });

      const {
        page = 1,
        limit = 10,
        role,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const conditions = [];
      if (role) conditions.push(eq(users.role, role));
      if (status) conditions.push(eq(users.status, status));
      if (search) {
        const searchTerm = `%${search}%`;
        conditions.push(
          sql`(${users.name} ILIKE ${searchTerm} OR ${users.email} ILIKE ${searchTerm})`
        );
      }

      // Base query for data and count
      const baseQuery = db
        .select()
        .from(users)
        .where(sql.join(conditions, sql` AND `));

      // Apply sorting
      let orderByClause;
      const sortColumn = users[sortBy] || users.createdAt; // Default sort column
      orderByClause = sortOrder === 'asc' ? sortColumn : desc(sortColumn);

      // Fetch total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql.join(conditions, sql` AND `));
      const total = totalResult[0]?.count || 0;

      // Fetch paginated users
      const userList = await baseQuery
        .orderBy(orderByClause)
        .limit(limit)
        .offset((page - 1) * limit);

      // Use the simplified UserListItem type
      const simplifiedUsers: UserListItem[] = userList.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole, // Assume role is always valid UserRole here
        status: user.status, // Assume status is always valid UserStatus here
        referralCode: user.referralCode,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      logger.debug('Users listed successfully', { count: simplifiedUsers.length, total });

      return {
        users: simplifiedUsers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error listing users', { options }, error);
      // Return empty result on error
      return {
        users: [],
        pagination: {
          total: 0,
          page: options.page || 1,
          limit: options.limit || 10,
          totalPages: 0,
        },
      };
    }
  }
  async applyForWholesale(
    userId: string,
    params: ApplyWholesaleParams
  ): Promise<ApplyWholesaleResult> {
    try {
      logger.info('Processing wholesale application', { userId, params });

      // 1. Validate User Exists and is not already wholesale/pending
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { id: true, role: true, status: true }, // Select necessary fields
      });

      if (!user) {
        logger.warn('Wholesale application failed: User not found', { userId });
        return { success: false, message: 'User not found.' };
      }
      if (user.role === 'Wholesale' || user.status === 'Pending') {
        logger.warn('User already has wholesale status or application pending.', {
          userId,
          role: user.role,
          status: user.status,
        });
        return {
          success: false,
          message: 'Wholesale status already exists or application is pending.',
        };
      }

      // 2. Basic Validation (e.g., ensure company name is provided)
      if (!params.company_name) {
        logger.warn('Wholesale application failed: Missing company name', { userId });
        return { success: false, message: 'Company name is required.' };
      }

      // 3. Create Wholesale Application Record
      const [application] = await db
        .insert(schema.wholesaleApplications)
        .values({
          userId: userId,
          companyName: params.company_name,
          businessNumber: params.business_number,
          website: params.website,
          phoneNumber: params.phone_number,
          address: params.address ? JSON.stringify(params.address) : null, // Store address as JSON string
          notes: params.notes,
          status: 'Pending', // Default status
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning(); // Ensure returning() is used if needed elsewhere

      // 4. Update User Status to Pending
      await db
        .update(users)
        .set({
          status: 'Pending', // User is pending review
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // 5. Create Admin Task (Placeholder)
      // TODO: Integrate with TaskService to create a task for admin review
      // Example: await taskService.createTask({ type: 'WHOLESALE_REVIEW', referenceId: application.id, assignedTo: 'admin_group' });
      logger.info('Wholesale application submitted, admin review required', { userId });

      logger.info('Wholesale application processed successfully', { userId });

      return {
        success: true,
        applicationId: userId, // Using userId as the application ID for simplicity
        message: 'Wholesale application submitted successfully. Awaiting review.',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error processing wholesale application', { userId, params }, error);
      return { success: false, message: errorMessage || 'Failed to submit application.' };
    }
  }
  async regenerateReferralCode(userId: string): Promise<string | null> {
    try {
      logger.info('Regenerating referral code for user', { userId });

      // Fetch user to ensure they exist and get name for code generation
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { name: true }, // Only need name for generation
      });

      if (!user) {
        logger.warn('Referral code regeneration failed: User not found', { userId });
        return null;
      }

      // Generate a new unique referral code (simple example)
      // In production, ensure uniqueness by checking against existing codes
      const newReferralCode = `${user.name.substring(0, 3).toUpperCase()}${Math.floor(
        Math.random() * 10000
      )
        .toString()
        .padStart(4, '0')}`;

      // Update the user's referral code
      await db
        .update(users)
        .set({
          referralCode: newReferralCode,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      logger.info('Referral code regenerated successfully', {
        userId,
        newReferralCode,
      });

      return newReferralCode;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error regenerating referral code', { userId }, error);
      return null;
    }
  }
  async getReferrals(
    userId: string,
    options: ListReferralsOptions = {}
  ): Promise<ReferralListResult> {
    try {
      logger.info('Getting referrals for user', { userId, options });
      const { page = 1, limit = 10 } = options;

      // First, ensure the referrer (userId) exists
      const referrer = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { id: true },
      });

      if (!referrer) {
        logger.warn('Get referrals failed: User not found', { userId });
        throw new Error('User not found');
      }

      // Conditions for fetching referrals
      const conditions = [eq(referrals.referrerId, userId)];

      // Query to fetch referred users' details
      const baseQuery = db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
          status: users.status, // Get status of the referred user
        })
        .from(referrals)
        .innerJoin(users, eq(referrals.referredUserId, users.id))
        .where(eq(referrals.referrerId, userId));

      // Fetch total count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(referrals)
        .where(eq(referrals.referrerId, userId));
      const total = totalResult[0]?.count || 0;

      // Fetch paginated referrals
      const referralList: Referral[] = await baseQuery
        .orderBy(desc(users.createdAt)) // Order by referred user creation date
        .limit(limit)
        .offset((page - 1) * limit);

      logger.debug('Referrals fetched successfully', {
        userId,
        count: referralList.length,
        total,
      });

      return {
        referrals: referralList,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error getting referrals', { userId, options }, error);
      const { page = 1, limit = 10 } = options;
      return {
        referrals: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }
  }
  async getUserFromRefreshToken(
    refreshToken: string
  ): Promise<{ id: string; email: string; role: string } | null> {
    try {
      const jwtSecret = process.env.JWT_REFRESH_SECRET;
      if (!jwtSecret) {
        logger.error('JWT_REFRESH_SECRET environment variable is not set.');
        throw new Error('Server configuration error.');
      }

      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, jwtSecret) as {
        userId: string;
        tokenVersion?: number;
      };

      // TODO: Check token version against user's token version in DB if implementing revocation

      // Fetch user based on decoded ID
      const user = await this.getUserById(decoded.userId);

      if (!user) {
        logger.warn('User not found during refresh token validation', { userId: decoded.userId });
        return null;
      }
      // Return essential user details for generating new access token
      return { id: user.id, email: user.email, role: user.role };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error validating refresh token', { error: errorMessage });
      return null;
    }
  }
}
export const userService = new UserService();
