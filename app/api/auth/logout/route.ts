import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // For stateless JWTs, logout is primarily handled client-side by deleting the token.
  // This endpoint exists mainly to potentially:
  // 1. Invalidate a refresh token if you implement a refresh token strategy.
  // 2. Add the JWT to a blacklist if you implement server-side revocation (more complex).
  // 3. Clear HttpOnly cookies if the token is stored there.

  try {
    console.log('Logout request received.');
    
    // Placeholder: If using HttpOnly cookies, clear it here
    // const response = NextResponse.json({ message: 'Logged out successfully' });
    // response.cookies.set('authToken', '', { 
    //     httpOnly: true, 
    //     secure: process.env.NODE_ENV !== 'development',
    //     expires: new Date(0), 
    //     path: '/',
    //     sameSite: 'strict' 
    // });
    // return response;

    // For simple localStorage token, just return success
    return NextResponse.json({ message: 'Logout acknowledged' });

  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
