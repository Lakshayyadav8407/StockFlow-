import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from '../utils/api';

function OrderModal({ onClose, onSave }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCustomers().then(r => setCustomers(r.data));
    getProducts().then(r => setProducts(r.data));
  }, []);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: val };
    setItems(updated);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => {
      const p = products.find(p => p.id === parseInt(item.product_id));
      return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0);
    }, 0);
  };

  const submit = async () => {
    if (!customerId) return toast.error('Please select a customer');
    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (validItems.length === 0) return toast.error('Add at least one product');
    setSaving(true);
    try {
      await createOrder({
        customer_id: parseInt(customerId),
        items: validItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
        notes
      });
      toast.success('Order created successfully!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Create Order</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select className="form-control" value={customerId} onChange={e => setCustomerId(e.target.value)}>
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Order Items *</label>
            <div className="order-items-list">
              {items.map((item, i) => (
                <div className="order-item-row" key={i}>
                  <select
                    className="form-control"
                    value={item.product_id}
                    onChange={e => updateItem(i, 'product_id', e.target.value)}
                  >
                    <option value="">Select product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ${p.price} (stock: {p.quantity})
                      </option>
                    ))}
                  </select>
                  <input
                    className="form-control"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)}
                    placeholder="Qty"
                  />
                  {items.length > 1 && (
                    <button className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Estimated Total</span>
            <span className="revenue-value" style={{ fontSize: 18 }}>${getTotal().toFixed(2)}</span>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-control" value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Order notes..." style={{ resize: 'vertical' }} />
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={saving}>
              {saving ? '...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Order #{order.id}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</div>
              <div style={{ fontWeight: 600 }}>{order.customer?.full_name || '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.customer?.email}</div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
              <div className="revenue-value" style={{ fontSize: 22 }}>${order.total_amount.toFixed(2)}</div>
              <span className={`badge badge-${order.status === 'pending' ? 'amber' : 'emerald'}`} style={{ marginTop: 4 }}>{order.status}</span>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Order Items</div>
            {order.items?.map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.product?.name || `Product #${item.product_id}`}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>${item.unit_price} × {item.quantity}</div>
                </div>
                <div className="revenue-value">${(item.unit_price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {order.notes && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong>Notes:</strong> {order.notes}
            </div>
          )}

          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
            Placed: {new Date(order.created_at).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = () => {
    setLoading(true);
    getOrders().then(r => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm(`Cancel order #${id}? Stock will be restored.`)) return;
    try {
      await deleteOrder(id);
      toast.success('Order cancelled and stock restored');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cancel failed');
    }
  };

  const filtered = orders.filter(o =>
    String(o.id).includes(search) ||
    (o.customer?.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <p className="page-subtitle">Track and manage all customer orders</p>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="search-bar">
                <span>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." />
              </div>
              <span className="badge badge-emerald">{orders.length} orders</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              + New Order
            </button>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <div className="empty-title">{search ? 'No results' : 'No orders yet'}</div>
              <div className="empty-text">Create your first order above</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <tr key={o.id}>
                      <td><span className="sku-text">#{String(o.id).padStart(4, '0')}</span></td>
                      <td className="td-primary">{o.customer?.full_name || `Customer #${o.customer_id}`}</td>
                      <td><span className="badge badge-blue">{o.items?.length || 0} items</span></td>
                      <td className="revenue-value">${o.total_amount.toFixed(2)}</td>
                      <td>
                        <span className={`badge badge-${o.status === 'pending' ? 'amber' : o.status === 'cancelled' ? 'rose' : 'emerald'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-row">
                          <button className="btn btn-secondary btn-sm" onClick={() => setDetail(o)}>View</button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(o.id)}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCreate && <OrderModal onClose={() => setShowCreate(false)} onSave={() => { setShowCreate(false); load(); }} />}
      {detail && <OrderDetailModal order={detail} onClose={() => setDetail(null)} />}
    </>
  );
}
