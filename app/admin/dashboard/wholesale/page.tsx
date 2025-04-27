import WholesaleApplicationsList from '../../../components/admin/WholesaleApplicationsList';

export const metadata = {
  title: 'Wholesale Management - Admin Dashboard',
  description: 'Manage wholesale accounts and applications',
};

export default function WholesaleManagementPage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">Wholesale Management</h1>
        <p className="text-gray-400">Manage wholesale applications and accounts</p>
      </div>

      <div className="grid gap-8">
        <div className="rounded-xl border border-gold-500/10 bg-dark-900/50 p-6 shadow-lg">
          <WholesaleApplicationsList />
        </div>
      </div>
    </div>
  );
}
