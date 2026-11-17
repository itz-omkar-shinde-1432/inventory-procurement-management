import { apiRequest } from './api.js';

export const productService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    const query = params.toString();
    return apiRequest(`/products${query ? `?${query}` : ''}`);
  },
  create: (product) => apiRequest('/products', { method: 'POST', body: JSON.stringify(product) }),
  update: (id, product) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  remove: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
};
