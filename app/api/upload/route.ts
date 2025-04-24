import { NextResponse, type NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { verifyAuth, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return unauthorizedResponse(authResult.message);
    }

    // Only allow distributors and admins to upload images
    if (authResult.role !== 'Distributor' && authResult.role !== 'Admin' && authResult.role !== 'Owner') {
      return NextResponse.json(
        { message: 'Unauthorized: Only distributors and admins can upload images' },
        { status: 403 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;
    const type = formData.get('type') as string;

    if (!file || !orderId || !type) {
      return NextResponse.json(
        { message: 'Missing required fields: file, orderId, or type' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Allowed types: JPEG, PNG, WEBP, HEIC, PDF' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File size exceeds the 10MB limit' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const userId = authResult.userId;
    const fileExtension = file.name.split('.').pop();
    const fileName = `orders/${orderId}/${type}_${userId}_${timestamp}.${fileExtension}`;

    // Upload the file to Vercel Blob
    const { url } = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false, // Use our own unique naming scheme
    });

    console.log(`File uploaded successfully: ${url}`);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
