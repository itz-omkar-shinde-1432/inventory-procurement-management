import { useAsync } from '../hooks/useAsync.js';
import { inventoryService } from '../services/inventoryService.js';
import { useCallback } from 'react';
import StateView from '../components/StateView.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDateTime } from '../utils/format.js';

export default function Dashboard() {
  const loadDashboard = useCallback(async () => {
    const [summary, inventory] = await Promise.all([inventoryService.getDashboard(), inventoryService.getAll()]);
    return { ...summary, inventoryOverview: inventory };
  }, []);
  const { data, loading, error, reload } = useAsync(loadDashboard);

  return (
    <>
      <div className="page-head"><div><span className="eyebrow">OVERVIEW</span><h1>Good to see you</h1><p className="muted">Here’s what’s happening across your inventory and procurement.</p></div></div>
      <StateView loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <div className="stats">
              <div className="stat"><span>Total products</span><strong>{data.totalProducts.toLocaleString('en-IN')}</strong><small>Across all categories</small></div>
              <div className="stat"><span>Total stock units</span><strong>{data.totalStock.toLocaleString('en-IN')}</strong><small>Available across locations</small></div>
              <div className="stat warn"><span>Low stock items</span><strong>{data.lowStockCount.toLocaleString('en-IN')}</strong><small>At or below minimum level</small></div>
              <div className="stat"><span>Total suppliers</span><strong>{data.totalSuppliers.toLocaleString('en-IN')}</strong><small>Active supplier records</small></div>
              <div className="stat"><span>Purchase orders</span><strong>{data.totalPurchaseOrders.toLocaleString('en-IN')}</strong><small>{data.pendingPurchaseOrders} awaiting completion</small></div>
            </div>

            <div className="dashboard-grid">
              <section className="panel">
                <div className="section-heading"><div><h2>Recent activity</h2><p className="muted">Latest inventory movements</p></div></div>
                {data.recentActivity.length === 0 ? <p className="muted">No stock movements yet.</p> : (
                  <ul className="list">
                    {data.recentActivity.map((a) => (
                      <li key={a.id}>
                        <span className={`dot ${a.type === 'IN' ? 'in' : 'out'}`}>{a.type === 'IN' ? '+' : '−'}</span>
                        <div className="grow"><strong>{a.productName}</strong><small>{a.note || a.warehouse} · {formatDateTime(a.at)}</small></div>
                        <span className="num">{a.type === 'IN' ? '+' : '−'}{a.quantity}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="panel">
                <div className="section-heading"><div><h2>Low stock alerts</h2><p className="muted">Items to review or reorder</p></div></div>
                {data.lowStock.length === 0 ? <p className="muted">Everything is above its minimum level.</p> : (
                  <ul className="list">
                    {data.lowStock.map((r) => (
                      <li key={r.id}>
                        <div className="grow"><strong>{r.productName}</strong><small>{r.warehouse} · {r.available} available, minimum {r.minStock}</small></div>
                        <StatusBadge status={r.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="panel inventory-overview">
                <div className="section-heading"><div><h2>Inventory overview</h2><p className="muted">Stock by warehouse</p></div></div>
                {data.inventoryOverview.length === 0 ? <p className="muted">Inventory records will appear here after you add products.</p> : (
                  <div className="inventory-bars">
                    {data.inventoryOverview.slice(0, 6).map((r) => {
                      const max = Math.max(...data.inventoryOverview.map((entry) => entry.available), 1);
                      const width = Math.min(100, (r.available / max) * 100);
                      return <div className="inventory-bar-row" key={r.id}>
                        <div className="inventory-bar-label"><strong>{r.productName}</strong><span>{r.warehouse}</span><b>{r.available.toLocaleString('en-IN')}</b></div>
                        <div className="bar-track"><span style={{ width: `${width}%` }} /></div>
                      </div>;
                    })}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </StateView>
    </>
  );
}
