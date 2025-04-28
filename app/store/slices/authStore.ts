import { BaseState, createStore } from '../config';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'distributor';
  isVerified: boolean;
}

export interface AuthState extends BaseState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const initialState: Partial<AuthState> = {
  user: null,
  isAuthenticated: false,
  token: null,
};

export const useAuthStore = createStore<AuthState>(
  {
    ...initialState,
    login: (user, token) =>
      useAuthStore.setState(() => ({
        user,
        token,
        isAuthenticated: true,
      })),
    logout: () =>
      useAuthStore.setState(() => ({
        user: null,
        token: null,
        isAuthenticated: false,
      })),
    updateUser: userData =>
      useAuthStore.setState(state => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),
  },
  'auth'
);
