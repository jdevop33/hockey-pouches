import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Hockey Pouches',
  description: 'Sign in to your account to manage orders and access your profile.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
