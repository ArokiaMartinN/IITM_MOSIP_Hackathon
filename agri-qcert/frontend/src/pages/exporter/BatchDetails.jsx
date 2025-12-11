import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getBatchById } from '../../services/batchService';

export default function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatch();
  }, [id]);

  const loadBatch = async () => {
    try {
      setLoading(true);
      const response = await getBatchById(id);
      setBatch(response.batch);
    } catch (error) {
      console.error('Failed to load batch:', error);
      navigate('/exporter/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-red-600">Batch not found</div>
        </div>
      </div>
    );
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      submitted: { color: 'blue', text: 'Submitted' },
      inspection_pending: { color: 'yellow', text: 'Awaiting Inspection' },
      inspection_completed: { color: 'green', text: 'Inspection Complete' },
      certified: { color: 'green', text: 'Certified' },
      rejected: { color: 'red', text: 'Rejected' },
    };
    return statusMap[status] || { color: 'gray', text: 'Unknown' };
  };

  const statusInfo = getStatusInfo(batch.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/exporter/dashboard')}
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="card">
          <div className="flex justify-between items-start mb-6 pb-6 border-b">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Batch #{batch.id}</h1>
              <p className="text-gray-600 text-sm mt-2">
                Submitted on {new Date(batch.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
              {statusInfo.text}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Product Type</p>
                  <p className="text-lg font-medium text-gray-900">{batch.product_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <p className="text-lg font-medium text-gray-900">{batch.quantity} {batch.unit || 'kg'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Origin Location</p>
                  <p className="text-lg font-medium text-gray-900">{batch.location}</p>
                </div>
              </div>
            </div>

            {/* Destination Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Destination</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Destination Country/Region</p>
                  <p className="text-lg font-medium text-gray-900">{batch.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {batch.status.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {batch.notes && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <p className="text-gray-700">{batch.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline</h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">Batch Submitted</p>
                  <p className="text-sm text-gray-600">{new Date(batch.created_at).toLocaleString()}</p>
                </div>
              </div>

              {['inspection_pending', 'inspection_completed', 'certified'].includes(batch.status) && (
                <div className="flex space-x-4">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    batch.status !== 'submitted' ? 'bg-primary-600' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">Quality Inspection</p>
                    <p className="text-sm text-gray-600">
                      {batch.status === 'inspection_pending' ? 'Pending...' : 'Completed'}
                    </p>
                  </div>
                </div>
              )}

              {batch.status === 'certified' && (
                <div className="flex space-x-4">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Certificate Issued</p>
                    <p className="text-sm text-gray-600">Verifiable Credential generated</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
