'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/layout/NewLayout';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

// Types
type Commission = {
  id: string;
  type: string;
  amount: number;
  status: string;
  earnedDate: string;
  payoutDate?: string;
  orderId?: string;
  customerName?: string;
};

type Referral = {
  id: string;
  name: string;
  joinDate: string;
  totalSales: number;
};

type CommissionSummary = {
  totalEarned: number;
  totalPaid: number;
  totalPending: number;
};

type ReferralSummary = {
  totalReferrals: number;
  totalCommission: number;
};

export default function ReferralsPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, logout } = useAuth();

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<CommissionSummary>({
    totalEarned: 0,
    totalPaid: 0,
    totalPending: 0
  });
  const [referralSummary, setReferralSummary] = useState<ReferralSummary>({
    totalReferrals: 0,
    totalCommission: 0
  });
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Wait for auth state to load
    if (authLoading) return;

    // Redirect if not authenticated
    if (!user || !token) {
      router.push('/login?redirect=/dashboard/referrals');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch referral link
        const linkResponse = await fetch('/api/users/me/referral-link', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!linkResponse.ok) {
          if (linkResponse.status === 401) {
            logout();
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch referral link');
        }

        const linkData = await linkResponse.json();
        setReferralCode(linkData.referralCode);
        setReferralLink(linkData.referralLink);

        // Fetch commissions
        const commissionsResponse = await fetch(`/api/users/me/commissions?page=${currentPage}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!commissionsResponse.ok) {
          if (commissionsResponse.status === 401) {
            logout();
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch commissions');
        }

        const commissionsData = await commissionsResponse.json();
        setCommissions(commissionsData.commissions);
        setCommissionSummary(commissionsData.summary || {
          totalEarned: 0,
          totalPaid: 0,
          totalPending: 0
        });
        setTotalPages(commissionsData.pagination?.totalPages || 1);

        // Fetch referrals
        const referralsResponse = await fetch('/api/users/me/referrals', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!referralsResponse.ok) {
          if (referralsResponse.status === 401) {
            logout();
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch referrals');
        }

        const referralsData = await referralsResponse.json();
        setReferrals(referralsData.referrals);
        setReferralSummary(referralsData.summary || {
          totalReferrals: 0,
          totalCommission: 0
        });

      } catch (err: any) {
        console.error('Error loading referral data:', err);
        setError(err.message || 'Failed to load referral and commission data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, token, authLoading, currentPage, router, logout]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(`${type === 'code' ? 'Referral code' : 'Referral link'} copied!`);
        setTimeout(() => setCopySuccess(null), 2000);
      },
      () => {
        setCopySuccess('Failed to copy. Please try again.');
      }
    );
  };

  // Loading states
  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600 mx-auto"></div>
            <p>Loading referral data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="p-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Referrals & Commissions</h1>

        {/* Success message for copy */}
        {copySuccess && (
          <div className="mb-4 rounded-md bg-green-50 p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{copySuccess}</p>
              </div>
            </div>
          </div>
        )}

        {/* Referral Code & Summary Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md md:col-span-1">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Your Referral Code</h2>
            {referralCode ? (
              <div>
                <div className="mb-3 flex items-center">
                  <p className="inline-block rounded bg-gray-100 p-3 font-mono text-lg">{referralCode}</p>
                  <button
                    onClick={() => copyToClipboard(referralCode, 'code')}
                    className="ml-2 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Copy referral code"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>

                {referralLink && (
                  <div className="mb-4">
                    <p className="mb-1 text-sm font-medium text-gray-700">Your Referral Link:</p>
                    <div className="flex items-center">
                      <p className="mr-2 truncate text-sm text-gray-600">{referralLink}</p>
                      <button
                        onClick={() => copyToClipboard(referralLink, 'link')}
                        className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Copy referral link"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  Share this code with friends! You earn 5% commission when they make a purchase.
                </p>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Referral Stats:</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-md bg-gray-50 p-2 text-center">
                      <p className="text-xs text-gray-500">Total Referrals</p>
                      <p className="text-lg font-semibold text-gray-800">{referralSummary.totalReferrals}</p>
                    </div>
                    <div className="rounded-md bg-gray-50 p-2 text-center">
                      <p className="text-xs text-gray-500">Total Commission</p>
                      <p className="text-lg font-semibold text-green-600">${referralSummary.totalCommission.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Referral code not found.</p>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md md:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">Commission Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-md bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-500 uppercase">Total Earned</p>
                <p className="text-2xl font-bold text-gray-800">${commissionSummary.totalEarned.toFixed(2)}</p>
              </div>
              <div className="rounded-md bg-green-50 p-4 text-center">
                <p className="text-sm text-gray-500 uppercase">Pending Payout</p>
                <p className="text-2xl font-bold text-green-600">${commissionSummary.totalPending.toFixed(2)}</p>
              </div>
              <div className="rounded-md bg-blue-50 p-4 text-center">
                <p className="text-sm text-gray-500 uppercase">Paid Out</p>
                <p className="text-2xl font-bold text-blue-600">${commissionSummary.totalPaid.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 rounded-md bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Payout Schedule:</span> Commissions are processed monthly and paid via e-Transfer to your registered email address.
              </p>
            </div>
          </div>
        </div>

        {/* Commissions History Table */}
        <div className="mb-8 overflow-hidden rounded-lg bg-white shadow-md">
          <h2 className="border-b p-6 text-xl font-semibold text-gray-700">Commission History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Details</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {commissions.length > 0 ? (
                  commissions.map((comm) => (
                    <tr key={comm.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(comm.earnedDate).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{comm.type}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {comm.orderId && (
                          <Link href={`/dashboard/orders/${comm.orderId}`} className="hover:underline">
                            Order #{comm.orderId.toString().split('-')[0]}
                          </Link>
                        )}
                        {comm.customerName && ` (Customer: ${comm.customerName})`}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-green-600">
                        +${comm.amount.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            comm.status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : comm.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : comm.status === 'Approved'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {comm.status}
                        </span>
                        {comm.status === 'Paid' && comm.payoutDate && (
                          <span className="ml-1 text-xs text-gray-400">
                            ({new Date(comm.payoutDate).toLocaleDateString()})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No commission history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      &lt;
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 border-primary-500 bg-primary-50 text-primary-600'
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      &gt;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Referred Users List */}
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="flex items-center justify-between border-b p-6">
            <h2 className="text-xl font-semibold text-gray-700">Your Referrals</h2>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800">
              {referralSummary.totalReferrals} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Join Date</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {referrals.length > 0 ? (
                  referrals.map((ref) => (
                    <tr key={ref.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{ref.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(ref.joinDate).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                        ${ref.totalSales.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      You haven't referred anyone yet. Share your referral code to start earning commissions!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
