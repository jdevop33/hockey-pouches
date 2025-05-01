// app/api/admin/users/[userId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { userService, type UpdateUserParams } from '@/lib/services/user-service'; // Use refactored service
import { users } from '@/lib/schema/users';
import { users } from '@/lib/schema/users';
import { users } from '@/lib/schema/users';
import { users } from '@/lib/schema/users';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Use central schema index
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// --- GET Handler (Get Specific User Details) ---
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        const { userId } = params;
        logger.info(`Admin GET /api/admin/users/${userId} request`, { adminId: authResult.userId });
        const user = await userService.getUserById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error: any) {
        logger.error(`Admin: Failed to get user ${params.userId}:`, { error });
        return NextResponse.json({ message: 'Internal Server Error fetching user details.' }, { status: 500 });
    }
}

// --- PATCH Handler (Update User Details) ---
const adminUpdateUserSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    role: z.enum(schema.userRoleEnum.enumValues).optional(),
    status: z.string().optional(), // Or z.enum(schema.userStatusEnum.enumValues)
    // Add other fields like wholesaleEligibility, commissionRate here if needed
}).strict();

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || !authResult.userId || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        const { userId } = params;
        const body = await request.json();
        const validation = adminUpdateUserSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid input data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const updateData = validation.data;
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
        }
        logger.info(`Admin PATCH /api/admin/users/${userId} request`, { adminId: authResult.userId, updateData });

        // Use validated data directly if types match UpdateUserParams
        const updatedUser = await userService.updateUser(userId, updateData as UpdateUserParams);

        logger.info('Admin: User updated successfully', { userId, adminId: authResult.userId });
        return NextResponse.json(updatedUser);
    } catch (error: any) {
        logger.error(`Admin: Failed to update user ${params.userId}:`, { error });
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        if (error.message?.includes('not found')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        if (error.message?.includes('Email already in use')) {
            return NextResponse.json({ message: error.message }, { status: 409 });
        }
        return NextResponse.json({ message: 'Internal Server Error updating user.' }, { status: 500 });
    }
}

// DELETE commented out
