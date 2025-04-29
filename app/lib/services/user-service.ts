// app/lib/services/user-service.ts
import { db } from '@/lib/db';
import * as schema from '@/lib/schema'; // Use central schema index
import { eq, and, or, ilike, count, desc, sql, sum, SQL, ne } from 'drizzle-orm'; // Import Drizzle functions
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { logger } from '../logger';

// --- Type Adaptations ---
export type UserSelect = typeof schema.users.$inferSelect;
export type UserRole = typeof schema.userRoleEnum.enumValues[number];
type UserWithPasswordHash = UserSelect & { passwordHash: string };

export interface CreateUserParams { /* ... */ }
export interface UpdateUserParams { /* ... */ }
export interface AuthResult { /* ... */ }
export interface ChangePasswordParams { /* ... */ }
export interface ListUsersResult { /* ... */ }
export interface ApplyWholesaleResult { /* ... */ }

// Type for Referral List Item
export interface ReferralListItem {
    id: string;
    name: string | null;
    joinDate: Date | null;
    // Add more fields if needed (e.g., total commission generated from this referral?)
}
export interface ReferralsListResult {
    referrals: ReferralListItem[];
    pagination: { total: number; page: number; limit: number; totalPages: number; };
    summary: { totalReferrals: number; /* Add more summary stats */ };
    referralCode: string | null;
}

// --- Helper: Generate Referral Code ---
function generateReferralCode(name: string | null): string { /* ... */ }

// --- UserService Class ---
export class UserService {

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

    // --- NEW: Get Users Referred By Current User ---
    async getReferrals(userId: string, options: { page?: number; limit?: number; }): Promise<ReferralsListResult> {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        try {
            // 1. Get the current user's referral code (needed for display)
            const currentUser = await db.query.users.findFirst({
                where: eq(schema.users.id, userId),
                columns: { referralCode: true }
            });
            const referralCode = currentUser?.referralCode || null;

            // 2. Define the where clause for finding referred users
            const whereClause = eq(schema.users.referredBy, userId); // Filter by referrer's User ID

            // 3. Fetch referred users with pagination
            const referralsQuery = db.select({
                    id: schema.users.id,
                    name: schema.users.name,
                    joinDate: schema.users.createdAt,
                    // TODO: Add subquery for total sales/commission from this referral if needed
                })
                .from(schema.users)
                .where(whereClause)
                .orderBy(desc(schema.users.createdAt))
                .limit(limit)
                .offset(offset);

            // 4. Fetch total count of referrals
            const countQuery = db.select({ total: count() })
                .from(schema.users)
                .where(whereClause);

            // 5. Fetch summary stats (Total Commission Earned by Referrer)
            // Corrected: Sum commissions where userId = referrer's ID
            const commissionSumQuery = db.select({
                 totalCommission: sql<number>`COALESCE(SUM(${schema.commissions.amount}), 0)`.mapWith(Number)
                })
                .from(schema.commissions)
                .where(and(
                    eq(schema.commissions.userId, userId),
                    ne(schema.commissions.status, 'Cancelled') // Don't count cancelled
                    // Add type filter if needed (e.g., eq(schema.commissions.type, 'Order Referral'))
                 ));

            // Execute concurrently
            const [referralsResult, countResult, summaryResult] = await Promise.all([
                referralsQuery,
                countQuery,
                commissionSumQuery,
            ]);

            const totalReferrals = countResult[0].total;
            const totalPages = Math.ceil(totalReferrals / limit);
            const totalCommission = summaryResult[0]?.totalCommission ?? 0;

            return {
                referralCode,
                referrals: referralsResult,
                summary: {
                    totalReferrals: totalReferrals,
                    totalCommission: parseFloat(totalCommission.toFixed(2)),
                },
                pagination: { page, limit, total: totalReferrals, totalPages },
            };

        } catch (error) {
            logger.error('Error fetching user referrals:', { userId, options, error });
            throw new Error('Failed to fetch user referrals.');
        }
    }
     // --- END NEW METHOD ---
}

export const userService = new UserService();
// NOTE: Ellipses indicate unchanged code
