import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Alert from '../../components/Alert';
import { createBatch } from '../../services/batchService';

export default function BatchSubmission() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    product_type: '',
    quantity: '',
    unit: 'kg',
    location: '',
    destination: '',
    notes: '',
    certifications: []
  });

  const productTypes = [
    'Basmati Rice',
    'Jasmine Rice',
    'Wheat',
    'Cotton',
    'Spices',
    'Tea',
    'Coffee',
    'Fruits',
    'Vegetables',
    'Dairy Products',
    'Other'
  ];

  const units = ['kg', 'boxes', 'tons', 'liters', 'pieces'];
  const certifications = ['ISO 22000', 'FSSAI', 'Organic', 'Fairtrade', 'GlobalGAP'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCertification = (cert) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.product_type || !formData.quantity || !formData.location || !formData.destination) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        productType: formData.product_type,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        location: formData.location,
        destination: formData.destination,
        notes: formData.notes || null,
      };

      await createBatch(payload);

      setSuccess(true);
      setTimeout(() => {
        navigate('/exporter/dashboard');
      }, 1200);
    } catch (err) {
      console.error('Batch submission error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to submit batch';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/exporter/dashboard')}
            className="text-green-50 hover:text-white mb-4 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-4xl font-bold">Submit New Batch</h1>
          <p className="text-green-50 mt-2">Provide details about your agricultural product for certification</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message="Batch submitted successfully! Redirecting..." />}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                <span className="text-3xl">🌾</span>
                <span>Product Information</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Type *
                  </label>
                  <select
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select product type</option>
                    {productTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="Enter quantity"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                      required
                    />
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                    >
                      {units.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Location Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                <span className="text-3xl">📍</span>
                <span>Location Information</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Production Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destination Country *
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="e.g., UAE, USA"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Certifications */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                <span className="text-3xl">✅</span>
                <span>Certifications & Standards</span>
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certifications.map(cert => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => handleCertification(cert)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-colors ${
                      formData.certifications.includes(cert)
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <span>{cert}</span>
                    {formData.certifications.includes(cert) && (
                      <span className="text-green-600 font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Additional Notes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                <span className="text-3xl">📝</span>
                <span>Additional Notes</span>
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes / Special Instructions
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special information about your batch..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition-colors"
                ></textarea>
              </div>
            </section>

            {/* Submit */}
            <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/exporter/dashboard')}
                className="px-8 py-3 text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Batch for Certification'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Processing Information</h3>
          <ul className="text-blue-800 space-y-2">
            <li>✓ Your batch will be reviewed by our QA team within 1-2 business days</li>
            <li>✓ You'll receive updates on the inspection progress</li>
            <li>✓ Upon certification, you'll get a blockchain-verified certificate with QR code</li>
            <li>✓ Export the certificate in multiple formats for your buyers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

           