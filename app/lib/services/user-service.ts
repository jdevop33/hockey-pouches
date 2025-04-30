// app/lib/services/user-service.ts
import { db, sql } from '@/lib/db'; // Keep db and sql import
import { users } from '@/lib/schema/users'; // Specific import from upstream
import * as schema from '@/lib/schema'; // Keep wildcard for enums/other
import { eq } from 'drizzle-orm'; // Keep eq operator
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Keep bcrypt import
import { v4 as uuidv4 } from 'uuid'; // Keep uuid import
import { logger } from '../logger'; // Keep logger import
import { generateAccessToken, generateRefreshToken } from '@/lib/auth'; // Keep token util import

// --- Export needed Types (Keep updated types from stash) ---
export type UserSelect = typeof schema.users.$inferSelect;
export type UserRole = (typeof schema.userRoleEnum.enumValues)[number];
type UserPublicSelect = Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy' | 'emailVerified' | 'verificationToken' | 'passwordResetToken' | 'passwordResetExpires' | 'tokenVersion'>;
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
export interface ListUsersResult {
  users: UserPublicSelect[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}
export interface ApplyWholesaleParams {
  company_name: string;
  business_number?: string | null;
  website?: string | null;
  phone_number?: string | null;
  address?: any;
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
        passwordHash,
        referredBy,
        wholesaleApprovedBy,
        tokenVersion,
        // Add any other potentially sensitive fields here if they exist in UserSelect
        // Example placeholders:
        // emailVerified,
        // verificationToken,
        // passwordResetToken,
        // passwordResetExpires,
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

  private async getUserPasswordHashById(_userId: string): Promise<string | null> {
    logger.warn('getUserPasswordHashById not fully implemented');
    return null;
  }

  async createUser(params: CreateUserParams): Promise<UserPublicSelect> {
    logger.warn('createUser not fully implemented');
    throw new Error('createUser not implemented');
  }

  async updateUser(userId: string, params: UpdateUserParams): Promise<UserPublicSelect> {
    logger.warn('updateUser not fully implemented');
    throw new Error('updateUser not implemented');
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
          if (user.status !== schema.userStatusEnum.Active) {
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
    logger.warn('changePassword not fully implemented');
    return { success: false, message: 'Password change not implemented' };
  }

  async listUsers(options: ListUsersOptions = {}): Promise<ListUsersResult> {
     logger.warn('listUsers not fully implemented');
     return { users: [], pagination: { total: 0, page: 1, limit: options.limit || 10, totalPages: 0 } };
  }

  // Keep updated signature from stash
  async applyForWholesale(userId: string, params: ApplyWholesaleParams): Promise<ApplyWholesaleResult> {
    logger.warn('applyForWholesale not fully implemented', { userId, params });
    return { success: false, message: 'Wholesale application not implemented' };
  }

  async regenerateReferralCode(userId: string): Promise<string | null> {
    logger.warn('regenerateReferralCode not fully implemented');
    return null;
  }

  // Keep updated signature from stash
  async getReferrals(userId: string, options: ListReferralsOptions = {}): Promise<ReferralListResult> {
    logger.warn('getReferrals not fully implemented', { userId, options });
    const { page = 1, limit = 10 } = options;
    return { referrals: [], pagination: { total: 0, page, limit, totalPages: 0 } };
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
