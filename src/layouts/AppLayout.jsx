import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: '▦' },
  { to: '/products', label: 'Products', icon: '◇' },
  { to: '/inventory', label: 'Inventory', icon: '▤' },
  { to: '/suppliers', label: 'Suppliers', icon: '♧' },
  { to: '/purchase-orders', label: 'Purchase orders', icon: '⇄' },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="brand-mark">M</span>
          <div><strong>Maestro Intellect</strong><small>INVENTORY & PROCUREMENT</small></div>
        </div>
        <small className="nav-caption">WORKSPACE</small>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="nav-icon" aria-hidden="true">{n.icon}</span>{n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
          <div className="topbar-context"><span className="topbar-title">Maestro Intellect Pvt. Ltd.</span><span className="topbar-divider">/</span><span className="topbar-subtitle">Operations workspace</span></div>
          <div className="topbar-user">
            <div className="avatar">MI</div>
            <span className="hide-sm">Operations team</span>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
