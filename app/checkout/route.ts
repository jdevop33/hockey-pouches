// This file prevents Next.js from trying to statically generate the checkout page
// and instead handles it dynamically at runtime

import { NextRequest, NextResponse } from 'next/server';

// Disable static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Handle the GET request for the checkout page
export async function GET(_request: NextRequest) {
  // Simply pass through to the page component
  // This prevents the page from being statically generated
  return NextResponse.next();
}
