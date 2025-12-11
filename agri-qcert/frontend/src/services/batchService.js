import client from './apiClient';

export const createBatch = async (batchData) => {
  const response = await client.post('/batches', batchData);
  return response.data;
};

export const getBatches = async (filters = {}) => {
  const response = await client.get('/batches', { params: filters });
  return response.data;
};

export const getBatchById = async (id) => {
  const response = await client.get(`/batches/${id}`);
  return response.data;
};

export const updateBatch = async (id, batchData) => {
  const response = await client.put(`/batches/${id}`, batchData);
  return response.data;
};

export const deleteBatch = async (id) => {
  const response = await client.delete(`/batches/${id}`);
  return response.data;
};
