import { type HydratedBaseState, createHydratedStore, type StoreCreator } from '../initializeStore';

// Define the User type
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'distributor';
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

// Create the auth store slice
const createAuthSlice: StoreCreator<AuthState> = (set, get) => ({
  user: null,
  isAuthenticated: false,
  accessToken: null,

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
        throw new Error('Login failed');
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
  {
    user: null,
    isAuthenticated: false,
    accessToken: null,
  },
  'auth',
  createAuthSlice
);
