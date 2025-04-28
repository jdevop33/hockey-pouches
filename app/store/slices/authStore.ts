import { BaseState, createBaseStore } from '..';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'distributor';
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState extends BaseState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  setUser: (user: User | null) =>
    authStore.setState({
      user,
      isAuthenticated: !!user,
    }),
  setTokens: (tokens: { accessToken: string; refreshToken: string }) =>
    authStore.setState({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }),
  clearAuth: () =>
    authStore.setState({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    }),
  updateUser: (updates: Partial<User>) =>
    authStore.setState(state => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
};

const authStore = createBaseStore<AuthState>(initialState, 'auth');

export const useAuthStore = authStore;
