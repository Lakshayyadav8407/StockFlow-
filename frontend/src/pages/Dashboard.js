import React, { useState, useEffect } from 'react';
import { getDashboard } from '../utils/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { name: 'Jan', orders: 12, revenue: 4200 },
  { name: 'Feb', orders: 19, revenue: 6800 },
  { name: 'Mar', orders: 15, revenue: 5100 },
  { name: 'Apr', orders: 27, revenue: 9400 },
  { name: 'May', orders: 23, revenue: 8200 },
  { name: 'Jun', orders: 31, revenue: 11500 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 13
      }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.dataKey === 'revenue' ? `$${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setStats(res.data))
      .catch(() => setStats({
        total_products: 0, total_customers: 0, total_orders: 0,
        low_stock_products: [], total_revenue: 0, pending_orders: 0
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading"><div className="spinner" /></div>
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back — here's what's happening with your inventory</p>
      </div>

      <div className="page-content">
        {/* Stat cards */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-icon blue">📦</div>
            <div className="stat-value">{stats.total_products}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple">👥</div>
            <div className="stat-value">{stats.total_customers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
          <div className="stat-card emerald">
            <div className="stat-icon emerald">🛒</div>
            <div className="stat-value">{stats.total_orders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-icon amber">💰</div>
            <div className="stat-value">${stats.total_revenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Revenue chart */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Revenue Overview</div>
              <span className="badge badge-emerald">↑ 12% this month</span>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low stock */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Low Stock Alert</div>
              <span className="badge badge-amber">⚠ {stats.low_stock_products.length} items</span>
            </div>
            {stats.low_stock_products.length === 0 ? (
              <div className="card-body">
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <div className="empty-title">All stocked up!</div>
                  <div className="empty-text">No products below low stock threshold</div>
                </div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.low_stock_products.map(p => (
                      <tr key={p.id} className="low-stock-row">
                        <td className="td-primary">{p.name}</td>
                        <td><span className="sku-text">{p.sku}</span></td>
                        <td>
                          <span className={`badge ${p.quantity === 0 ? 'badge-rose' : 'badge-amber'}`}>
                            {p.quantity} left
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Order Activity</div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#colorOrders)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System status */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">System Status</div>
              <span className="badge badge-emerald">All Systems Operational</span>
            </div>
            <div className="card-body">
              {[
                { label: 'API Server', status: 'Online', color: 'emerald' },
                { label: 'Database', status: 'Connected', color: 'emerald' },
                { label: 'Pending Orders', status: `${stats.pending_orders} pending`, color: stats.pending_orders > 0 ? 'amber' : 'emerald' },
                { label: 'Inventory Sync', status: 'Real-time', color: 'blue' },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span className={`badge badge-${item.color}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
