import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { verifyVC } from '../../services/vcService';

export default function VerifyCredential() {
  const { credentialId: paramCredentialId } = useParams();
  const [searchParams] = useSearchParams();
  const queryCredentialId = searchParams.get('credentialId') || searchParams.get('id');
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];
  const credentialId = paramCredentialId || queryCredentialId || (lastSegment !== 'verify' ? lastSegment : '');
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingInfo, setPendingInfo] = useState('');
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    if (credentialId) {
      verifyCredential(credentialId);
    } else {
      setLoading(false);
      setError('Missing credential ID. Enter it below or scan a valid QR.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentialId]);

  const verifyCredential = async (idToVerify) => {
    try {
      setLoading(true);
      const result = await verifyVC(idToVerify);
      setCredential(result);
      setError('');
      setPendingInfo('');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to verify credential';
      const lowered = msg.toLowerCase();
      const looksPending = lowered.includes('pending') || lowered.includes('not issued') || lowered.includes('waiting') || lowered.includes('inspection');
      if (looksPending) {
        setPendingInfo('This certificate is still under review. Try again after the inspection is completed and the credential is issued.');
        setError('');
      } else {
        setError(msg);
      }
      setCredential(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!manualId.trim()) {
      setError('Please enter a credential ID');
      return;
    }
    await verifyCredential(manualId.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="card text-center py-8">
            <div className="text-lg">Verifying credential...</div>
          </div>
        ) : error || pendingInfo ? (
          <div className="card bg-red-50 border-2 border-red-200">
            <div className="text-center">
              <div className="text-5xl mb-4">{pendingInfo ? '⏳' : '❌'}</div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">{pendingInfo ? 'Credential Pending' : 'Verification Failed'}</h2>
              <p className="text-red-700">{pendingInfo || error}</p>
            </div>
            <form onSubmit={handleManualVerify} className="mt-6 space-y-3">
              <label className="block text-sm font-semibold text-gray-800 text-left">Enter credential ID</label>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  className="input-field flex-1"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Paste credential ID from QR or issuer"
                />
                <button type="submit" className="btn-primary whitespace-nowrap">Verify</button>
              </div>
            </form>
          </div>
        ) : credential ? (
          <div className="space-y-6">
            <div className="card bg-green-50 border-2 border-green-200">
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">Credential Verified</h2>
                <p className="text-green-700">This is a valid agricultural product certificate</p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Credential Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Credential ID</p>
                    <p className="text-lg font-medium text-gray-900">{credential.credentialId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Issuer</p>
                    <p className="text-lg font-medium text-gray-900">{credential.issuer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Issued Date</p>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(credential.issuanceDate).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-medium text-green-600">Valid</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Product Information</h3>
              <p className="text-gray-600 text-sm">
                Download the full credential details from your wallet or the issuing authority for complete product information.
              </p>
            </div>
          </div>
        ) : null}

        {!credential && !loading && (
          <div className="card mt-6 bg-blue-50 border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Where do I get a credential ID?</h3>
            <p className="text-sm text-blue-800">
              The ID only exists after QA completes the inspection and issues the Verifiable Credential. Ask the issuer for the credential ID or scan the QR they provide. If QA hasn’t issued it yet, verification will stay pending.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
