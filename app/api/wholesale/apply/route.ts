import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Minimum unit threshold for wholesale accounts
const WHOLESALE_MIN_UNITS = 100;

// Validation schema for wholesale application
const wholesaleApplicationSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  tax_id: z.string().min(1, 'Tax ID is required'),
  business_address: z.string().min(1, 'Business address is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Valid email is required'),
  contact_phone: z.string().min(1, 'Contact phone is required'),
  estimated_order_size: z
    .number()
    .int()
    .min(
      WHOLESALE_MIN_UNITS,
      `Wholesale accounts require a minimum order size of ${WHOLESALE_MIN_UNITS} units`
    ),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    try {
      // Validate application data against schema
      const validatedData = wholesaleApplicationSchema.parse(body);

      // TODO: Store the application data once we implement our custom service
      console.log('Wholesale application received:', validatedData);

      // For now, just return a success response
      return NextResponse.json(
        {
          success: true,
          message: 'Application submitted successfully. We will review your application shortly.',
          // Include a mock ID for now
          applicationId: `wholesale-${Date.now()}`,
        },
        { status: 201 }
      );
    } catch (validationError) {
      // Handle validation errors
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: validationError.errors,
          },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error processing wholesale application:', error);
    return NextResponse.json({ error: 'Failed to process wholesale application' }, { status: 500 });
  }
}
