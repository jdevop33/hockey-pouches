// app/lib/services/user-service.ts
import { db, sql } from '@/lib/db'; // Keep db and sql import
 // Specific import from upstream
import { users } from '@/lib/schema/users';
import { referrals } from '@/lib/schema/referrals';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep wildcard for enums/other
import { eq, desc } from 'drizzle-orm'; // Keep eq operator and add desc
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
              where: eq(users.id, userId) // Use imported table alias
          });
          if (!user) {
              logger.warn('User not found by ID', { userId });
              return null;
          }
          logger.debug('User found by ID', { userId });
          return excludeSensitiveFields(user);
      } catch (error) {
          logger.error('Error fetching user by ID', { userId }, error);
          throw new Error('Database error retrieving user.');
      }
  }
  async getUserByEmail(email: string): Promise<UserPublicSelect | null> {
      try {
          logger.debug('Fetching user by email', { email });
          const user = await db.query.users.findFirst({
              where: eq(users.email, email.toLowerCase())
          });
           if (!user) {
              logger.debug('User not found by email', { email });
              return null;
           }
          logger.debug('User found by email', { email });
          return excludeSensitiveFields(user);
      } catch (error) {
          logger.error('Error fetching user by email', { email }, error);
          throw new Error('Database error retrieving user.');
      }
  }
  private async getUserWithPasswordByEmail(email: string): Promise<UserWithPasswordHash | null> {
      try {
          logger.debug('Fetching user with password hash by email', { email });
          const user = await db.query.users.findFirst({
              where: eq(users.email, email.toLowerCase())
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
          logger.error('Error fetching user with password hash by email', { email }, error);
          throw new Error('Database error retrieving user data.');
      }
  }
  private async getUserPasswordHashById(userId: string): Promise<string | null> {
    try {
      logger.debug('Fetching user password hash by ID', { userId });

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { passwordHash: true }
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
      logger.error('Error fetching user password hash by ID', { userId }, error);
      return null;
    }
  }
  async createUser(params: CreateUserParams): Promise<UserPublicSelect | null> {
    try {
      logger.info('Creating new user', { email: params.email, role: params.role });

      // Check if email already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, params.email.toLowerCase())
      });

      if (existingUser) {
        logger.warn('User creation failed: Email already exists', { email: params.email });
        throw new Error('Email already in use');
      }

      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(params.password, saltRounds);

      // Generate a unique referral code
      const referralCode = `${params.name.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

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
          columns: { id: true }
        });

        if (referrer) {
          referredBy = referrer.id;
        } else {
          logger.warn('Invalid referral code provided', { referralCode: params.referredByCode });
        }
      }

      // Insert the new user
      const insertedUsers = await db.insert(users).values({
        id: uuidv4(),
        email: params.email.toLowerCase(),
        name: params.name,
        passwordHash,
        role,
        status,
        referralCode,
        referredBy
      }).returning();

      if (!insertedUsers || insertedUsers.length === 0) {
        throw new Error('Failed to create user');
      }

      const newUser = insertedUsers[0];

      // If user was referred, create a referral record
      if (referredBy) {
        await db.insert(referrals).values({
          id: uuidv4(),
          referrerId: referredBy,
          referredUserId: newUser.id,
          email: newUser.email,
          referralCode: newUser.referralCode || '',
          status: 'Active'
        });

        logger.info('Created referral record', {
          referrerId: referredBy,
          referredId: newUser.id
        });
      }

      // If role is Distributor, create a task for admin to review
      if (role === 'Distributor') {
        // Create a task for admin to review the distributor application
        // This would typically use a task service or direct DB insert
        logger.info('Distributor role requested, admin review required', { userId: newUser.id });
        // TODO: Create task for admin review
      }

      logger.info('User created successfully', { userId: newUser.id, email: newUser.email });
      return excludeSensitiveFields(newUser);
    } catch (error) {
      logger.error('Error creating user', { params: { ...params, password: '[REDACTED]' } }, error);

      // Rethrow specific errors that should be handled by the caller
      if (error instanceof Error && error.message === 'Email already in use') {
        throw error;
      }

      throw new Error('Failed to create user');
    }
  }
  async updateUser(userId: string, params: UpdateUserParams): Promise<UserPublicSelect | null> {
    try {
      logger.info('Updating user', { userId, params });

      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId)
      });

      if (!existingUser) {
        logger.warn('User update failed: User not found', { userId });
        throw new Error('User not found');
      }

      // Check if email is being changed and if it's already in use
      if (params.email && params.email.toLowerCase() !== existingUser.email) {
        const emailExists = await db.query.users.findFirst({
          where: eq(users.email, params.email.toLowerCase())
        });

        if (emailExists) {
          logger.warn('User update failed: Email already in use', { email: params.email });
          throw new Error('Email already in use');
        }
      }

      // Prepare update data
      const updateData: Partial<UserSelect> = {
        updatedAt: new Date()
      };

      if (params.name) updateData.name = params.name;
      if (params.email) updateData.email = params.email.toLowerCase();
      if (params.status) updateData.status = params.status;
      if (params.role) updateData.role = params.role;

      // Update the user
      const updatedUsers = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUsers || updatedUsers.length === 0) {
        throw new Error('Failed to update user');
      }

      const updatedUser = updatedUsers[0];

      // If role was changed to Distributor and status is not already set
      if (params.role === 'Distributor' && existingUser.role !== 'Distributor' && !params.status) {
        // Set status to Pending and create a task for admin
        await db
          .update(users)
          .set({ status: 'Pending' })
          .where(eq(users.id, userId));

        logger.info('User role changed to Distributor, admin review required', { userId });
        // TODO: Create task for admin review
      }

      logger.info('User updated successfully', { userId });
      return excludeSensitiveFields(updatedUser);
    } catch (error) {
      logger.error('Error updating user', { userId, params }, error);

      // Rethrow specific errors that should be handled by the caller
      if (error instanceof Error &&
          (error.message === 'User not found' || error.message === 'Email already in use')) {
        throw error;
      }

      throw new Error('Failed to update user');
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
               logger.warn('Authentication failed: User account not active', { email, status: user.status });
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
          return {
              success: true,
              user: excludeSensitiveFields(user), // Keep fix
              token: accessToken,
              refreshToken: refreshToken,
              message: 'Authentication successful.',
          };
      } catch (error) {
          logger.error('Error during authentication process', { email }, error);
          return { success: false, message: 'An internal error occurred during authentication.' };
      }
  }
  async changePassword(params: ChangePasswordParams): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Changing user password', { userId: params.userId });

      // Get the current password hash
      const currentPasswordHash = await this.getUserPasswordHashById(params.userId);

      if (!currentPasswordHash) {
        logger.warn('Password change failed: User not found or no password hash', { userId: params.userId });
        return { success: false, message: 'User not found or password not set' };
      }

      // Verify the current password
      const isCurrentPasswordValid = await bcrypt.compare(params.currentPassword, currentPasswordHash);

      if (!isCurrentPasswordValid) {
        logger.warn('Password change failed: Current password is incorrect', { userId: params.userId });
        return { success: false, message: 'Current password is incorrect' };
      }

      // Hash the new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(params.newPassword, saltRounds);

      // Update the user's password
      const updatedUsers = await db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date()
        })
        .where(eq(users.id, params.userId))
        .returning();

      if (!updatedUsers || updatedUsers.length === 0) {
        throw new Error('Failed to update password');
      }

      logger.info('Password changed successfully', {
        userId: params.userId
      });

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Error changing password', { userId: params.userId }, error);
      return { success: false, message: 'An error occurred while changing the password' };
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
        sortOrder = 'desc'
      } = options;

      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [];

      if (role) {
        conditions.push(eq(users.role, role));
      }

      if (status) {
        conditions.push(eq(users.status, status));
      }

      if (search) {
        conditions.push(
          sql`(${users.name} ILIKE ${'%' + search + '%'} OR ${users.email} ILIKE ${'%' + search + '%'})`
        );
      }

      // Build and execute the query in one step to avoid type issues
      // This approach uses a single SQL statement with all conditions applied
      const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

      // Determine the ORDER BY clause based on sortBy and sortOrder
      let orderByClause;
      if (sortBy === 'name') {
        orderByClause = sortOrder === 'asc' ? users.name : sql`${users.name} DESC`;
      } else if (sortBy === 'email') {
        orderByClause = sortOrder === 'asc' ? users.email : sql`${users.email} DESC`;
      } else if (sortBy === 'role') {
        orderByClause = sortOrder === 'asc' ? users.role : sql`${users.role} DESC`;
      } else if (sortBy === 'status') {
        orderByClause = sortOrder === 'asc' ? users.status : sql`${users.status} DESC`;
      } else {
        // Default to createdAt
        orderByClause = sortOrder === 'asc' ? users.createdAt : sql`${users.createdAt} DESC`;
      }

      // Execute the query with all conditions applied at once
      const usersList = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        referralCode: users.referralCode,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

      // Get total count for pagination using the same approach
      // Execute the count query with conditions applied at once
      const countResult = await db.select({
        count: sql<number>`COUNT(*)`
      })
      .from(users)
      .where(whereClause);
      const total = countResult[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      logger.info('Users list retrieved successfully', {
        count: usersList.length,
        total,
        page,
        totalPages
      });

      return {
        users: usersList,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Error listing users', { options }, error);
      return {
        users: [],
        pagination: {
          total: 0,
          page: options.page || 1,
          limit: options.limit || 10,
          totalPages: 0
        }
      };
    }
  }
  // Apply for wholesale account
  async applyForWholesale(userId: string, params: ApplyWholesaleParams): Promise<ApplyWholesaleResult> {
    try {
      logger.info('Processing wholesale application', { userId, params });

      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { id: true, role: true, status: true }
      });

      if (!user) {
        logger.warn('Wholesale application failed: User not found', { userId });
        return { success: false, message: 'User not found' };
      }

      // Validate required fields
      if (!params.company_name) {
        logger.warn('Wholesale application failed: Missing company name', { userId });
        return { success: false, message: 'Company name is required' };
      }

      // Create a wholesale application record
      // Note: In a real implementation, this would insert into a wholesale_applications table
      // For now, we'll update the user record directly

      // Update user role to Distributor and status to Pending
      const updatedUsers = await db
        .update(users)
        .set({
          role: 'Distributor',
          status: 'Pending',
          updatedAt: new Date()
          // Note: wholesaleData field doesn't exist in the schema
          // In a real implementation, this would be in a separate table
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUsers || updatedUsers.length === 0) {
        throw new Error('Failed to update user for wholesale application');
      }

      // Create a task for admin to review the application
      // This would typically use a task service or direct DB insert
      logger.info('Wholesale application submitted, admin review required', { userId });
      // TODO: Create task for admin review

      logger.info('Wholesale application processed successfully', { userId });

      return {
        success: true,
        applicationId: userId, // Using userId as the application ID for simplicity
        message: 'Wholesale application submitted successfully. Your application is pending review.'
      };
    } catch (error) {
      logger.error('Error processing wholesale application', { userId, params }, error);
      return { success: false, message: 'An error occurred while processing your wholesale application' };
    }
  }
  async regenerateReferralCode(userId: string): Promise<string | null> {
    try {
      logger.info('Regenerating referral code for user', { userId });

      // Check if user exists
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { name: true }
      });

      if (!user) {
        logger.warn('Referral code regeneration failed: User not found', { userId });
        return null;
      }

      // Generate a new unique referral code
      const newReferralCode = `${user.name.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // Update the user's referral code
      const updatedUsers = await db
        .update(users)
        .set({
          referralCode: newReferralCode,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning({ referralCode: users.referralCode });

      if (!updatedUsers || updatedUsers.length === 0) {
        throw new Error('Failed to update referral code');
      }

      const updatedReferralCode = updatedUsers[0].referralCode;

      logger.info('Referral code regenerated successfully', {
        userId,
        newReferralCode: updatedReferralCode
      });

      return updatedReferralCode;
    } catch (error) {
      logger.error('Error regenerating referral code', { userId }, error);
      return null;
    }
  }
  // Get referrals made by a user
  async getReferrals(userId: string, options: ListReferralsOptions = {}): Promise<ReferralListResult> {
    try {
      logger.info('Getting referrals for user', { userId, options });

      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      // Check if user exists
      const userExists = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { id: true }
      });

      if (!userExists) {
        logger.warn('Get referrals failed: User not found', { userId });
        return { referrals: [], pagination: { total: 0, page, limit, totalPages: 0 } };
      }

      // Get referrals with user details
      const referralsQuery = db
        .select({
          id: referrals.id,
          name: users.name,
          email: users.email,
          createdAt: referrals.createdAt,
          status: referrals.status
        })
        .from(referrals)
        .innerJoin(users, eq(referrals.referredUserId, users.id))
        .where(eq(referrals.referrerId, userId))
        .orderBy(desc(referrals.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`COUNT(*)` })
        .from(referrals)
        .where(eq(referrals.referrerId, userId));

      // Execute both queries
      const [referralsList, countResult] = await Promise.all([referralsQuery, countQuery]);

      const total = countResult[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      logger.info('Referrals retrieved successfully', {
        userId,
        count: referralsList.length,
        total
      });

      return {
        referrals: referralsList,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Error getting referrals', { userId, options }, error);
      const { page = 1, limit = 10 } = options;
      return { referrals: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }
  }
  async getUserFromRefreshToken(refreshToken: string): Promise<{ id: string; email: string; role: string } | null> {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET environment variable is not set!');
      throw new Error('Server configuration error');
    }
    try {
      const decoded = jwt.verify(refreshToken, jwtSecret) as { userId: string; tokenVersion?: number; };
      const user = await this.getUserById(decoded.userId); // Uses fixed version
      if (!user) {
        logger.warn(`User not found for refresh token: ${decoded.userId}`);
        return null;
      }
      // Optional: Check token version
      // const dbUser = await db.query.users.findFirst({ where: eq(users.id, decoded.userId), columns: { tokenVersion: true } });
      // if (dbUser && dbUser.tokenVersion !== decoded.tokenVersion) { ... }
      return { id: user.id, email: user.email, role: user.role };
    } catch (error) {
      logger.warn('Failed to verify refresh token', {}, error);
      return null;
    }
  }
}
export const userService = new UserService();
