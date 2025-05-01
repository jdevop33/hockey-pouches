'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  currentImageUrl: string | null | undefined;
  onImageUploadAction: (imageUrl: string) => void;
  token: string;
  folder?: string;
  className?: string;
  disabled?: boolean;
}

export default function ImageUploader({
  currentImageUrl,
  onImageUploadAction,
  token,
  folder = 'products',
  className = '',
  disabled = false,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadError(null);
    setIsUploading(true);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a JPEG, PNG, WEBP, or GIF image.');
      setIsUploading(false);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File size exceeds the 5MB limit.');
      setIsUploading(false);
      return;
    }

    try {
      // Create a temporary preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Prepare form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Upload the image
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const result = await response.json();

      // Call the callback with the new image URL
      onImageUploadAction(result.url);

      // Clean up the temporary preview URL
      URL.revokeObjectURL(objectUrl);

      // Set the preview to the actual uploaded image URL
      setPreviewUrl(result.url);
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      setUploadError(
        error instanceof Error ? error.message : 'Failed to upload image. Please try again.'
      );
      // Revert to the previous image if there was an error
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploadAction('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {previewUrl ? (
        <div className="relative">
          <div className="relative h-48 w-48 overflow-hidden rounded-md border border-gray-300">
            <Image src={previewUrl} alt="Product image" fill className="object-contain" />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              disabled={isUploading}
              aria-label="Remove image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div className="flex h-48 w-48 items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-1 text-sm text-gray-500">No image</p>
          </div>
        </div>
      )}

      {!disabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {previewUrl ? 'Change Image' : 'Upload Image'}
          </label>
          <div className="mt-1 flex items-center">
            <label
              htmlFor="image-upload"
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {isUploading ? 'Uploading...' : 'Browse'}
              <input
                id="image-upload"
                name="image-upload"
                type="file"
                className="sr-only"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                disabled={isUploading || disabled}
                ref={fileInputRef}
              />
            </label>
            <p className="ml-3 text-xs text-gray-500">JPEG, PNG, WEBP, or GIF up to 5MB</p>
          </div>
          {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
        </div>
      )}
    </div>
  );
}
