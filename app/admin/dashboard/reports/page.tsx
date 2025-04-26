'use client';

import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/NewLayout'; // Relative path (3 levels up)
// import { useAuth } from '@/context/AuthContext'; // Example auth context
// TODO: Import charting libraries (e.g., Chart.js, Recharts)

// Placeholder Types
type SalesReportData = { date: string; sales: number; orders: number };

export default function AdminReportsPage() {
  // const { user, loading: authLoading } = useAuth(); // Example
  const [salesData, setSalesData] = useState<SalesReportData[]>([]);
  // TODO: Add state for other reports (top products, top referrers, inventory value etc.)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for date range selection

  // TODO: Implement proper authentication check and ensure user role is 'Admin'
  const isAuthenticated = true; // Placeholder
  const isAdmin = true; // Placeholder

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      // router.push('/login'); // Redirect if not authorized
      return;
    }

    const loadReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace placeholder with actual API calls to fetch report data
        // Example: /api/admin/reports/sales?from=...&to=...
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

        // Simulated data
        setSalesData([
          { date: '2023-10-20', sales: 1500, orders: 15 },
          { date: '2023-10-21', sales: 1850, orders: 20 },
          { date: '2023-10-22', sales: 1200, orders: 12 },
          { date: '2023-10-23', sales: 2100, orders: 25 },
          { date: '2023-10-24', sales: 1900, orders: 22 },
          { date: '2023-10-25', sales: 2500, orders: 30 },
          { date: '2023-10-26', sales: 2300, orders: 28 },
        ]);
        // TODO: Fetch and set data for other reports
      } catch (err) {
        setError('Failed to load report data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [isAuthenticated, isAdmin]); // Add date range dependency later

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8">Loading reports...</div>
      </Layout>
    );
  }
  if (!isAuthenticated || !isAdmin) {
    return (
      <Layout>
        <div className="p-8">Access Denied.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 p-8">
        <h1 className="mb-6 text-3xl font-bold text-white">Reports & Analytics</h1>

        {/* TODO: Add Date Range Picker */}
        <div className="mb-6 rounded-md bg-gray-800 p-4 shadow-gold-sm">Date Range Placeholder</div>

        {error && <p className="mb-4 text-red-400">Error: {error}</p>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sales Overview Chart */}
          <div className="rounded-lg bg-gray-800 p-6 shadow-gold-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-100">
              Sales Overview (Last 7 Days)
            </h2>
            {/* TODO: Implement Sales Chart component using salesData */}
            <div className="flex h-64 items-center justify-center text-gray-400">
              Sales Chart Placeholder
            </div>
          </div>

          {/* Orders Overview Chart */}
          <div className="rounded-lg bg-gray-800 p-6 shadow-gold-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-100">
              Orders Overview (Last 7 Days)
            </h2>
            {/* TODO: Implement Orders Chart component using salesData */}
            <div className="flex h-64 items-center justify-center text-gray-400">
              Orders Chart Placeholder
            </div>
          </div>

          {/* TODO: Add other report sections/charts/tables */}
          {/* - Top Selling Products */}
          {/* - Top Referrers/Distributors */}
          {/* - Commission Totals Report */}
          {/* - Inventory Value Report */}
          {/* - Consignment Status Report */}
          <div className="rounded-lg bg-gray-800 p-6 shadow-gold-sm lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold text-gray-100">Other Reports Placeholder</h2>
            <p className="text-gray-300">
              More reports coming soon (Top Products, Top Referrers, etc.).
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
