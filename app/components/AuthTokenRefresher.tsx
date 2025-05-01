'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/slices/authStore';
import { useHydration } from '@/store/initializeStore';
import { logger } from '@/lib/logger';

const REFRESH_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const REFRESH_THRESHOLD_MS = 10 * 60 * 1000; // Refresh if token expires within 10 minutes

export function AuthTokenRefresher() {
  // Wait for the auth store to be hydrated
  const isHydrated = useHydration(useAuthStore);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Access store state *after* hydration check
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const tokenExpiryTime = useAuthStore(state => state.tokenExpiryTime);
  const refreshAccessToken = useAuthStore(state => state.refreshAccessToken);

  useEffect(() => {
    // Only run the effect if the store is hydrated
    if (!isHydrated) {
      return;
    }

    const checkAndRefreshToken = async () => {
      if (isAuthenticated && tokenExpiryTime) {
        const now = Date.now();
        const timeUntilExpiry = tokenExpiryTime - now;

        // Check if token is nearing expiry
        if (timeUntilExpiry < REFRESH_THRESHOLD_MS) {
          logger.info('Auth token nearing expiry, attempting refresh.');
          try {
            await refreshAccessToken();
            logger.info('Auth token refreshed successfully.');
          } catch (error) {
            logger.error('Failed to refresh auth token automatically', { error });
            // Consider triggering logout or showing a message if refresh fails persistently
          }
        }
      }
    };

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up interval only if authenticated
    if (isAuthenticated) {
        // Check immediately on becoming authenticated/hydrated
        checkAndRefreshToken(); 
        // Set interval for periodic checks
        $1?.$2 = setInterval(checkAndRefreshToken, REFRESH_INTERVAL);
        logger.debug('AuthTokenRefresher interval started.');
    } else {
         logger.debug('AuthTokenRefresher interval stopped (user not authenticated).');
    }

    // Cleanup interval on component unmount or when auth state changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        logger.debug('AuthTokenRefresher interval cleared.');
      }
    };
  }, [isAuthenticated, tokenExpiryTime, refreshAccessToken, isHydrated]); // Include isHydrated dependency

  return null; // This component doesn't render anything
}
