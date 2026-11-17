import { apiRequest } from './api.js';

export const purchaseOrderService = {
  getAll: () => apiRequest('/purchase-orders'),
  create: (order) => apiRequest('/purchase-orders', { method: 'POST', body: JSON.stringify(order) }),
  update: (id, order) => apiRequest(`/purchase-orders/${id}`, { method: 'PUT', body: JSON.stringify(order) }),
  receive: (id) => apiRequest(`/purchase-orders/${id}/receive`, { method: 'POST' }),
  remove: (id) => apiRequest(`/purchase-orders/${id}`, { method: 'DELETE' }),
};
