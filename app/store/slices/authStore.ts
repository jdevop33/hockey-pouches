import { type HydratedBaseState, createHydratedStore, type StoreCreator } from '../initializeStore';
import * as schema from '@/lib/schema'; // Import schema for UserRole

// Define the User type using schema types if possible
interface User {
  id: string;
  email: string;
  name: string;
  role: (typeof schema.userRoleEnum.enumValues)[number]; // Use enum type
}

// Define the auth-specific state and actions
interface AuthSliceState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  tokenExpiryTime: number | null;
}

// Combine with HydratedBaseState
export type AuthState = HydratedBaseState & AuthSliceState;

// Define initial state separately for clarity
const initialState: Partial<AuthState> = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  tokenExpiryTime: null,
};

// JWT token expiry check - default 55 minutes (just under the 1h token lifetime)
const TOKEN_REFRESH_THRESHOLD = 55 * 60 * 1000;

// Create the auth store slice
const createAuthSlice: StoreCreator<AuthState> = (set, get) => ({
  // Initial state properties are handled by createHydratedStore

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // Calculate token expiry time (now + 55 minutes)
      const expiryTime = Date.now() + TOKEN_REFRESH_THRESHOLD;

      set({
        user: data.user,
        accessToken: data.token,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        tokenExpiryTime: expiryTime,
        isLoading: false,
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
      set({
        error: error instanceof Error ? errorMessage : 'An error occurred during login',
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });

      // Call logout API to invalidate refresh tokens on server
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${get().accessToken}`,
        },
      });

      // Clear auth state regardless of API response
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        tokenExpiryTime: null,
        isLoading: false,
      });
    } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
      // Still clear auth state even if API fails
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        tokenExpiryTime: null,
        error: error instanceof Error ? errorMessage : 'An error occurred during logout',
        isLoading: false,
      });
    }
  },

  refreshAccessToken: async () => {
    try {
      const currentRefreshToken = get().refreshToken;

      if (!currentRefreshToken) {
        console.warn('No refresh token available');
        return false;
      }

      set({ isLoading: true });

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();

      // Calculate new token expiry time
      const expiryTime = Date.now() + TOKEN_REFRESH_THRESHOLD;

      set({
        accessToken: data.accessToken,
        tokenExpiryTime: expiryTime,
        isLoading: false,
      });

      return true;
    } catch (error) {
    const errorMessage = error instanceof Error ? errorMessage : String(error);
      console.error('Token refresh failed:', error);

      // If token refresh fails, user needs to re-authenticate
      set({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        tokenExpiryTime: null,
        error: 'Your session has expired. Please log in again.',
        isLoading: false,
      });

      return false;
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      ...userData,
    };

    set({
      user: updatedUser,
    });
  },
});

// Create and export the auth store
export const useAuthStore = createHydratedStore<AuthState>(initialState, 'auth', createAuthSlice);
