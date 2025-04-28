'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart4, PieChart, TrendingUp } from 'lucide-react';
import Layout from '../../../components/layout/NewLayout';
import styles from './reports.module.css';
// import { useAuth } from '@/context/AuthContext'; // Example auth context
// TODO: Import charting libraries (e.g., Chart.js, Recharts)

// Placeholder Types
interface SalesReportData {
  date: string;
  sales: number;
  orders: number;
}

interface TopProductData {
  id: string;
  name: string;
  sales: number;
  quantity: number;
}

interface TopDistributorData {
  id: string;
  name: string;
  orders: number;
  commission: number;
}

export default function AdminReportsPage() {
  // const { user, loading: authLoading } = useAuth(); // Example
  const [salesData, setSalesData] = useState<SalesReportData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);
  const [topDistributors, setTopDistributors] = useState<TopDistributorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week');

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
          { date: '2025-04-20', sales: 1500, orders: 15 },
          { date: '2025-04-21', sales: 1850, orders: 20 },
          { date: '2025-04-22', sales: 1200, orders: 12 },
          { date: '2025-04-23', sales: 2100, orders: 25 },
          { date: '2025-04-24', sales: 1900, orders: 22 },
          { date: '2025-04-25', sales: 2500, orders: 30 },
          { date: '2025-04-26', sales: 2300, orders: 28 },
        ]);

        setTopProducts([
          { id: 'p1', name: 'Mint Pouches', sales: 9500, quantity: 633 },
          { id: 'p2', name: 'Berry Pouches', sales: 7800, quantity: 520 },
          { id: 'p3', name: 'Citrus Pouches', sales: 6200, quantity: 413 },
          { id: 'p4', name: 'Apple Mint Pouches', sales: 5100, quantity: 340 },
          { id: 'p5', name: 'Variety Pack', sales: 4200, quantity: 280 },
        ]);

        setTopDistributors([
          { id: 'd1', name: 'John Smith', orders: 45, commission: 2250 },
          { id: 'd2', name: 'Emily Johnson', orders: 38, commission: 1900 },
          { id: 'd3', name: 'Michael Brown', orders: 32, commission: 1600 },
          { id: 'd4', name: 'Sarah Davis', orders: 28, commission: 1400 },
          { id: 'd5', name: 'Robert Wilson', orders: 25, commission: 1250 },
        ]);
      } catch (err) {
        setError('Failed to load report data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [isAuthenticated, isAdmin]); // Add date range dependency later

  // Function to calculate total sales and orders
  const getTotals = () => {
    return salesData.reduce(
      (acc, day) => {
        acc.totalSales += day.sales;
        acc.totalOrders += day.orders;
        return acc;
      },
      { totalSales: 0, totalOrders: 0 }
    );
  };

  // Date range buttons
  const DateRangeSelector = () => (
    <div className="mb-6 flex flex-wrap gap-2">
      <button
        onClick={() => setDateRange('week')}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          dateRange === 'week'
            ? 'bg-gold-500 text-black'
            : 'bg-dark-700 text-white hover:bg-dark-600'
        }`}
      >
        Last Week
      </button>
      <button
        onClick={() => setDateRange('month')}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          dateRange === 'month'
            ? 'bg-gold-500 text-black'
            : 'bg-dark-700 text-white hover:bg-dark-600'
        }`}
      >
        Last Month
      </button>
      <button
        onClick={() => setDateRange('quarter')}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          dateRange === 'quarter'
            ? 'bg-gold-500 text-black'
            : 'bg-dark-700 text-white hover:bg-dark-600'
        }`}
      >
        Last Quarter
      </button>
      <button
        onClick={() => setDateRange('year')}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          dateRange === 'year'
            ? 'bg-gold-500 text-black'
            : 'bg-dark-700 text-white hover:bg-dark-600'
        }`}
      >
        Last Year
      </button>
    </div>
  );

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

  const { totalSales, totalOrders } = getTotals();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 p-8">
        <h1 className="mb-6 text-3xl font-bold text-white">Reports & Analytics</h1>

        {/* Date Range Selector */}
        <DateRangeSelector />

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

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gold-500/30 bg-dark-800 p-5 shadow-lg">
            <div className="mb-3 flex items-center">
              <div className="mr-3 rounded-full bg-gold-500/20 p-2">
                <TrendingUp className="h-6 w-6 text-gold-500" />
              </div>
              <h3 className="text-lg font-medium text-white">Total Sales</h3>
            </div>
            <p className="text-3xl font-bold text-gold-500">${totalSales.toLocaleString()}</p>
            <p className="mt-1 text-sm text-gray-400">For selected period</p>
          </div>

          <div className="rounded-xl border border-gold-500/30 bg-dark-800 p-5 shadow-lg">
            <div className="mb-3 flex items-center">
              <div className="mr-3 rounded-full bg-gold-500/20 p-2">
                <BarChart4 className="h-6 w-6 text-gold-500" />
              </div>
              <h3 className="text-lg font-medium text-white">Total Orders</h3>
            </div>
            <p className="text-3xl font-bold text-gold-500">{totalOrders}</p>
            <p className="mt-1 text-sm text-gray-400">For selected period</p>
          </div>

          <div className="rounded-xl border border-gold-500/30 bg-dark-800 p-5 shadow-lg">
            <div className="mb-3 flex items-center">
              <div className="mr-3 rounded-full bg-gold-500/20 p-2">
                <PieChart className="h-6 w-6 text-gold-500" />
              </div>
              <h3 className="text-lg font-medium text-white">Avg. Order Value</h3>
            </div>
            <p className="text-3xl font-bold text-gold-500">
              ${totalOrders ? Math.round(totalSales / totalOrders) : 0}
            </p>
            <p className="mt-1 text-sm text-gray-400">For selected period</p>
          </div>

          <div className="rounded-xl border border-gold-500/30 bg-dark-800 p-5 shadow-lg">
            <div className="mb-3 flex items-center">
              <div className="mr-3 rounded-full bg-green-500/20 p-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-white">Growth</h3>
            </div>
            <p className="text-3xl font-bold text-green-500">+18%</p>
            <p className="mt-1 text-sm text-gray-400">Compared to previous period</p>
          </div>
        </div>

        {/* Sales & Orders Charts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-gold-500/30 bg-dark-800 p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-bold text-white">Sales Trend</h2>

            {/* Sales Chart Placeholder */}
            <div className="h-64 w-full">
              <div className="flex h-full flex-col">
                <div className="flex justify-between text-xs text-gray-400">
                  {salesData.map((day, i) => (
                    <div key={i} className="text-center">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  ))}
                </div>
                <div className="relative mt-2 flex h-full items-end justify-between">
                  {salesData.map((day, i) => {
                    const height = (day.sales / 3000) * 100;
                    return (
                      <div key={i} className="w-1/7 relative flex flex-col items-center">
                        <div
                          className={`w-12 rounded-t-sm bg-gold-500/80 transition-all duration-300 hover:bg-gold-400 ${styles.salesBar}`}
                          style={{ '--bar-height': `${height}%` } as React.CSSProperties}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">${day.sales}</span>
                      </div>
                    );
                  })}
                  <div className="absolute bottom-0 left-0 right-0 border-t border-gray-700"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gold-500/30 bg-dark-800 p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-bold text-white">Orders Trend</h2>

            {/* Orders Chart Placeholder */}
            <div className="h-64 w-full">
              <div className="flex h-full flex-col">
                <div className="flex justify-between text-xs text-gray-400">
                  {salesData.map((day, i) => (
                    <div key={i} className="text-center">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  ))}
                </div>
                <div className="relative mt-2 flex h-full items-end justify-between">
                  {salesData.map((day, i) => {
                    const height = (day.orders / 40) * 100;
                    return (
                      <div key={i} className="w-1/7 relative flex flex-col items-center">
                        <div
                          className={`w-12 rounded-t-sm bg-blue-500/80 transition-all duration-300 hover:bg-blue-400 ${styles.ordersBar}`}
                          style={{ '--bar-height': `${height}%` } as React.CSSProperties}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">{day.orders}</span>
                      </div>
                    );
                  })}
                  <div className="absolute bottom-0 left-0 right-0 border-t border-gray-700"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products & Distributors */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-gold-500/30 bg-dark-800 shadow-lg">
            <div className="border-b border-gold-500/20 p-6">
              <h2 className="text-xl font-bold text-white">Top Products</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold-500/10 text-left">
                    <th className="pb-2 text-sm font-medium text-gray-400">Product</th>
                    <th className="pb-2 text-right text-sm font-medium text-gray-400">Sales</th>
                    <th className="pb-2 text-right text-sm font-medium text-gray-400">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map(product => (
                    <tr key={product.id} className="border-b border-gold-500/10">
                      <td className="py-3 text-white">
                        <Link
                          href={`/admin/dashboard/products/${product.id}`}
                          className="hover:text-gold-400"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="py-3 text-right text-white">${product.sales}</td>
                      <td className="py-3 text-right text-white">{product.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gold-500/30 bg-dark-800 shadow-lg">
            <div className="border-b border-gold-500/20 p-6">
              <h2 className="text-xl font-bold text-white">Top Distributors</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold-500/10 text-left">
                    <th className="pb-2 text-sm font-medium text-gray-400">Distributor</th>
                    <th className="pb-2 text-right text-sm font-medium text-gray-400">Orders</th>
                    <th className="pb-2 text-right text-sm font-medium text-gray-400">
                      Commission
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topDistributors.map(distributor => (
                    <tr key={distributor.id} className="border-b border-gold-500/10">
                      <td className="py-3 text-white">
                        <Link
                          href={`/admin/dashboard/users/${distributor.id}`}
                          className="hover:text-gold-400"
                        >
                          {distributor.name}
                        </Link>
                      </td>
                      <td className="py-3 text-right text-white">{distributor.orders}</td>
                      <td className="py-3 text-right text-white">${distributor.commission}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
