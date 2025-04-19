import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the web vitals data
    console.log('Web Vitals:', body);
    
    // Here you could send the data to your analytics service
    // For example:
    // await fetch('https://your-analytics-endpoint.com', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(body),
    // });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing analytics' },
      { status: 500 }
    );
  }
}

// Prevent Next.js from caching this route
export const dynamic = 'force-dynamic';
