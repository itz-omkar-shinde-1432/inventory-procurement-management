import { useState } from 'react';
import { useAsync } from '../hooks/useAsync.js';
import { inventoryService } from '../services/inventoryService.js';
import StateView from '../components/StateView.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';

function StockForm({ row, type, onDone, onClose }) {
  const [qty, setQty] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isIn = type === 'IN';

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await inventoryService.adjustStock(row.id, type, qty);
      onDone();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={isIn ? 'Stock in' : 'Stock out'} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <p className="muted"><strong>{row.productName}</strong> at {row.warehouse}. Currently {row.available} available.</p>
        {error && <div className="alert" role="alert">{error}</div>}
        <label>Quantity<input type="number" min="1" autoFocus required value={qty} onChange={(e) => setQty(e.target.value)} /></label>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : isIn ? 'Add stock' : 'Remove stock'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Inventory() {
  const { data, loading, error, reload } = useAsync(inventoryService.getAll);
  const [modal, setModal] = useState(null); // { row, type }
  const done = () => { setModal(null); reload(); };

  return (
    <>
      <div className="page-head"><div><h1>Inventory</h1><p className="muted">Stock levels by warehouse.</p></div></div>
      <div className="panel flush">
        <StateView loading={loading} error={error} onRetry={reload} empty={!loading && data?.length === 0}
          emptyTitle="No inventory records" emptyText="Add a product first and its stock will appear here.">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Product</th><th>Warehouse</th><th className="r">Available</th><th className="r">Reserved</th><th className="r">Min stock</th><th>Status</th><th className="r">Actions</th></tr></thead>
              <tbody>
                {data?.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.productName}</strong><small className="sub">{r.sku}</small></td>
                    <td>{r.warehouse}</td><td className="r">{r.available}</td><td className="r">{r.reserved}</td><td className="r">{r.minStock}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="r actions">
                      <button className="btn btn-sm" onClick={() => setModal({ row: r, type: 'IN' })}>Stock in</button>
                      <button className="btn btn-sm" disabled={r.available === 0} onClick={() => setModal({ row: r, type: 'OUT' })}>Stock out</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StateView>
      </div>
      {modal && <StockForm row={modal.row} type={modal.type} onDone={done} onClose={() => setModal(null)} />}
    </>
  );
}
