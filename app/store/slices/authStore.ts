import { type HydratedBaseState, createHydratedStore, type StoreCreator } from '../initializeStore';
import * as schema from '@/lib/schema'; // Import schema for UserRole

// Define the User type using schema types if possible
interface User {
  id: string;
  email: string;
  name: string;
  role: typeof schema.userRoleEnum.enumValues[number]; // Use enum type
}

// Define the auth-specific state and actions
interface AuthSliceState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// Combine with HydratedBaseState
export type AuthState = HydratedBaseState & AuthSliceState;

// Define initial state separately for clarity
const initialState: Partial<AuthState> = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
};

// Create the auth store slice
const createAuthSlice: StoreCreator<AuthState> = (set, get) => ({
  // Initial state properties are handled by createHydratedStore

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      // TODO: Implement actual login logic here
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
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred during login',
        isLoading: false,
      });
    }
  },

  logout: () => {
    // TODO: Optionally call /api/auth/logout endpoint
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
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
export const useAuthStore = createHydratedStore<AuthState>(
  initialState,
  'auth',
  createAuthSlice
);
