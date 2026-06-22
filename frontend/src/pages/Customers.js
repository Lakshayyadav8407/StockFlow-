import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getCustomers, createCustomer, deleteCustomer } from '../utils/api';

function CustomerModal({ onClose, onSave }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.full_name || !form.email) return toast.error('Name and email are required');
    setSaving(true);
    try {
      await createCustomer(form);
      toast.success('Customer added');
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
          <h2 className="modal-title">Add Customer</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-control" name="full_name" value={form.full_name} onChange={handle} placeholder="Jane Smith" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className="form-control" name="email" type="email" value={form.email} onChange={handle} placeholder="jane@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-control" name="phone" value={form.phone} onChange={handle} placeholder="+1 (555) 000-0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-control" name="address" value={form.address} onChange={handle} rows={2} placeholder="123 Main St, City, State" style={{ resize: 'vertical' }} />
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={saving}>
              {saving ? '...' : 'Add Customer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const avatarColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    getCustomers().then(r => setCustomers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"? This cannot be undone.`)) return;
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <p className="page-subtitle">Manage your customer base and contact information</p>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="search-bar">
                <span>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." />
              </div>
              <span className="badge badge-purple">{customers.length} customers</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Add Customer
            </button>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-title">{search ? 'No results found' : 'No customers yet'}</div>
              <div className="empty-text">
                {search ? 'Try a different search term' : 'Add your first customer to get started'}
              </div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36,
                            borderRadius: '50%',
                            background: avatarColors[i % avatarColors.length],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0
                          }}>
                            {getInitials(c.full_name)}
                          </div>
                          <span className="td-primary">{c.full_name}</span>
                        </div>
                      </td>
                      <td>{c.email}</td>
                      <td>{c.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(c.id, c.full_name)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CustomerModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load(); }}
        />
      )}
    </>
  );
}
