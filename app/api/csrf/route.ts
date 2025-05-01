import { NextRequest, NextResponse } from 'next/server';
import { generateAndSetCsrfToken } from '@/lib/csrf-server';

/**
 * GET /api/csrf
 * Returns a CSRF token
 */
export async function GET(request: NextRequest) {
  try {
    const token = await generateAndSetCsrfToken();
    return NextResponse.json({ token });
  } catch (error) {
    console.error('CSRF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate CSRF token' }, { status: 500 });
  }
}
