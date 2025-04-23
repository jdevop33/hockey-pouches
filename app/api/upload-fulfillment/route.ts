// app/api/upload-fulfillment/route.ts
import { put } from '@vercel/blob';
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken'; 

interface JwtPayload { userId: string; role: string; }

export const dynamic = 'force-dynamic'; 

async function verifyDistributor(request: NextRequest): Promise<boolean> { /* ... as before ... */ 
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return false;
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) { throw new Error('Server configuration error'); } 
    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        return decoded.role === 'Distributor';
    } catch (error) {
        return false;
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const isDistributor = await verifyDistributor(request);
  if (!isDistributor) {
    return NextResponse.json({ message: 'Forbidden: Distributor access required.' }, { status: 403 });
  }

  const filename = request.nextUrl.searchParams.get('filename');
  if (!filename) {
    return NextResponse.json({ message: 'Missing filename query parameter' }, { status: 400 });
  }

  const fileBody = request.body;
  if (!fileBody) {
    return NextResponse.json({ message: 'Missing file data' }, { status: 400 });
  }

  try {
    // Construct the full path including the desired folder
    const blobPathname = `fulfillment_proof/${filename}`;
    console.log(`Attempting to upload blob to: ${blobPathname}`);
    
    // Corrected: Pass pathname directly in options
    const blob = await put(blobPathname, fileBody, {
      access: 'public',
      // contentType: request.headers.get('content-type') || undefined, // Optional
    });
    console.log('Blob upload successful:', blob.url);

    return NextResponse.json(blob);

  } catch (error: any) {
    console.error('Blob upload failed:', error);
    return NextResponse.json(
      { message: `Blob upload failed: ${error.message}` },
      { status: 500 },
    );
  }
}
