import { useState } from 'react';
import { useAsync } from '../hooks/useAsync.js';
import { purchaseOrderService } from '../services/purchaseOrderService.js';
import { productService } from '../services/productService.js';
import { supplierService } from '../services/supplierService.js';
import StateView from '../components/StateView.jsx';
import Modal from '../components/Modal.jsx';

const newItem = () => ({ productId: '', quantity: 1, unitPrice: '' });

function PurchaseOrderForm({ order, suppliers, products, onSaved, onClose }) {
  const [form, setForm] = useState(order ? {
    supplierId: order.supplierId,
    status: order.status,
    expectedDate: order.expectedDate ?? '',
    warehouse: order.warehouse,
    notes: order.notes ?? '',
    items: order.items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice })),
  } : {
    supplierId: '',
    status: 'DRAFT',
    expectedDate: '',
    warehouse: 'Main Warehouse',
    notes: '',
    items: [newItem()],
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const changeItem = (index, key, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (key === 'productId') {
          const product = products.find((entry) => entry.id === Number(value));
          return { ...item, productId: value, unitPrice: product?.unitPrice ?? item.unitPrice };
        }
        return { ...item, [key]: value };
      }),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      supplierId: Number(form.supplierId),
      expectedDate: form.expectedDate || null,
      items: form.items.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    };
    try {
      if (order) await purchaseOrderService.update(order.id, payload);
      else await purchaseOrderService.create(payload);
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={order ? `Edit ${order.orderNumber}` : 'Create purchase order'} onClose={onClose}>
      {!suppliers.length || !products.length ? (
        <div className="alert" role="alert">Add at least one supplier and one product before creating a purchase order.</div>
      ) : (
        <form className="form" onSubmit={submit}>
          {error && <div className="alert" role="alert">{error}</div>}
          <div className="row">
            <label>Supplier<select required value={form.supplierId} onChange={(event) => update('supplierId', event.target.value)}>
              <option value="">Select a supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </select></label>
            <label>Status<select value={form.status} onChange={(event) => update('status', event.target.value)}>
              <option value="DRAFT">Draft</option><option value="ORDERED">Ordered</option><option value="CANCELLED">Cancelled</option>
            </select></label>
          </div>
          <div className="row">
            <label>Expected date<input type="date" value={form.expectedDate} onChange={(event) => update('expectedDate', event.target.value)} /></label>
            <label>Delivery warehouse<input required maxLength="120" value={form.warehouse} onChange={(event) => update('warehouse', event.target.value)} /></label>
          </div>
          <div className="line-items">
            <div className="section-heading"><h3>Order items</h3><button type="button" className="btn btn-sm" onClick={() => update('items', [...form.items, newItem()])}>＋ Add item</button></div>
            {form.items.map((item, index) => (
              <div className="order-item" key={index}>
                <label>Product<select required value={item.productId} onChange={(event) => changeItem(index, 'productId', event.target.value)}>
                  <option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.sku} · {product.name}</option>)}
                </select></label>
                <label>Quantity<input required type="number" min="1" value={item.quantity} onChange={(event) => changeItem(index, 'quantity', event.target.value)} /></label>
                <label>Unit price<input required type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => changeItem(index, 'unitPrice', event.target.value)} /></label>
                <button type="button" className="icon-btn remove-item" aria-label="Remove item" disabled={form.items.length === 1} onClick={() => update('items', form.items.filter((_, itemIndex) => itemIndex !== index))}>×</button>
              </div>
            ))}
          </div>
          <label>Notes<textarea rows="2" maxLength="500" value={form.notes} onChange={(event) => update('notes', event.target.value)} /></label>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save order'}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function OrderStatus({ status }) {
  return <span className={`order-status ${status.toLowerCase()}`}>{status}</span>;
}

export default function PurchaseOrders() {
  const { data, loading, error, reload } = useAsync(purchaseOrderService.getAll);
  const { data: suppliers } = useAsync(supplierService.getAll);
  const { data: products } = useAsync(productService.getAll);
  const [modal, setModal] = useState(null);
  const [action, setAction] = useState(null);
  const [actionError, setActionError] = useState('');
  const [query, setQuery] = useState('');
  const orders = (data ?? []).filter((order) => [order.orderNumber, order.supplierName, order.status]
    .some((value) => value.toLowerCase().includes(query.trim().toLowerCase())));

  const saved = () => { setModal(null); reload(); };
  const runAction = async (order, type) => {
    setAction({ id: order.id, type });
    setActionError('');
    try {
      if (type === 'receive') await purchaseOrderService.receive(order.id);
      else await purchaseOrderService.remove(order.id);
      if (modal) setModal(null);
      await reload();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setAction(null);
    }
  };

  return (
    <>
      <div className="page-head">
        <div><span className="eyebrow">PROCUREMENT</span><h1>Purchase orders</h1><p className="muted">Create orders, track delivery and receive stock into inventory.</p></div>
        <button className="btn btn-primary" onClick={() => { setActionError(''); setModal({ type: 'form' }); }}>＋ New purchase order</button>
      </div>
      {actionError && !modal && <div className="alert action-alert" role="alert">{actionError}</div>}
      <div className="panel flush">
        <div className="toolbar">
          <input className="search" type="search" aria-label="Search purchase orders" placeholder="Search order, supplier or status" value={query} onChange={(event) => setQuery(event.target.value)} />
          <span className="muted">{orders.length} orders</span>
        </div>
        <StateView loading={loading} error={error} onRetry={reload} empty={!loading && orders.length === 0}
          emptyTitle={query ? 'No matching purchase orders' : 'No purchase orders yet'}
          emptyText={query ? 'Try another search.' : 'Create an order to begin tracking procurement.'}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Order</th><th>Supplier</th><th>Items</th><th>Expected</th><th>Warehouse</th><th className="r">Total</th><th>Status</th><th className="r">Actions</th></tr></thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.orderNumber}</strong><small className="sub">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}</small></td>
                    <td>{order.supplierName}</td>
                    <td>{order.items.length} line{order.items.length === 1 ? '' : 's'}</td>
                    <td>{order.expectedDate || '—'}</td>
                    <td>{order.warehouse}</td>
                    <td className="r">₹{Number(order.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td><OrderStatus status={order.status} /></td>
                    <td className="r actions">
                      {(order.status === 'DRAFT' || order.status === 'ORDERED') && <button className="btn btn-sm" onClick={() => { setActionError(''); setModal({ type: 'form', order }); }}>Edit</button>}
                      {order.status === 'ORDERED' && <button className="btn btn-sm btn-primary" disabled={action?.id === order.id} onClick={() => runAction(order, 'receive')}>{action?.id === order.id ? 'Receiving…' : 'Receive'}</button>}
                      {order.status !== 'RECEIVED' && <button className="btn btn-sm btn-danger" disabled={action?.id === order.id} onClick={() => runAction(order, 'delete')}>Delete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StateView>
      </div>
      {modal?.type === 'form' && <PurchaseOrderForm order={modal.order} suppliers={suppliers ?? []} products={products ?? []} onSaved={saved} onClose={() => setModal(null)} />}
    </>
  );
}
