import { NextRequest, NextResponse } from 'next/server';
import { generateAndSetCsrfToken } from '@/lib/csrf-server';

/**
 * GET /api/csrf
 * Returns a CSRF token
 */
export async function GET(request: NextRequest) {
  const token = generateAndSetCsrfToken();
  return NextResponse.json({ token });
}
