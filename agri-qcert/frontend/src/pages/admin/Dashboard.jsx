import Navbar from '../../components/Navbar';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '1,234' },
    { label: 'Total Batches', value: '856' },
    { label: 'Verified Credentials', value: '645' },
    { label: 'Pending Inspections', value: '89' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="card">
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">API Server</span>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✅ Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Database</span>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✅ Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Credential Service</span>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✅ Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
