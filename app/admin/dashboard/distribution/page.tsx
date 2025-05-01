'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Package, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';

interface Distributor {
  id: string;
  name: string;
  email: string;
  completedOrders?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    name?: string;
  }>;
  status: string;
}

export default function DistributionDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDistributionData = async () => {
      try {
        // Fetch distributors data
        const distributorsResponse = await fetch('/api/admin/users?role=Distributor');
        const distributorsData = await $1?.$2();

        // Fetch pending distribution orders
        const ordersResponse = await fetch('/api/admin/orders?status=pending-distribution');
        const ordersData = await $1?.$2();

        setDistributors(distributorsData.users || []);
        setPendingOrders(ordersData.orders || []);
      } catch (error) {
        console.error('Error fetching distribution data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDistributionData();
  }, []);

  const filteredOrders = pendingOrders.filter(
    order =>
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Distribution Management</h1>
        <p className="mt-2 text-gray-400">Manage distributors and order fulfillment</p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gold-500"></div>
        </div>
      ) : (
        <>
          {/* Distribution Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gold-500/30 bg-dark-800 p-5 shadow-lg">
              <div className="mb-3 flex items-center">
                <div className="mr-3 rounded-full bg-gold-500/20 p-2">
                  <Truck className="h-6 w-6 text-gold-500" />
                </div>
                <h3 className="text-lg font-medium text-white">Active Distributors</h3>
              </div>
              <p className="text-3xl font-bold text-gold-500">{distributors.length}</p>
            </div>

            <div className="rounded-xl border border-gold-500/30 bg-dark-800 p-5 shadow-lg">
              <div className="mb-3 flex items-center">
                <div className="mr-3 rounded-full bg-gold-500/20 p-2">
                  <Package className="h-6 w-6 text-gold-500" />
                </div>
                <h3 className="text-lg font-medium text-white">Pending Orders</h3>
              </div>
              <p className="text-3xl font-bold text-gold-500">{pendingOrders.length}</p>
            </div>

            <div className="rounded-xl border border-gold-500/30 bg-dark-800 p-5 shadow-lg">
              <div className="mb-3 flex items-center">
                <div className="mr-3 rounded-full bg-gold-500/20 p-2">
                  <ArrowRight className="h-6 w-6 text-gold-500" />
                </div>
                <h3 className="text-lg font-medium text-white">Quick Actions</h3>
              </div>
              <Link
                href="/admin/dashboard/orders"
                className="mt-2 inline-block rounded-lg bg-gold-500 px-4 py-2 text-sm font-medium text-black hover:bg-gold-400"
              >
                Assign Orders
              </Link>
            </div>
          </div>

          {/* Orders Pending Distribution */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Orders Pending Distribution</h2>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 pl-10 text-white"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gold-500/30 bg-dark-800 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gold-500/20 bg-dark-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                        Order ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                        Items
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order, index) => (
                        <tr
                          key={order.id || index}
                          className="border-b border-gold-500/10 hover:bg-dark-700/50"
                        >
                          <td className="px-4 py-3 text-sm text-white">{order.orderNumber}</td>
                          <td className="px-4 py-3 text-sm text-white">{order.customerName}</td>
                          <td className="px-4 py-3 text-sm text-white">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-white">
                            {order.items?.length || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-white">
                            <span className="rounded-full bg-yellow-500/20 px-2.5 py-1 text-xs font-medium text-yellow-400">
                              Pending Assignment
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Link
                              href={`/admin/dashboard/orders/${order.id}`}
                              className="rounded-lg bg-gold-500 px-3 py-1 text-xs font-medium text-black hover:bg-gold-400"
                            >
                              Assign
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                          {searchQuery
                            ? 'No orders match your search query'
                            : 'No orders pending distribution at this time'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Distributors List */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-white">Active Distributors</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {distributors.length > 0 ? (
                distributors.map((distributor, index) => (
                  <div
                    key={distributor.id || index}
                    className="rounded-xl border border-gold-500/30 bg-dark-800 p-4 shadow-lg"
                  >
                    <div className="mb-3 flex items-center">
                      <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/20 text-gold-500">
                        {distributor.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{distributor.name}</h3>
                        <p className="text-sm text-gray-400">{distributor.email}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Orders Completed</p>
                        <p className="font-medium text-white">{distributor.completedOrders || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Performance</p>
                        <p className="font-medium text-green-400">Good</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/admin/dashboard/users/${distributor.id}`}
                        className="flex w-full items-center justify-center rounded-lg border border-gold-500/50 bg-transparent px-3 py-2 text-sm font-medium text-gold-500 transition-colors hover:bg-gold-500/10"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 rounded-xl border border-gold-500/30 bg-dark-800 p-6 text-center text-gray-400">
                  No active distributors found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
