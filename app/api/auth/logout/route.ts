import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // For stateless JWTs, logout is primarily handled client-side by deleting the token.
  // This endpoint exists mainly to potentially:
  // 1. Invalidate a refresh token if you implement a refresh token strategy.
  // 2. Add the JWT to a blacklist if you implement server-side revocation (more complex).
  // 3. Clear HttpOnly cookies if the token is stored there.

  try {
    console.log('Logout request received.');

    // Create a response
    const response = NextResponse.json({
      message: 'Logged out successfully',
    });

    // Clear the auth token cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
