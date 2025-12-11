import { useEffect, useState } from 'react';
import { QrCode, Download } from 'lucide-react';
import Navbar from '../../components/Navbar';
import FormField from '../../components/FormField';
import Alert from '../../components/Alert';
import { verifyVC, getVC, generateQRCode } from '../../services/vcService';

export default function ImporterDashboard() {
  const [credentialId, setCredentialId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [credentialDetails, setCredentialDetails] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingInfo, setPendingInfo] = useState('');
  const [history, setHistory] = useState(() => {
    const cached = localStorage.getItem('vcHistory');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    localStorage.setItem('vcHistory', JSON.stringify(history.slice(0, 10)));
  }, [history]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!credentialId.trim()) {
      setError('Please enter a credential ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setPendingInfo('');
      const result = await verifyVC(credentialId);
      setVerificationResult(result);
      // Fetch full VC details and QR for the verified credential
      let detailPayload = null;
      try {
        const detail = await getVC(result.credentialId);
        detailPayload = detail.credential || detail;
        setCredentialDetails(detailPayload);
      } catch (e) {
        setCredentialDetails(null);
      }
      try {
        const qr = await generateQRCode(result.credentialId);
        setQrCode(qr.qrCode);
      } catch (e) {
        setQrCode('');
      }

      // Save to local history using fetched details when available
      setHistory((prev) => [
        {
          credentialId: result.credentialId,
          issuer: result.issuer,
          issuanceDate: result.issuanceDate,
          productType: detailPayload?.credentialSubject?.productType,
          destination: detailPayload?.credentialSubject?.destination,
          timestamp: new Date().toISOString(),
        },
        ...prev.filter((h) => h.credentialId !== result.credentialId),
      ].slice(0, 10));
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to verify credential';
      const lowered = msg.toLowerCase();
      const looksPending = lowered.includes('pending') || lowered.includes('not issued') || lowered.includes('waiting') || lowered.includes('inspection');
      if (looksPending) {
        setPendingInfo('This certificate is still pending review. Please check back after inspection completion and issuance.');
      } else {
        setError(msg);
      }
      setVerificationResult(null);
      setCredentialDetails(null);
      setQrCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verify Agricultural Certificates</h1>
          <p className="text-gray-600 mt-2">Instantly verify product quality certificates using Verifiable Credentials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-900">Scan QR Code</h3>
            <p className="text-gray-600 text-sm mt-2">Scan from packaging or documents</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900">Instant Verification</h3>
            <p className="text-gray-600 text-sm mt-2">Get results in seconds</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">🔐</div>
            <h3 className="font-semibold text-gray-900">Secure & Transparent</h3>
            <p className="text-gray-600 text-sm mt-2">Blockchain-based trust</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <QrCode size={28} className="text-primary-600" />
            <span>Verify Credential</span>
          </h2>

          {(error || pendingInfo) && (
            <Alert
              type="error"
              title={pendingInfo ? 'Credential Pending' : 'Verification Failed'}
              message={pendingInfo || error}
              onClose={() => { setError(''); setPendingInfo(''); }}
            />
          )}

          <form onSubmit={handleVerify} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="Enter credential ID or scan QR code..."
                className="input-field flex-1"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary whitespace-nowrap"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>

          {verificationResult && (
            <div className={`rounded-lg p-6 ${
              verificationResult.isValid
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`text-3xl ${verificationResult.isValid ? '✅' : '❌'}`}></div>
                <div>
                  <h3 className={`text-xl font-bold ${
                    verificationResult.isValid ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {verificationResult.message}
                  </h3>
                  <p className={`text-sm ${
                    verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                  }`}>
                    Credential ID: {verificationResult.credentialId}
                  </p>
                </div>
              </div>

              {verificationResult.isValid && (
                <div className="mt-4 space-y-2 text-sm">
                  <p><span className="font-semibold">Issuer:</span> {verificationResult.issuer}</p>
                  <p><span className="font-semibold">Issued:</span> {new Date(verificationResult.issuanceDate).toLocaleString()}</p>
                  {credentialDetails?.credentialSubject && (
                    <>
                      <p><span className="font-semibold">Product:</span> {credentialDetails.credentialSubject.productType}</p>
                      <p><span className="font-semibold">Quantity:</span> {credentialDetails.credentialSubject.quantity}</p>
                      <p><span className="font-semibold">Destination:</span> {credentialDetails.credentialSubject.destination}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {qrCode && (
            <div className="card mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                <a
                  href={qrCode}
                  download={`credential-${verificationResult?.credentialId || 'vc'}.png`}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download</span>
                </a>
              </div>
              <div className="flex justify-center">
                <img src={qrCode} alt="Credential QR" className="w-48 h-48" />
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="card mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recently Verified</h3>
              </div>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.credentialId} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <p className="text-sm text-gray-600">Credential ID</p>
                      <p className="font-semibold text-gray-900">{item.credentialId}</p>
                      {item.productType && (
                        <p className="text-sm text-gray-700">{item.productType} → {item.destination}</p>
                      )}
                      <p className="text-xs text-gray-500">Verified: {new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <button
                      className="btn-outline text-sm"
                      onClick={() => {
                        setCredentialId(item.credentialId);
                        handleVerify({ preventDefault: () => {} });
                      }}
                    >
                      Verify again
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Verify</h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex space-x-3">
                <span className="font-bold text-primary-600">1.</span>
                <span>Locate the QR code on the agricultural product packaging or export documents</span>
              </li>
              <li className="flex space-x-3">
                <span className="font-bold text-primary-600">2.</span>
                <span>Scan the QR code with your device camera or enter the credential ID manually</span>
              </li>
              <li className="flex space-x-3">
                <span className="font-bold text-primary-600">3.</span>
                <span>Click "Verify" to check the authenticity and details of the certificate</span>
              </li>
              <li className="flex space-x-3">
                <span className="font-bold text-primary-600">4.</span>
                <span>Review the quality metrics and issuer information to confirm compliance</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
