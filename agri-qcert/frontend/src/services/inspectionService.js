import client from './apiClient';

export const createInspection = async (inspectionData) => {
  const response = await client.post('/inspections', inspectionData);
  return response.data;
};

export const getInspections = async (filters = {}) => {
  const response = await client.get('/inspections', { params: filters });
  return response.data;
};

export const updateInspection = async (id, inspectionData) => {
  const response = await client.put(`/inspections/${id}`, inspectionData);
  return response.data;
};

export const getInspectionById = async (id) => {
  const response = await client.get(`/inspections/${id}`);
  return response.data;
};

export const completeInspection = async (id) => {
  const response = await client.post(`/inspections/${id}/complete`);
  return response.data;
};
