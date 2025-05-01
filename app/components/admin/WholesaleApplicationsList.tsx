'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';

// Type for wholesale customer application
interface WholesaleApplication {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  metadata?: {
    company_name?: string;
    tax_id?: string;
    business_address?: string;
    estimated_order_size?: number;
    application_date?: string;
    is_wholesale_applicant?: boolean;
    is_wholesale_approved?: boolean;
  };
}

// Validation schema for rejection reason
const rejectReasonSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

export default function WholesaleApplicationsList() {
  const [applications, setApplications] = useState<WholesaleApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionResult, setActionResult] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Function to fetch wholesale applications
  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/wholesale/applications');

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError('Error loading wholesale applications. Please try again.');
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to approve an application
  const approveApplication = async (customerId: string) => {
    try {
      const response = await fetch(`/api/admin/wholesale/applications/${customerId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setActionResult({
          success: true,
          message: 'Application approved successfully',
        });

        // Refresh the applications list
        fetchApplications();
      } else {
        setActionResult({
          success: false,
          message: $1?.$2 || 'Failed to approve application',
        });
      }
    } catch (err) {
      setActionResult({
        success: false,
        message: 'An error occurred while approving the application',
      });
      console.error('Error approving application:', err);
    }
  };

  // Function to open reject modal
  const openRejectModal = (customerId: string) => {
    setRejectingId(customerId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Function to close reject modal
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectingId(null);
  };

  // Function to reject an application
  const rejectApplication = async () => {
    if (!rejectingId) return;

    try {
      // Validate reason
      rejectReasonSchema.parse({ reason: rejectReason });

      const response = await fetch(`/api/admin/wholesale/applications/${rejectingId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const result = await response.json();

      if (response.ok) {
        setActionResult({
          success: true,
          message: 'Application rejected successfully',
        });

        // Close modal and refresh applications
        closeRejectModal();
        fetchApplications();
      } else {
        setActionResult({
          success: false,
          message: result.error || 'Failed to reject application',
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setActionResult({
          success: false,
          message: err.errors[0]?.message || 'Validation error',
        });
      } else {
        setActionResult({
          success: false,
          message: 'An error occurred while rejecting the application',
        });
        console.error('Error rejecting application:', err);
      }
    }
  };

  // Format date string
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Wholesale Applications</h2>
        <button
          onClick={fetchApplications}
          className="rounded-lg bg-dark-700 px-4 py-2 text-sm text-white hover:bg-dark-600"
        >
          Refresh
        </button>
      </div>

      {actionResult.message && (
        <div
          className={`mb-4 rounded-lg p-4 ${
            actionResult.success ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
          }`}
        >
          {actionResult.message}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gold-500"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-500/20 p-4 text-red-200">{error}</div>
      ) : applications.length === 0 ? (
        <div className="rounded-lg bg-dark-800 p-6 text-center text-gray-400">
          <p>No pending wholesale applications found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gold-500/10 bg-dark-800/70 shadow-md">
          <table className="w-full table-auto">
            <thead className="bg-dark-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Order Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {applications.map(app => (
                <tr key={app.id} className="hover:bg-dark-700/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                    <div className="font-medium">{app.metadata?.company_name || 'N/A'}</div>
                    <div className="text-xs text-gray-400">ID: {app.metadata?.tax_id || 'N/A'}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                    <div>{`${app.first_name} ${app.last_name}`}</div>
                    <div className="text-xs text-gray-400">{app.email}</div>
                    {app.phone && <div className="text-xs text-gray-400">{app.phone}</div>}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                    {app.metadata?.estimated_order_size
                      ? `${app.metadata.estimated_order_size} units`
                      : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                    {formatDate(app.metadata?.application_date)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approveApplication(app.id)}
                        className="rounded-md bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(app.id)}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-dark-800 p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-white">Reject Application</h3>
            <p className="mb-4 text-gray-300">
              Please provide a reason for rejecting this wholesale application.
            </p>

            <div className="mb-4">
              <label htmlFor="reason" className="mb-2 block text-sm text-gray-400">
                Reason for Rejection
              </label>
              <textarea
                id="reason"
                rows={4}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-dark-700 px-4 py-2 text-white"
                placeholder="Enter rejection reason..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeRejectModal}
                className="rounded-md border border-gray-600 bg-transparent px-4 py-2 text-white hover:bg-dark-700"
              >
                Cancel
              </button>
              <button
                onClick={rejectApplication}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
