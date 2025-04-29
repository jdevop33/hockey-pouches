// app/lib/services/user-service.ts
import { db } from '@/lib/db';
import * as schema from '@/lib/schema'; // Use central schema index
import { eq, and, or, ilike, count, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { logger } from '../logger';
import type { PgTransaction } from 'drizzle-orm/pg-core';
type Transaction = PgTransaction<any, any, any, any>;

// --- Export needed Types ---
export type UserSelect = typeof schema.users.$inferSelect;
export type UserRole = typeof schema.userRoleEnum.enumValues[number];
type UserWithPasswordHash = UserSelect & { passwordHash: string };
export interface CreateUserParams { email: string; password: string; name: string; role?: UserRole; /* referralCodeUsed?: string | null; */ }
export interface UpdateUserParams { name?: string; email?: string; status?: string; role?: UserRole; }
export interface AuthResult { success: boolean; user?: Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'>; token?: string; message?: string; }
export interface ChangePasswordParams { userId: string; currentPassword: string; newPassword: string; }
export interface ListUsersResult { users: Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'>[]; pagination: { total: number; page: number; limit: number; totalPages: number; }; }
// --- >>> EXPORT this interface --- 
export interface ApplyWholesaleResult { success: boolean; applicationId?: string; message?: string; }

// --- Helper: Generate Referral Code ---
function generateReferralCode(name: string | null): string { /* ... */ }

// --- UserService Class ---
export class UserService {
    // ... (all methods as previously refactored) ...
     async getUserById(userId: string): Promise<Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'> | null> { /* ... */ }
     async getUserByEmail(email: string): Promise<Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'> | null> { /* ... */ }
     private async getUserWithPasswordByEmail(email: string): Promise<UserWithPasswordHash | null> { /* ... */ }
     private async getUserPasswordHashById(userId: string): Promise<string | null> { /* ... */ }
     async createUser(params: CreateUserParams): Promise<Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'>> { /* ... */ }
     async updateUser(userId: string, params: UpdateUserParams): Promise<Omit<UserSelect, 'passwordHash' | 'referredBy' | 'wholesaleApprovedBy'>> { /* ... */ }
     async authenticate(email: string, password: string): Promise<AuthResult> { /* ... */ }
     async changePassword(params: ChangePasswordParams): Promise<{ success: boolean; message: string }> { /* ... */ }
     async listUsers(options: { /* ... */ }): Promise<ListUsersResult> { /* ... */ }
     async applyForWholesale(userId: string, applicationData: { /* ... */ }): Promise<ApplyWholesaleResult> { /* ... */ }
     async regenerateReferralCode(userId: string): Promise<string | null> { /* ... */ }
     // NEW: Get Referrals
    async getReferrals(userId: string, options: { page?: number; limit?: number; }): Promise<any> { // Define ReferralListResult properly
        // ... (Implementation using schema.users)
     }
}
export const userService = new UserService();

// NOTE: Ellipses indicate unchanged code for brevity
