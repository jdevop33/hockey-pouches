'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoadingProps {
  message?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center">
      <LoadingSpinner size="large" color="primary" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export default PageLoading;
