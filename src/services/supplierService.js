import { apiRequest } from './api.js';

export const supplierService = {
  getAll: () => apiRequest('/suppliers'),
  create: (supplier) => apiRequest('/suppliers', { method: 'POST', body: JSON.stringify(supplier) }),
  update: (id, supplier) => apiRequest(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(supplier) }),
  remove: (id) => apiRequest(`/suppliers/${id}`, { method: 'DELETE' }),
};
