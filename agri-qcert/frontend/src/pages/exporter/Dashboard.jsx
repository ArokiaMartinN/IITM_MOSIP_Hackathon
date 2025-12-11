import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';
import Alert from '../../components/Alert';
import { getBatches } from '../../services/batchService';

export default function ExporterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    certified: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await getBatches();
      const list = Array.isArray(data) ? data : data?.batches || [];
      calculateStats(list);
      setError(null);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to load batches';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeStatus = (status) => {
    const raw = (status || '').toString().trim().toLowerCase();
    if (raw === 'inspection_pending' || raw === 'pending' || raw === 'under_review') return 'inspection_pending';
    if (raw === 'inspection_completed' || raw === 'completed') return 'inspection_completed';
    if (raw === 'certified' || raw === 'approved') return 'certified';
    if (raw === 'rejected' || raw === 'failed') return 'rejected';
    return raw || 'submitted';
  };

  const calculateStats = (batchList) => {
    const normalized = batchList.map((b) => ({ ...b, status: normalizeStatus(b.status) }));
    setStats({
      total: normalized.length,
      pending: normalized.filter((b) => b.status === 'inspection_pending' || b.status === 'submitted').length,
      certified: normalized.filter((b) => b.status === 'certified').length,
      rejected: normalized.filter((b) => b.status === 'rejected').length,
    });
    setBatches(normalized);
  };

  const getStatusColor = (status) => {
    const s = normalizeStatus(status);
    switch(s) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'inspection_pending': return 'bg-yellow-100 text-yellow-800';
      case 'inspection_completed': return 'bg-purple-100 text-purple-800';
      case 'certified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    const s = normalizeStatus(status);
    switch(s) {
      case 'submitted': return 'Submitted';
      case 'inspection_pending': return 'Pending Inspection';
      case 'inspection_completed': return 'Inspection Done';
      case 'certified': return 'Certified ✓';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold">Exporter Dashboard</h1>
              <p className="text-green-50 mt-2">Welcome back, {user?.name}!</p>
            </div>
            <button
              onClick={() => navigate('/exporter/submit-batch')}
              className="px-6 py-3 bg-white text-green-600 font-bold rounded-lg hover:bg-green-50 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <span>+ Submit New Batch</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && <Alert type="error" message={error} />}
        {loading && (
          <div className="mb-6 text-sm text-gray-600 flex items-center space-x-2">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Loading your batches...</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Batches', value: stats.total, icon: '📦', color: 'from-blue-500 to-cyan-500' },
            { label: 'Pending Review', value: stats.pending, icon: '⏳', color: 'from-yellow-500 to-orange-500' },
            { label: 'Certified', value: stats.certified, icon: '✓', color: 'from-green-500 to-emerald-500' },
            { label: 'Rejected', value: stats.rejected, icon: '✗', color: 'from-red-500 to-pink-500' }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{stat.label}</p>
                  <p className="text-4xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="text-5xl opacity-50">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Batches Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <span>📋 Your Batches</span>
            </h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Filter
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Export
              </button>
            </div>
          </div>

          {(!loading && batches.length === 0) ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600 text-lg">No batches submitted yet</p>
              <button
                onClick={() => navigate('/exporter/submit-batch')}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Your First Batch
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Destination</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quality</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{batch.product_type}</td>
                      <td className="px-6 py-4 text-gray-600">{batch.quantity} {batch.unit}</td>
                      <td className="px-6 py-4 text-gray-600">{batch.destination}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(batch.status)}`}>
                          {getStatusLabel(batch.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {batch.quality_score ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${batch.quality_score >= 90 ? 'bg-green-500' : batch.quality_score >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${batch.quality_score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">{batch.quality_score}%</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/exporter/batch/${batch.id}`)}
                          className="text-green-600 hover:text-green-800 font-semibold text-sm"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Certification Rate</h3>
            <div className="text-4xl font-bold text-green-600">
              {stats.total > 0 ? Math.round((stats.certified / stats.total) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-600 mt-2">Of your batches certified successfully</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Avg. Processing Time</h3>
            <div className="text-4xl font-bold text-blue-600">3-5</div>
            <p className="text-sm text-gray-600 mt-2">Days per batch certification</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">✓ Batch #2 certified</p>
              <p className="text-sm text-gray-600">⏳ Batch #1 under review</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


