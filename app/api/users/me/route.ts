// app/api/users/me/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { userService, type UpdateUserParams } from '@/lib/services/user-service'; // Use refactored service
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// --- GET Handler: Fetch current user profile ---
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) {
            return unauthorizedResponse(authResult.message);
        }
        const userId = authResult.userId;
        logger.info(`GET /api/users/me request`, { userId });

        // Use service method
        const userProfile = await userService.getUserById(userId);

        if (!userProfile) {
            logger.error('User profile not found in DB despite valid token', { userId });
            // Don't explicitly say "User not found" if token was valid, could be internal issue
            return NextResponse.json({ message: 'Failed to retrieve user profile.' }, { status: 404 });
        }

        logger.info('User profile fetched successfully', { userId, email: userProfile.email });
        // Service method already excludes sensitive info
        return NextResponse.json(userProfile);

    } catch (error) {
        logger.error('GET /api/users/me error:', { error });
        return NextResponse.json({ message: 'Internal Server Error fetching profile.' }, { status: 500 });
    }
}

// --- PATCH Handler: Update current user profile ---

// Zod schema for allowed profile updates by the user themselves
const updateProfileSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").trim().optional(),
    // Add other fields user can update, e.g., maybe contact preferences?
    // DO NOT allow updating email, role, status, etc. here - requires separate secure flows
}).strict();

export async function PATCH(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) {
            return unauthorizedResponse(authResult.message);
        }
        const userId = authResult.userId;

        const body = await request.json();
        const validation = updateProfileSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid input data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const updateData = validation.data;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
        }

        logger.info(`PATCH /api/users/me request`, { userId, updateData });

        // Call the service method with validated data
        // We cast because UpdateUserParams includes fields admins can set, but here Zod restricts it
        const updatedUser = await userService.updateUser(userId, updateData as UpdateUserParams);

        logger.info('User profile updated successfully', { userId });
        // Return updated profile (excluding sensitive info)
        return NextResponse.json(updatedUser);

    } catch (error: unknown) {
        logger.error('PATCH /api/users/me error:', { error });
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        // Handle errors from service (e.g., user not found, though unlikely here)
         if (error.message?.includes('not found')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json({ message: 'Internal Server Error updating profile.' }, { status: 500 });
    }
}
