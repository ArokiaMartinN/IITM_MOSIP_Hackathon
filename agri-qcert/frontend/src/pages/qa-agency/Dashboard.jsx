import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Alert from '../../components/Alert';
import { useAuth } from '../../hooks/useAuth';
import { getInspections, createInspection } from '../../services/inspectionService';
import { generateVC, getVC } from '../../services/vcService';
import { getBatches } from '../../services/batchService';

export default function QADashboard() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [submittedBatches, setSubmittedBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulingId, setSchedulingId] = useState(null);
  const [error, setError] = useState('');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [vcStatus, setVcStatus] = useState(null);
  const [vcLoading, setVcLoading] = useState(false);

  useEffect(() => {
    loadInspections();
    loadSubmittedBatches();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const response = await getInspections();
      setInspections(response.inspections || []);
    } catch (error) {
      console.error('Failed to load inspections:', error);
      setError('Failed to load inspections');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmittedBatches = async () => {
    try {
      const response = await getBatches({ status: 'submitted' });
      const batches = Array.isArray(response) ? response : response.batches || [];
      setSubmittedBatches(batches);
    } catch (err) {
      console.error('Failed to load submitted batches:', err);
      setError('Failed to load submitted batches');
    }
  };

  const handleScheduleInspection = async (batchId) => {
    if (!user?.id) {
      setError('Missing QA user context');
      return;
    }
    try {
      setSchedulingId(batchId);
      setError('');
      const scheduledDate = new Date().toISOString().split('T')[0];
      await createInspection({ batchId, qaAgencyId: user.id, scheduledDate });
      await Promise.all([loadInspections(), loadSubmittedBatches()]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule inspection');
    } finally {
      setSchedulingId(null);
    }
  };

  const handleSelectInspection = async (inspection) => {
    setSelectedInspection(inspection);
    setVcLoading(true);
    try {
      // Try to fetch the VC if it exists
      const vc = await getVC(inspection.id);
      setVcStatus({ issued: true, credentialId: vc.credential?.id || vc.id, error: null });
    } catch (err) {
      setVcStatus({ issued: false, credentialId: null, error: 'No VC issued yet' });
    } finally {
      setVcLoading(false);
    }
  };

  const handleIssueVC = async () => {
    if (!selectedInspection) return;
    setVcLoading(true);
    try {
      const result = await generateVC(selectedInspection.id);
      setVcStatus({ issued: true, credentialId: result.credential?.id, error: null });
    } catch (err) {
      setVcStatus({ issued: false, credentialId: null, error: err.response?.data?.error || 'Failed to issue VC' });
    } finally {
      setVcLoading(false);
    }
  };


  const stats = [
    {
      label: 'Total Inspections',
      value: inspections.length,
      icon: '📋',
    },
    {
      label: 'Completed',
      value: inspections.filter(i => i.status === 'completed').length,
      icon: '✅',
    },
    {
      label: 'Pending',
      value: inspections.filter(i => i.status !== 'completed').length,
      icon: '⏳',
    },
  ];

  const recentInspections = inspections.slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">QA Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage product quality inspections and issue certificates</p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-primary-600 mt-2">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Inspections */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Inspections</h2>
            <Link to="/qa-agency/inspections" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : recentInspections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No inspections yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Batch ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Scheduled</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInspections.map((inspection) => (
                      <tr key={inspection.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectInspection(inspection)}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{inspection.batch_id}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                            inspection.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inspection.status === 'completed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                            <span className="capitalize">{inspection.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(inspection.scheduled_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Link
                            to={`/qa-agency/inspection/${inspection.id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {inspection.status === 'completed' ? 'View' : 'Complete'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedInspection && (
                <div className="mt-8 pt-8 border-t-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Flow for Batch #{selectedInspection.batch_id}</h3>
                  
                  <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold text-lg">1</div>
                      <p className="mt-2 text-sm font-semibold text-gray-700">Inspection Created</p>
                      <p className="text-xs text-gray-500">{new Date(selectedInspection.created_at).toLocaleDateString()}</p>
                    </div>

                    <ArrowRight size={24} className="text-gray-400 hidden md:block" />
                    <div className="w-full md:w-1 h-1 md:h-12 bg-gray-300 md:bg-gray-400 md:hidden" />

                    <div className={`flex-1 text-center p-3 rounded-lg ${selectedInspection.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${selectedInspection.status === 'completed' ? 'bg-green-200 text-green-600' : 'bg-yellow-200 text-yellow-600'} font-bold text-lg`}>2</div>
                      <p className="mt-2 text-sm font-semibold text-gray-700">Inspection {selectedInspection.status === 'completed' ? 'Completed' : 'In Progress'}</p>
                      <p className="text-xs text-gray-500">{selectedInspection.completed_at ? new Date(selectedInspection.completed_at).toLocaleDateString() : 'Pending'}</p>
                    </div>

                    <ArrowRight size={24} className="text-gray-400 hidden md:block" />
                    <div className="w-full md:w-1 h-1 md:h-12 bg-gray-300 md:bg-gray-400 md:hidden" />

                    <div className={`flex-1 text-center p-3 rounded-lg ${vcStatus?.issued ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${vcStatus?.issued ? 'bg-purple-200 text-purple-600' : 'bg-gray-200 text-gray-600'} font-bold text-lg`}>3</div>
                      <p className="mt-2 text-sm font-semibold text-gray-700">VC {vcStatus?.issued ? 'Issued' : 'Not Yet'}</p>
                      <p className="text-xs text-gray-500">{vcStatus?.credentialId ? `ID: ${vcStatus.credentialId}` : 'Ready to issue'}</p>
                    </div>
                  </div>

                  {selectedInspection.status === 'completed' && !vcStatus?.issued && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={handleIssueVC}
                        disabled={vcLoading}
                        className="btn-primary px-6 py-2"
                      >
                        {vcLoading ? 'Issuing...' : 'Issue Verifiable Credential'}
                      </button>
                      {vcStatus?.error && <p className="text-red-600 text-sm mt-2">{vcStatus.error}</p>}
                    </div>
                  )}

                  {vcStatus?.issued && (
                    <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                      <p className="text-green-700 font-semibold">✅ Credential Issued!</p>
                      <p className="text-sm text-green-600 mt-1">Credential ID: <span className="font-mono">{vcStatus.credentialId}</span></p>
                      <p className="text-xs text-gray-500 mt-2">The QR code and verification link are ready for the importer.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submitted batches awaiting QA */}
        <div className="card mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Submitted Batches Awaiting QA</h2>
            <span className="text-sm text-gray-500">Auto-schedule for today</span>
          </div>

          {submittedBatches.length === 0 ? (
            <div className="text-center py-6 text-gray-500">No submitted batches waiting for inspection.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Batch</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Destination</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedBatches.map((batch) => (
                    <tr key={batch.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{batch.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{batch.product_type}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{batch.quantity} {batch.unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{batch.destination}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(batch.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleScheduleInspection(batch.id)}
                          disabled={schedulingId === batch.id}
                          className="btn-primary px-4 py-2 text-sm"
                        >
                          {schedulingId === batch.id ? 'Scheduling...' : 'Schedule Inspection'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
