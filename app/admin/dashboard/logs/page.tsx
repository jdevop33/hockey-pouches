'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/NewLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import { LogEntry, LogLevel } from '@/lib/logger';

export default function LogsPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [limit, setLimit] = useState(100);
  const [isDevelopment, setIsDevelopment] = useState(false);

  // Fetch logs
  const fetchLogs = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (selectedLevel !== 'all') {
        queryParams.append('level', selectedLevel);
      }
      
      queryParams.append('limit', limit.toString());

      const response = await fetch(`/api/admin/logs?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403 && process.env.NODE_ENV === 'production') {
          setIsDevelopment(false);
          throw new Error('Logs are only available in development mode');
        } else {
          throw new Error('Failed to fetch logs');
        }
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setIsDevelopment(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching logs');
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear logs
  const clearLogs = async () => {
    if (!token) return;

    if (!window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/logs', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear logs');
      }

      showToast('Logs cleared successfully', 'success');
      fetchLogs();
    } catch (err: any) {
      setError(err.message || 'An error occurred while clearing logs');
      showToast('Failed to clear logs', 'error');
      console.error('Error clearing logs:', err);
    }
  };

  // Load logs on mount and when filters change
  useEffect(() => {
    if (!authLoading && user?.role === 'Admin') {
      fetchLogs();
    }
  }, [authLoading, user, token, selectedLevel, limit]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get color for log level
  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'text-gray-600';
      case LogLevel.INFO:
        return 'text-blue-600';
      case LogLevel.WARN:
        return 'text-yellow-600';
      case LogLevel.ERROR:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Check if user is authorized
  if (!authLoading && (!user || user.role !== 'Admin')) {
    return (
      <Layout>
        <div className="p-8 text-center text-red-600">
          Access Denied. You must be an Admin to view this page.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Application Logs</h1>
          <div className="flex space-x-4">
            <Button
              variant="primary"
              onClick={fetchLogs}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Refresh Logs
            </Button>
            <Button
              variant="danger"
              onClick={clearLogs}
              disabled={isLoading || logs.length === 0}
            >
              Clear Logs
            </Button>
          </div>
        </div>

        {!isDevelopment && (
          <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-md">
            <p className="font-semibold">Logs are only available in development mode.</p>
            <p className="text-sm mt-1">
              In production, logs are sent to external logging services. Please check your logging service dashboard.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-md shadow">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-40">
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Log Level
              </label>
              <select
                id="level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Levels</option>
                <option value={LogLevel.DEBUG}>Debug</option>
                <option value={LogLevel.INFO}>Info</option>
                <option value={LogLevel.WARN}>Warning</option>
                <option value={LogLevel.ERROR}>Error</option>
              </select>
            </div>
            <div className="w-40">
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
                Limit
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value={50}>50 entries</option>
                <option value={100}>100 entries</option>
                <option value={200}>200 entries</option>
                <option value={500}>500 entries</option>
                <option value={1000}>1000 entries</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading logs...</p>
          </div>
        )}

        {/* Logs Table */}
        {!isLoading && logs.length === 0 && (
          <div className="bg-white p-8 rounded-md shadow text-center">
            <p className="text-gray-500">No logs found.</p>
          </div>
        )}

        {!isLoading && logs.length > 0 && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Context
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.context && (
                          <pre className="whitespace-pre-wrap text-xs">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        )}
                        {log.error && (
                          <div className="mt-2">
                            <div className="text-xs font-semibold text-red-600">Error:</div>
                            <pre className="whitespace-pre-wrap text-xs text-red-500">
                              {JSON.stringify(log.error, null, 2)}
                            </pre>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
