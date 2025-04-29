import React from 'react';

interface LoadingSkeletonProps {
  type?: 'dashboard' | 'orders' | 'profile' | 'referrals';
}

export default function LoadingSkeleton({ type = 'dashboard' }: LoadingSkeletonProps) {
  const renderDashboardSkeleton = () => (
    <div className="animate-pulse space-y-8">
      {/* Welcome Banner Skeleton */}
      <div className="rounded-lg border border-gold-500/20 bg-dark-700 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="h-8 w-48 rounded bg-dark-600"></div>
            <div className="h-4 w-64 rounded bg-dark-600"></div>
          </div>
          <div className="h-20 w-20 rounded-full bg-dark-600"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border border-gold-500/20 bg-dark-700 p-6">
            <div className="h-4 w-24 rounded bg-dark-600"></div>
            <div className="mt-4 h-8 w-32 rounded bg-dark-600"></div>
          </div>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <div className="rounded-lg border border-gold-500/20 bg-dark-700 p-6">
        <div className="h-6 w-32 rounded bg-dark-600"></div>
        <div className="mt-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded bg-dark-600"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-dark-600"></div>
                <div className="h-3 w-1/2 rounded bg-dark-600"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrdersSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-dark-600"></div>
      <div className="rounded-lg border border-gold-500/20 bg-dark-700 p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-dark-600 pb-4"
            >
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-dark-600"></div>
                <div className="h-3 w-24 rounded bg-dark-600"></div>
              </div>
              <div className="h-8 w-24 rounded bg-dark-600"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfileSkeleton = () => (
    <div className="animate-pulse space-y-8">
      <div className="rounded-lg border border-gold-500/20 bg-dark-700 p-6">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 rounded bg-dark-600"></div>
              <div className="h-10 w-full rounded bg-dark-600"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReferralsSkeleton = () => (
    <div className="animate-pulse space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border border-gold-500/20 bg-dark-700 p-6">
            <div className="h-4 w-24 rounded bg-dark-600"></div>
            <div className="mt-4 h-8 w-32 rounded bg-dark-600"></div>
          </div>
        ))}
      </div>

      {/* Referral Link Section */}
      <div className="rounded-lg border border-gold-500/20 bg-dark-700 p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 rounded bg-dark-600"></div>
          <div className="h-10 w-full rounded bg-dark-600"></div>
        </div>
      </div>

      {/* Recent Referrals */}
      <div className="rounded-lg border border-gold-500/20 bg-dark-700 p-6">
        <div className="h-6 w-40 rounded bg-dark-600"></div>
        <div className="mt-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-dark-600"></div>
                <div className="h-3 w-24 rounded bg-dark-600"></div>
              </div>
              <div className="h-8 w-24 rounded bg-dark-600"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  switch (type) {
    case 'orders':
      return renderOrdersSkeleton();
    case 'profile':
      return renderProfileSkeleton();
    case 'referrals':
      return renderReferralsSkeleton();
    default:
      return renderDashboardSkeleton();
  }
}
