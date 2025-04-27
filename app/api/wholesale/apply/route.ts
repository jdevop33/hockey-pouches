import { NextRequest, NextResponse } from 'next/server';
import {
  wholesaleService,
  wholesaleApplicationSchema,
} from '../../../../lib/services/wholesale-service';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    try {
      // Validate application data against schema
      const validatedData = wholesaleApplicationSchema.parse(body);

      // Submit wholesale application
      const result = await wholesaleService.submitApplication(validatedData);

      return NextResponse.json(result, { status: 201 });
    } catch (validationError: unknown) {
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
