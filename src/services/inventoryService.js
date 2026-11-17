import { apiRequest } from './api.js';

export const inventoryService = {
  getAll: () => apiRequest('/inventory'),
  adjustStock: (id, type, quantity) => apiRequest(`/inventory/${id}/adjust`, {
    method: 'POST',
    body: JSON.stringify({ type, quantity: Number(quantity) }),
  }),
  getDashboard: () => apiRequest('/dashboard/summary'),
};
