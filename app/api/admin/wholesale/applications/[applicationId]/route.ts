// app/api/admin/wholesale/applications/[applicationId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';
import { wholesaleService } from '@/lib/services/wholesale-service'; // Use service
import * as schema from '@/lib/schema'; // Use schema for enum
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// --- GET Handler (Get Specific Application) ---
export async function GET(request: NextRequest, { params }: { params: { applicationId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        const { applicationId } = params;
        if (!applicationId || applicationId.length !== 36) { // UUID validation
            return NextResponse.json({ message: 'Invalid Application ID format.' }, { status: 400 });
        }
        logger.info(`Admin GET /api/admin/wholesale/applications/${applicationId} request`, { adminId: authResult.userId });

        const application = await wholesaleService.getApplicationById(applicationId);
        if (!application) {
            return NextResponse.json({ message: 'Wholesale application not found.' }, { status: 404 });
        }
        return NextResponse.json(application);

    } catch (error: any) {
        logger.error(`Admin: Failed to get wholesale application ${params.applicationId}:`, { error });
        return NextResponse.json({ message: 'Internal Server Error fetching application.' }, { status: 500 });
    }
}

// --- PATCH Handler (Approve/Reject Application) ---
const updateApplicationSchema = z.object({
    status: z.enum(['Approved', 'Rejected']), // Only allow these actions
    notes: z.string().optional().nullable(), // Reason for rejection or approval notes
});

export async function PATCH(request: NextRequest, { params }: { params: { applicationId: string } }) {
    try {
        const authResult = await verifyAdmin(request);
        if (!authResult.isAuthenticated || !authResult.userId || authResult.role !== 'Admin') {
            return forbiddenResponse('Admin access required');
        }
        const { applicationId } = params;
        if (!applicationId || applicationId.length !== 36) { // UUID validation
            return NextResponse.json({ message: 'Invalid Application ID format.' }, { status: 400 });
        }

        const body = await request.json();
        const validation = updateApplicationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid input data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const { status, notes } = validation.data;

        // Reject requires notes (reason)
        if (status === 'Rejected' && (!notes || notes.trim() === '')) {
             return NextResponse.json({ message: 'Rejection reason (notes) is required.' }, { status: 400 });
        }

        logger.info(`Admin PATCH /api/admin/wholesale/applications/${applicationId} request`, { adminId: authResult.userId, status, notes });

        let updatedApplication;
        if (status === 'Approved') {
            updatedApplication = await wholesaleService.approveApplication(applicationId, authResult.userId, notes ?? undefined);
        } else { // status === 'Rejected'
            updatedApplication = await wholesaleService.rejectApplication(applicationId, authResult.userId, notes!); // Notes is guaranteed by check above
        }

        logger.info('Admin: Wholesale application updated successfully', { applicationId, status, adminId: authResult.userId });
        return NextResponse.json(updatedApplication);

    } catch (error: any) {
        logger.error(`Admin: Failed to update wholesale application ${params.applicationId}:`, { error });
        if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        if (error.message?.includes('not found')) {
            return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json({ message: 'Internal Server Error updating application.' }, { status: 500 });
    }
}

// DELETE handler might not be needed - applications are approved/rejected, not usually deleted.
