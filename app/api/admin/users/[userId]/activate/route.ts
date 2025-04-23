import { NextResponse, type NextRequest } from 'next/server';

export async function POST(
    request: NextRequest, 
    { params }: { params: { userId: string } } // Applying correct standard signature
) {
  const { userId } = params;

  try {
    console.log(`Admin: Activate user request for ID: ${userId}`);
    // --- Update User Status to Active Logic Here ---
    return NextResponse.json({ message: `User ${userId} activated successfully` });
  } catch (error) {
    console.error(`Admin: Failed to activate user ${userId}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
