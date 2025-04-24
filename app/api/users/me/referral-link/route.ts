import { NextResponse, type NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;

    // Get user's referral code
    const userResult = await sql.query(
      `SELECT referral_code FROM users WHERE id = $1`,
      [userId]
    );

    const referralCode = userResult[0]?.referral_code;

    if (!referralCode) {
      return NextResponse.json(
        { message: 'No referral code found for this user' },
        { status: 404 }
      );
    }

    // Generate referral link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hockeypouches.com';
    const referralLink = `${baseUrl}/ref/${referralCode}`;

    return NextResponse.json({
      referralCode,
      referralLink,
    });
  } catch (error) {
    console.error('Failed to get referral link:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Allow regenerating a referral code if needed
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    const userId = authResult.userId;

    // Get user's name to generate a new code
    const userResult = await sql.query(
      `SELECT name FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.length === 0) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const userName = userResult[0].name;
    
    // Generate a new referral code
    const firstNamePart = userName.split(' ')[0].toUpperCase().substring(0, 4);
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newReferralCode = `${firstNamePart}${randomPart}`;

    // Update the user's referral code
    await sql.query(
      `UPDATE users SET referral_code = $1 WHERE id = $2`,
      [newReferralCode, userId]
    );

    // Generate referral link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hockeypouches.com';
    const referralLink = `${baseUrl}/ref/${newReferralCode}`;

    return NextResponse.json({
      referralCode: newReferralCode,
      referralLink,
      message: 'Referral code regenerated successfully'
    });
  } catch (error) {
    console.error('Failed to regenerate referral code:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
