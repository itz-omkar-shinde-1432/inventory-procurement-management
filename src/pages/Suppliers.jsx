import { useState } from 'react';
import { useAsync } from '../hooks/useAsync.js';
import { supplierService } from '../services/supplierService.js';
import StateView from '../components/StateView.jsx';
import Modal from '../components/Modal.jsx';

const EMPTY = { name: '', contactPerson: '', phone: '', email: '', address: '' };

function SupplierForm({ supplier, onSaved, onClose }) {
  const [form, setForm] = useState(supplier ?? EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      contactPerson: form.contactPerson?.trim() || null,
      phone: form.phone?.trim() || null,
      email: form.email?.trim() || null,
      address: form.address?.trim() || null,
    };
    try {
      if (supplier) await supplierService.update(supplier.id, payload);
      else await supplierService.create(payload);
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={supplier ? 'Edit supplier' : 'Add supplier'} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        {error && <div className="alert" role="alert">{error}</div>}
        <label>Company name<input required maxLength="120" value={form.name} onChange={set('name')} /></label>
        <label>Contact person<input maxLength="120" value={form.contactPerson ?? ''} onChange={set('contactPerson')} /></label>
        <div className="row">
          <label>Phone<input type="tel" maxLength="30" value={form.phone ?? ''} onChange={set('phone')} /></label>
          <label>Email<input type="email" maxLength="160" value={form.email ?? ''} onChange={set('email')} /></label>
        </div>
        <label>Address<textarea rows="3" maxLength="500" value={form.address ?? ''} onChange={set('address')} /></label>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save supplier'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Suppliers() {
  const { data, loading, error, reload } = useAsync(supplierService.getAll);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [query, setQuery] = useState('');
  const suppliers = (data ?? []).filter((supplier) =>
    [supplier.name, supplier.contactPerson ?? '', supplier.email ?? '', supplier.phone ?? '']
      .some((value) => value.toLowerCase().includes(query.trim().toLowerCase())));

  const saved = () => { setModal(null); reload(); };
  const confirmDelete = async () => {
    setDeleting(true);
    setActionError('');
    try {
      await supplierService.remove(modal.supplier.id);
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
        <div><span className="eyebrow">PARTNERS</span><h1>Suppliers</h1><p className="muted">Maintain supplier contacts and relationships.</p></div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'form' })}>＋ Add supplier</button>
      </div>
      <div className="panel flush">
        <div className="toolbar">
          <input className="search" type="search" aria-label="Search suppliers" placeholder="Search supplier or contact" value={query} onChange={(event) => setQuery(event.target.value)} />
          <span className="muted">{suppliers.length} suppliers</span>
        </div>
        <StateView loading={loading} error={error} onRetry={reload} empty={!loading && suppliers.length === 0}
          emptyTitle={query ? 'No matching suppliers' : 'No suppliers yet'}
          emptyText={query ? 'Try another search.' : 'Add a supplier before creating a purchase order.'}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Supplier</th><th>Contact person</th><th>Phone</th><th>Email</th><th>Address</th><th className="r">Actions</th></tr></thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td><strong>{supplier.name}</strong></td>
                    <td>{supplier.contactPerson || '—'}</td>
                    <td>{supplier.phone || '—'}</td>
                    <td>{supplier.email || '—'}</td>
                    <td className="address-cell">{supplier.address || '—'}</td>
                    <td className="r actions">
                      <button className="btn btn-sm" onClick={() => setModal({ type: 'form', supplier })}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => { setActionError(''); setModal({ type: 'delete', supplier }); }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StateView>
      </div>
      {modal?.type === 'form' && <SupplierForm supplier={modal.supplier} onSaved={saved} onClose={() => setModal(null)} />}
      {modal?.type === 'delete' && (
        <Modal title="Delete supplier" onClose={() => setModal(null)}>
          {actionError && <div className="alert" role="alert">{actionError}</div>}
          <p>Delete <strong>{modal.supplier.name}</strong>? A supplier linked to products or purchase orders cannot be deleted.</p>
          <div className="modal-actions">
            <button className="btn" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-danger-solid" disabled={deleting} onClick={confirmDelete}>{deleting ? 'Deleting…' : 'Delete supplier'}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
