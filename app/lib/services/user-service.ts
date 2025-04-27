import sql from '@/lib/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { withTransaction } from '../dbConnectionPool';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithPasswordHash extends User {
  password_hash: string;
}

export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role?: string; // Optional, defaults to 'Customer'
}

export interface UpdateUserParams {
  name?: string;
  email?: string;
  status?: string;
  role?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface ChangePasswordParams {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  /**
   * Get user by ID
   * @param userId User ID
   * @returns User if found, null otherwise
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await sql`
        SELECT id, email, name, role, status, created_at, updated_at
        FROM users
        WHERE id = ${userId}
      `;

      if (result.length === 0) {
        return null;
      }

      return result[0] as User;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   * @param email User email
   * @returns User if found, null otherwise
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const lowerCaseEmail = email.toLowerCase();
      const result = await sql`
        SELECT id, email, name, role, status, created_at, updated_at
        FROM users
        WHERE email = ${lowerCaseEmail}
      `;

      if (result.length === 0) {
        return null;
      }

      return result[0] as User;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param params User creation parameters
   * @returns Created user
   */
  async createUser(params: CreateUserParams): Promise<User> {
    const { email, password, name, role = 'Customer' } = params;

    try {
      // Check if email already exists
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Email already in use');
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Generate user ID
      const userId = uuidv4();

      // Create user in database
      const result = await sql`
        INSERT INTO users (
          id, email, name, password_hash, role, status, created_at, updated_at
        ) VALUES (
          ${userId}, 
          ${email.toLowerCase()}, 
          ${name}, 
          ${passwordHash}, 
          ${role}, 
          'Active', 
          NOW(), 
          NOW()
        )
        RETURNING id, email, name, role, status, created_at, updated_at
      `;

      return result[0] as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user details
   * @param userId User ID
   * @param params Update parameters
   * @returns Updated user
   */
  async updateUser(userId: string, params: UpdateUserParams): Promise<User> {
    const { name, email, status, role } = params;

    try {
      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: string[] = [];

      if (name) {
        updateFields.push('name = $1');
        updateValues.push(name);
      }

      if (email) {
        // Check if email already exists for another user
        const existingUser = await this.getUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          throw new Error('Email already in use');
        }

        updateFields.push(`email = $${updateValues.length + 1}`);
        updateValues.push(email.toLowerCase());
      }

      if (status) {
        updateFields.push(`status = $${updateValues.length + 1}`);
        updateValues.push(status);
      }

      if (role) {
        updateFields.push(`role = $${updateValues.length + 1}`);
        updateValues.push(role);
      }

      if (updateFields.length === 0) {
        // Nothing to update
        return this.getUserById(userId) as Promise<User>;
      }

      // Add updated_at field
      updateFields.push(`updated_at = NOW()`);

      // Build and execute query
      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${updateValues.length + 1}
        RETURNING id, email, name, role, status, created_at, updated_at
      `;

      updateValues.push(userId);

      const result = await sql.query(query, updateValues);

      if (result.length === 0) {
        throw new Error('User not found');
      }

      return result[0] as User;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Authenticate user with email and password
   * @param email User email
   * @param password User password
   * @returns Authentication result
   */
  async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user by email
      const lowerCaseEmail = email.toLowerCase();
      const result = await sql`
        SELECT id, email, name, role, status, password_hash, created_at, updated_at
        FROM users
        WHERE email = ${lowerCaseEmail}
      `;

      if (result.length === 0) {
        return {
          success: false,
          message: 'Invalid credentials',
        };
      }

      const user = result[0] as UserWithPasswordHash;

      // Check if account is active
      if (user.status !== 'Active') {
        return {
          success: false,
          message: 'Account is not active',
        };
      }

      // Verify password
      const passwordMatches = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatches) {
        return {
          success: false,
          message: 'Invalid credentials',
        };
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not set');
      }

      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(payload, jwtSecret, {
        expiresIn: '1d', // Token expires in 1 day
      });

      // Remove password_hash from user object before returning
      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      return {
        success: true,
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return {
        success: false,
        message: 'Authentication failed',
      };
    }
  }

  /**
   * Change user password
   * @param params Password change parameters
   * @returns Success flag and message
   */
  async changePassword(
    params: ChangePasswordParams
  ): Promise<{ success: boolean; message: string }> {
    const { userId, currentPassword, newPassword } = params;

    try {
      // Get user with password hash
      const result = await sql`
        SELECT id, password_hash
        FROM users
        WHERE id = ${userId}
      `;

      if (result.length === 0) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const user = result[0] as { id: string; password_hash: string };

      // Verify current password
      const passwordMatches = await bcrypt.compare(currentPassword, user.password_hash);
      if (!passwordMatches) {
        return {
          success: false,
          message: 'Current password is incorrect',
        };
      }

      // Hash new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password in database
      await sql`
        UPDATE users
        SET password_hash = ${newPasswordHash}, updated_at = NOW()
        WHERE id = ${userId}
      `;

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        message: 'Failed to change password',
      };
    }
  }

  /**
   * List users with pagination and filtering
   * @param options Pagination and filtering options
   * @returns List of users and pagination metadata
   */
  async listUsers(options: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, role, status, search } = options;

    try {
      // Build dynamic query
      const conditions: string[] = [];
      const queryParams: string[] = [];

      if (role) {
        conditions.push(`role = $${queryParams.length + 1}`);
        queryParams.push(role);
      }

      if (status) {
        conditions.push(`status = $${queryParams.length + 1}`);
        queryParams.push(status);
      }

      if (search) {
        conditions.push(
          `(name ILIKE $${queryParams.length + 1} OR email ILIKE $${queryParams.length + 1})`
        );
        queryParams.push(`%${search}%`);
      }

      // Build where clause
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Calculate pagination
      const offset = (page - 1) * limit;

      // Get users
      const query = `
        SELECT id, email, name, role, status, created_at, updated_at
        FROM users
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      queryParams.push(String(limit), String(offset));

      const users = await sql.query(query, queryParams);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM users
        ${whereClause}
      `;

      const countResult = await sql.query(countQuery, queryParams.slice(0, -2));
      const total = parseInt(countResult[0].total);

      return {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  }

  /**
   * Apply for wholesale account
   * @param userId User ID
   * @param applicationData Application data
   * @returns Success status
   */
  async applyForWholesale(
    userId: string,
    applicationData: {
      company_name: string;
      tax_id: string;
      business_type: string;
      address: string;
      phone: string;
      website?: string;
      notes?: string;
    }
  ) {
    try {
      return await withTransaction(async client => {
        // Check if user already has an application
        const checkResult = await client.query(
          'SELECT id, status FROM wholesale_applications WHERE user_id = $1',
          [userId]
        );

        if (checkResult.rows.length > 0) {
          const application = checkResult.rows[0];
          if (['Pending', 'Approved'].includes(application.status)) {
            throw new Error(`Application already ${application.status.toLowerCase()}`);
          }
        }

        // Insert application
        const applicationId = uuidv4();
        await client.query(
          `INSERT INTO wholesale_applications (
            id, user_id, company_name, tax_id, business_type, address, 
            phone, website, notes, status, submitted_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending', NOW())`,
          [
            applicationId,
            userId,
            applicationData.company_name,
            applicationData.tax_id,
            applicationData.business_type,
            applicationData.address,
            applicationData.phone,
            applicationData.website || null,
            applicationData.notes || null,
          ]
        );

        return { success: true, applicationId };
      });
    } catch (error) {
      console.error('Error applying for wholesale account:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
