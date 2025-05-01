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
    if (
      authResult.role !== 'Distributor' &&
      authResult.role !== 'Admin' &&
      authResult.role !== 'Owner'
    ) {
      return NextResponse.json(
        { message: 'Unauthorized: Only distributors and admins can upload images' },
        { status: 403 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;
    const orderId = formData.get('orderId') as string;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ message: 'Missing required field: file' }, { status: 400 });
    }

    // For order fulfillment uploads, we need orderId and type
    if ((orderId || type) && (!orderId || !type)) {
      return NextResponse.json(
        { message: 'For order fulfillment, both orderId and type are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'application/pdf',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Allowed types: JPEG, PNG, WEBP, GIF, HEIC, PDF' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ message: 'File size exceeds the 10MB limit' }, { status: 400 });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const userId = authResult.userId;
    const fileExtension = file.name.split('.').pop();

    let fileName = '';

    // Determine the file path based on the provided parameters
    if (orderId && type) {
      // Order fulfillment image
      fileName = `orders/${orderId}/${type}_${userId}_${timestamp}.${fileExtension}`;
    } else if (folder) {
      // Product or variation image
      fileName = `${folder}/${userId}_${timestamp}.${fileExtension}`;
    } else {
      // Default uploads folder
      fileName = `uploads/${userId}_${timestamp}.${fileExtension}`;
    }

    // Upload the file to Vercel Blob
    const { url } = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false, // Use our own unique naming scheme
    });

    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ message: 'Failed to upload file' }, { status: 500 });
  }
}
