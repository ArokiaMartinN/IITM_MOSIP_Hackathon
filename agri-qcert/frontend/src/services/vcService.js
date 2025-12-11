import client from './apiClient';

export const generateVC = async (inspectionId) => {
  const response = await client.post('/credentials/generate', { inspectionId });
  return response.data;
};

export const getVC = async (id) => {
  const response = await client.get(`/credentials/${id}`);
  return response.data;
};

export const verifyVC = async (credentialId) => {
  // Prefer POST for authenticated/manual entry; GET path used by QR deep links
  const url = credentialId ? `/credentials/verify/${credentialId}` : '/credentials/verify';
  const response = credentialId
    ? await client.get(url)
    : await client.post('/credentials/verify', { credentialId });
  return response.data;
};

export const generateQRCode = async (id) => {
  const response = await client.get(`/credentials/${id}/qrcode`);
  return response.data;
};
