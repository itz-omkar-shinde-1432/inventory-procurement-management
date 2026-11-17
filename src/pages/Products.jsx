import { useState } from 'react';
import { useAsync } from '../hooks/useAsync.js';
import { productService } from '../services/productService.js';
import { supplierService } from '../services/supplierService.js';
import { stockStatus } from '../utils/format.js';
import StateView from '../components/StateView.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';

const EMPTY = {
  sku: '',
  name: '',
  category: '',
  minStock: 0,
  unitPrice: '',
  supplierId: '',
  quantity: 0,
  warehouse: 'Main Warehouse',
};

function ProductForm({ product, suppliers, onSaved, onClose }) {
  const editing = Boolean(product);
  const [form, setForm] = useState(product
    ? { ...product, supplierId: product.supplierId ?? '', warehouse: 'Main Warehouse' }
    : EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      minStock: Number(form.minStock),
      unitPrice: Number(form.unitPrice),
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      quantity: editing ? null : Number(form.quantity),
      warehouse: form.warehouse.trim() || 'Main Warehouse',
    };
    try {
      if (editing) await productService.update(product.id, payload);
      else await productService.create(payload);
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit product' : 'Add product'} onClose={onClose}>
      <form onSubmit={submit} className="form">
        {error && <div className="alert" role="alert">{error}</div>}
        <div className="row">
          <label>SKU<input required maxLength="40" value={form.sku} onChange={set('sku')} placeholder="e.g. ELC-1003" /></label>
          <label>Category<input required maxLength="80" value={form.category} onChange={set('category')} placeholder="e.g. Electronics" /></label>
        </div>
        <label>Product name<input required maxLength="160" value={form.name} onChange={set('name')} /></label>
        <div className="row">
          <label>Unit price<input type="number" min="0" step="0.01" required value={form.unitPrice} onChange={set('unitPrice')} /></label>
          <label>Minimum stock<input type="number" min="0" required value={form.minStock} onChange={set('minStock')} /></label>
        </div>
        <label>Supplier
          <select value={form.supplierId} onChange={set('supplierId')}>
            <option value="">No supplier assigned</option>
            {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
          </select>
        </label>
        {!editing && <div className="row">
          <label>Opening quantity<input type="number" min="0" value={form.quantity} onChange={set('quantity')} /></label>
          <label>Warehouse<input maxLength="120" value={form.warehouse} onChange={set('warehouse')} /></label>
        </div>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save product'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Products() {
  const { data, loading, error, reload } = useAsync(productService.getAll);
  const { data: suppliers } = useAsync(supplierService.getAll);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const q = query.trim().toLowerCase();
  const categories = [...new Set((data ?? []).map((product) => product.category))].sort();
  const rows = (data ?? []).filter((product) => {
    const matchesText = !q || [product.sku, product.name, product.category, product.supplierName || '']
      .some((value) => value.toLowerCase().includes(q));
    return matchesText && (!category || product.category === category);
  });

  const saved = () => { setModal(null); reload(); };
  const confirmDelete = async () => {
    setDeleting(true);
    setActionError('');
    try {
      await productService.remove(modal.product.id);
      saved();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div><span className="eyebrow">CATALOGUE</span><h1>Products</h1><p className="muted">Manage items, pricing and supplier assignments.</p></div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'form' })}>＋ Add product</button>
      </div>

      <div className="panel flush">
        <div className="toolbar">
          <input className="search" type="search" aria-label="Search products" placeholder="Search SKU, name, category or supplier" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="filter-select" aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <span className="muted">{rows.length} products</span>
        </div>
        <StateView loading={loading} error={error} onRetry={reload} empty={!loading && rows.length === 0}
          emptyTitle={q || category ? 'No matching products' : 'No products yet'}
          emptyText={q || category ? 'Try another search or category.' : 'Add your first product to start tracking stock.'}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Supplier</th><th className="r">Unit price</th><th className="r">Quantity</th><th className="r">Min. stock</th><th>Status</th><th className="r">Actions</th></tr></thead>
              <tbody>
                {rows.map((product) => (
                  <tr key={product.id}>
                    <td><span className="sku">{product.sku}</span></td>
                    <td><strong>{product.name}</strong></td>
                    <td>{product.category}</td>
                    <td>{product.supplierName || <span className="muted">Not assigned</span>}</td>
                    <td className="r">₹{Number(product.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="r">{product.quantity.toLocaleString('en-IN')}</td>
                    <td className="r">{product.minStock}</td>
                    <td><StatusBadge status={stockStatus(product.quantity, product.minStock)} /></td>
                    <td className="r actions">
                      <button className="btn btn-sm" onClick={() => setModal({ type: 'form', product })}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => { setActionError(''); setModal({ type: 'delete', product }); }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StateView>
      </div>

      {modal?.type === 'form' && <ProductForm product={modal.product} suppliers={suppliers ?? []} onSaved={saved} onClose={() => setModal(null)} />}
      {modal?.type === 'delete' && (
        <Modal title="Delete product" onClose={() => setModal(null)}>
          {actionError && <div className="alert" role="alert">{actionError}</div>}
          <p>Delete <strong>{modal.product.name}</strong> and its inventory records? Products on purchase orders are protected from deletion.</p>
          <div className="modal-actions">
            <button className="btn" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-danger-solid" disabled={deleting} onClick={confirmDelete}>{deleting ? 'Deleting…' : 'Delete product'}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
