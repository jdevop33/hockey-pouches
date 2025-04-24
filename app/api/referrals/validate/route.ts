import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.json(
      { message: 'Referral code is required' },
      { status: 400 }
    );
  }
  
  try {
    // Find the user with this referral code
    const result = await sql.query(
      `SELECT id, name, email, role, status FROM users WHERE referral_code = $1`,
      [code]
    );
    
    if (result.length === 0) {
      return NextResponse.json(
        { message: 'Invalid referral code' },
        { status: 404 }
      );
    }
    
    const referrer = result[0];
    
    // Check if the referrer is active
    if (referrer.status !== 'Active') {
      return NextResponse.json(
        { message: 'This referral code is no longer active' },
        { status: 400 }
      );
    }
    
    // Return the referrer info (excluding sensitive data)
    return NextResponse.json({
      valid: true,
      referrer: {
        id: referrer.id,
        name: referrer.name,
        role: referrer.role
      }
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    return NextResponse.json(
      { message: 'Failed to validate referral code' },
      { status: 500 }
    );
  }
}
