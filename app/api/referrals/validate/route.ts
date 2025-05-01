import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db'; // Import db
import { logs } from '@/lib/schema/logs';
import { users } from '@/lib/schema/users';
import * as schema from '@/lib/schema'; // Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Keep for other schema references
// Import schema
import { eq, and } from 'drizzle-orm'; // Import operators
import { logger } from '@/lib/logger'; // Added logger
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl; // Correct way to get searchParams
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json(
      { message: 'Referral code is required' },
      { status: 400 }
    );
  }
  logger.info('Validating referral code', { code });
  try {
    // Find the user with this referral code using Drizzle query builder
    const referrer = await db.query.users.findFirst({
        where: and(
            eq(schema.users.referralCode, code),
            // Optionally add status check if needed immediately
            // eq(schema.users.status, 'Active') 
        ),
        columns: { // Select only necessary columns
            id: true,
            name: true,
            email: true, // Keep email if needed for logs/checks, but don't return
            role: true,
            status: true 
        }
    });
    if (!referrer) {
      logger.warn('Invalid referral code entered', { code });
      return NextResponse.json(
        // Return 200 OK but indicate invalid code for validation purposes
        { valid: false, message: 'Invalid referral code' }, 
        { status: 200 } 
      );
    }
    // Check if the referrer is active
    // TODO: Define what statuses are considered valid for a referrer
    if (referrer.status !== 'Active') { 
      logger.warn('Referral code is not active', { code, userId: referrer.id, status: referrer.status });
      return NextResponse.json(
        { valid: false, message: 'This referral code is no longer active' },
        { status: 200 } 
      );
    }
    // Return minimal referrer info (don't expose email)
    logger.info('Referral code validated successfully', { code, referrerId: referrer.id });
    return NextResponse.json({
      valid: true,
      referrer: {
        id: referrer.id,
        name: referrer.name,
        // role: referrer.role // Consider if exposing role is necessary/safe
      }
    });
  } catch (error) {
    logger.error('Error validating referral code:', { code, error });
    return NextResponse.json(
      { message: 'Failed to validate referral code' },
      { status: 500 }
    );
  }
}
