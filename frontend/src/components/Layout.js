import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '⬡', exact: true },
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/orders', label: 'Orders', icon: '🛒' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitles = {
    '/': 'Dashboard',
    '/products': 'Products',
    '/customers': 'Customers',
    '/orders': 'Orders',
  };

  return (
    <div className="app-wrapper">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon pulse">⚡</div>
          <div>
            <div className="logo-text">StockFlow</div>
            <div className="logo-sub">Inventory Management</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8,
              background: '#10b981',
              borderRadius: '50%',
              boxShadow: '0 0 8px #10b981'
            }} />
            <span>System Online</span>
          </div>
          <div style={{ marginTop: 4, color: '#475569', fontSize: 11 }}>v1.0.0 Production</div>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              StockFlow / <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pageTitles[location.pathname]}</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>🏢</span>
              <span>Nexus Corp</span>
            </div>
          </div>
        </div>
        <div className="page-fade-in">{children}</div>
      </main>
    </div>
  );
}
