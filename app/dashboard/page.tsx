import { Suspense } from 'react';
import { cookies } from 'next/headers';
import Layout from '../components/layout/NewLayout';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { DashboardContent } from './DashboardContent';

// Types
interface UserProfile {
  name: string;
  email: string;
  role?: string;
  created_at?: string;
  referral_code?: string;
  avatar?: string;
}

interface OrderSummary {
  id: string;
  date: string;
  total: number;
  status: string;
  items: { id: string; name: string; quantity: number }[];
}

interface CommissionData {
  totalEarned: number;
  pendingPayout: number;
  lastPayoutDate?: string;
}

interface ProfileData {
  profile: UserProfile;
  orders: OrderSummary[];
  commissions?: CommissionData;
}

async function getProfileDataAction(token: string): Promise<ProfileData> {
  'use server';

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      revalidate: 60, // Revalidate every minute
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch profile data');
  }

  return res.json();
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return (
    <Layout>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSkeleton type="dashboard" />}>
          <DashboardContent token={token} getProfileDataAction={getProfileDataAction} />
        </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}
