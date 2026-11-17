export function stockStatus(quantity, minStock) {
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= minStock) return 'Low Stock';
  return 'In Stock';
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
