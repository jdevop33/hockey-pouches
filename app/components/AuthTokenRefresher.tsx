'use client';
import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store';

/**
 * AuthTokenRefresher Component
 *
 * This component manages automatic token refresh based on token expiration time.
 * It should be added to the application layout to ensure tokens are refreshed
 * across all pages.
 */
export function AuthTokenRefresher() {
  const { isAuthenticated, tokenExpiryTime, refreshAccessToken } = useAuthStore();

  // Function to check token expiry and refresh if needed
  const checkAndRefreshToken = useCallback(async () => {
    if (!isAuthenticated || !tokenExpiryTime) return;

    const now = Date.now();

    // If token is about to expire (within 5 minutes), refresh it
    if (now >= tokenExpiryTime - 5 * 60 * 1000) {
      console.log('Token expiring soon, refreshing...');
      await refreshAccessToken();
    }
  }, [isAuthenticated, tokenExpiryTime, refreshAccessToken]);

  // Set up interval to check token expiry every minute
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check immediately on mount
    checkAndRefreshToken();

    // Then check periodically
    const interval = setInterval(checkAndRefreshToken, 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkAndRefreshToken]);

  // This component doesn't render anything
  return null;
}
