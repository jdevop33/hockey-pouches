// app/api/users/me/referral-link/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import { userService } from '@/lib/services/user-service'; // Use refactored service
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

function getReferralLink(referralCode: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hockeypouches.com'; // Ensure consistent base URL
    return `${baseUrl}/ref/${referralCode}`;
}

// --- GET Handler: Fetch User's Referral Code & Link ---
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) {
            return unauthorizedResponse(authResult.message);
        }
        const userId = authResult.userId;
        logger.info(`GET /api/users/me/referral-link request`, { userId });

        // Use service to get user data including referral code
        const user = await userService.getUserById(userId);

        if (!user || !user.referralCode) {
            // User might exist but somehow lack a code (shouldn't happen with new logic)
             logger.error('User found but referral code missing', { userId });
            return NextResponse.json({ message: 'Referral code not found for user.' }, { status: 404 });
        }

        const referralLink = getReferralLink(user.referralCode);

        return NextResponse.json({
            referralCode: user.referralCode,
            referralLink,
        });

    } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('GET /api/users/me/referral-link error:', { error });
        return NextResponse.json({ message: 'Internal Server Error fetching referral link.' }, { status: 500 });
    }
}

// --- POST Handler: Regenerate User's Referral Code & Link ---
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) {
            return unauthorizedResponse(authResult.message);
        }
        const userId = authResult.userId;
        logger.info(`POST /api/users/me/referral-link request (regenerate)`, { userId });

        // Call the service method to regenerate
        const newReferralCode = await userService.regenerateReferralCode(userId);

        if (!newReferralCode) {
             // Service method should throw on failure, but handle defensively
            throw new Error('Service failed to return new referral code.');
        }

        const referralLink = getReferralLink(newReferralCode);

        logger.info('Referral code regenerated successfully', { userId, newReferralCode });
        return NextResponse.json({
            referralCode: newReferralCode,
            referralLink,
            message: 'Referral code regenerated successfully',
        });

    } catch (error: unknown) {
        logger.error('POST /api/users/me/referral-link error:', { error });
        if (errorMessage) {
            return NextResponse.json({ message: errorMessage }, { status: 404 });
        }
         if (errorMessage) {
            // Specific error for collision failure after retries
             return NextResponse.json({ message: errorMessage }, { status: 500 });
        }
        return NextResponse.json({ message: 'Internal Server Error regenerating referral code.' }, { status: 500 });
    }
}
