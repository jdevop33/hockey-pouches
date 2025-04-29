// app/api/wholesale/apply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
// Import the service AND the specific result type
import { userService, type ApplyWholesaleResult } from '@/lib/services/user-service';
import { logger } from '@/lib/logger';

// Validation schema (as before)
const wholesaleApplicationSchema = z.object({
    company_name: z.string().min(1, 'Company name is required'),
    tax_id: z.string().min(1, 'Tax ID is required'),
    business_type: z.string().min(1, 'Business type is required'),
    address: z.object({
        street: z.string().min(1, 'Street required'),
        city: z.string().min(1, 'City required'),
        state: z.string().min(1, 'Province/State required'),
        postalCode: z.string().min(1, 'Postal Code required'),
        country: z.string().min(1, 'Country required'),
    }),
    phone: z.string().min(1, 'Contact phone is required'),
    website: z.string().url().optional().nullable(),
    notes: z.string().optional().nullable(),
}).strict();

export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.isAuthenticated || !authResult.userId) {
            return unauthorizedResponse('Authentication required to apply for wholesale.');
        }
        const userId = authResult.userId;

        const body = await request.json();
        const validation = wholesaleApplicationSchema.safeParse(body);
        if (!validation.success) {
            logger.warn('Wholesale application validation failed', { userId, errors: validation.error.flatten().fieldErrors });
            return NextResponse.json({ message: 'Invalid application data.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        const applicationData = validation.data;

        logger.info('Wholesale application submission attempt', { userId });

        // Call Service Method and explicitly type the result
        const result: ApplyWholesaleResult = await userService.applyForWholesale(userId, {
             company_name: applicationData.company_name,
             tax_id: applicationData.tax_id,
             business_type: applicationData.business_type,
             address: applicationData.address, // Pass the address object
             phone: applicationData.phone,
             website: applicationData.website ?? undefined,
             notes: applicationData.notes ?? undefined,
        });

        // Check the success property from the typed result
        if (!result.success) {
            logger.warn('Wholesale application submission failed in service', { userId, message: result.message });
            // Use the message from the result object
            return NextResponse.json({ message: result.message || 'Failed to submit application.' }, { status: 409 });
        }

        logger.info('Wholesale application submitted successfully', { userId, applicationId: result.applicationId });
        return NextResponse.json(
            {
                success: true,
                message: 'Application submitted successfully. We will review your application shortly.',
                // Use the applicationId from the result object
                applicationId: result.applicationId,
            },
            { status: 201 }
        );

    } catch (error: any) {
        logger.error('Error processing wholesale application:', { error });
         if (error instanceof SyntaxError) {
            return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error processing application.' }, { status: 500 });
    }
}
