import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import FormField from '../../components/FormField';
import Alert from '../../components/Alert';
import { getInspectionById, getInspections, updateInspection, completeInspection } from '../../services/inspectionService';
import { generateVC } from '../../services/vcService';

export default function InspectionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showGenerateVC, setShowGenerateVC] = useState(false);
  const [vcLoading, setVcLoading] = useState(false);
  const [vcSuccess, setVcSuccess] = useState(false);
  const [credentialId, setCredentialId] = useState(null);
  
  const [inspection, setInspection] = useState(null);
  const [formData, setFormData] = useState({
    moistureLevel: '',
    pesticideContent: '',
    organicStatus: 'no',
    isoCodes: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadInspection();
  }, [id]);

  const loadInspection = async () => {
    try {
      setLoading(true);
      const response = await getInspectionById(id);
      const insp = response.inspection || response.inspections?.[0];
      if (insp) {
        setInspection(insp);
        setFormData({
          moistureLevel: insp.moisture_level || '',
          pesticideContent: insp.pesticide_content || '',
          organicStatus: insp.organic_status ? 'yes' : 'no',
          isoCodes: insp.iso_codes || '',
          notes: insp.notes || '',
        });
      } else {
        setError('Inspection not found');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load inspection');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await updateInspection(id, {
        moistureLevel: parseFloat(formData.moistureLevel) || null,
        pesticideContent: parseFloat(formData.pesticideContent) || null,
        organicStatus: formData.organicStatus === 'yes',
        isoCodes: formData.isoCodes,
        notes: formData.notes,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadInspection();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteInspection = async () => {
    try {
      setSubmitting(true);
      setError('');
      await completeInspection(id);
      setSuccess(true);
      await loadInspection();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateVC = async () => {
    try {
      setVcLoading(true);
      setError('');
      console.log('Calling generateVC with id:', id);
      const result = await generateVC(parseInt(id));
      console.log('Full response:', JSON.stringify(result, null, 2));
      
      // Try multiple fallbacks to extract credential ID
      let vcId = result?.credential?.credentialId || 
                result?.credential?.id || 
                result?.credentialId || 
                result?.id;
      
      if (!vcId) {
        console.error('No credential ID found in response:', result);
        setError('Credential issued but ID not found in response. Check console.');
        return;
      }
      
      setCredentialId(vcId);
      setVcSuccess(true);
      console.log('VC generated with ID:', vcId);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to generate credential';
      console.error('VC generation error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: errMsg,
        fullError: err
      });
      setError(errMsg);
    } finally {
      setVcLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p>Loading inspection...</p>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-red-600">Inspection not found</p>
          <Link to="/qa-agency/inspections" className="text-primary-600 hover:text-primary-700">
            Back to Inspections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/qa-agency/inspections"
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Inspections</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Quality Inspection Form</h1>
        <p className="text-gray-600 mb-6">Batch #{inspection.batch_id} · Status: <span className="font-semibold capitalize">{inspection.status}</span></p>

        {success && (
          <Alert
            type="success"
            title="Success!"
            message="Inspection data has been saved."
          />
        )}

        {vcSuccess && (
          <Alert
            type="success"
            title="Credential Issued!"
            message={`Verifiable credential generated successfully.\nCredential ID: ${credentialId}`}
          />
        )}

        {!vcSuccess && (
          <div className="card bg-blue-50 border-2 border-blue-200 mb-4">
            <p className="text-sm text-blue-800">
              Credential IDs are created only after you click "Issue Verifiable Credential". Exporters/importers cannot verify until issuance is done.
            </p>
          </div>
        )}

        {error && (
          <Alert
            type="error"
            title="Error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        <div className="card space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quality Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Moisture Level (%)"
                  type="number"
                  name="moistureLevel"
                  value={formData.moistureLevel}
                  onChange={handleChange}
                  error={errors.moistureLevel}
                  placeholder="0.0"
                  step="0.1"
                  min="0"
                  max="100"
                />

                <FormField
                  label="Pesticide Content (ppm)"
                  type="number"
                  name="pesticideContent"
                  value={formData.pesticideContent}
                  onChange={handleChange}
                  error={errors.pesticideContent}
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Certification Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Certification Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Organic Status</label>
                  <select
                    name="organicStatus"
                    value={formData.organicStatus}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="no">Not Organic</option>
                    <option value="yes">Organic Certified</option>
                    <option value="in-transition">In Transition</option>
                  </select>
                </div>

                <FormField
                  label="ISO Codes"
                  type="text"
                  name="isoCodes"
                  value={formData.isoCodes}
                  onChange={handleChange}
                  placeholder="e.g., ISO 22000, ISO 3864"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
              <FormField
                label="Inspection Notes"
                type="textarea"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional observations or findings..."
                rows="4"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 pt-6 border-t">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? 'Saving...' : 'Save Inspection'}
              </button>
              {inspection.status !== 'completed' && (
                <button
                  type="button"
                  onClick={handleCompleteInspection}
                  disabled={submitting}
                  className="btn-secondary flex-1"
                >
                  {submitting ? 'Completing...' : 'Mark Complete'}
                </button>
              )}
              {inspection.status === 'completed' && (
                <button
                  type="button"
                  onClick={() => setShowGenerateVC(true)}
                  className="btn-secondary flex-1"
                >
                  Issue Credential
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Generate VC Modal */}
        {showGenerateVC && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                {credentialId ? (
                  <>
                    <h2 className="text-xl font-semibold text-green-700 mb-4">✅ Credential Issued!</h2>
                    <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
                      <p className="text-sm text-gray-600 mb-2">Credential ID (share with importers):</p>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 text-sm bg-white p-2 rounded border border-gray-200 break-all">{credentialId}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(credentialId);
                            alert('Copied to clipboard!');
                          }}
                          className="px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Importers can now verify this credential using the ID or QR code.</p>
                    <button
                      onClick={() => {
                        setShowGenerateVC(false);
                        setCredentialId(null);
                      }}
                      className="btn-primary w-full"
                    >
                      Done
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Issue Verifiable Credential</h2>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to issue a verifiable credential for Batch #{inspection.batch_id}? This action cannot be undone.
                    </p>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setShowGenerateVC(false)}
                        className="btn-outline flex-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleGenerateVC}
                        disabled={vcLoading}
                        className="btn-primary flex-1"
                      >
                        {vcLoading ? 'Issuing...' : 'Issue'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
