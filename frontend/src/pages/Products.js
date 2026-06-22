import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api';

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Automotive', 'Sports', 'Books', 'Other'];

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || {
    name: '', sku: '', description: '', price: '', quantity: '', category: ''
  });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.sku || !form.price) {
      return toast.error('Name, SKU, and price are required');
    }
    setSaving(true);
    try {
      const data = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity || 0) };
      if (product?.id) {
        const { sku, ...updateData } = data;
        await updateProduct(product.id, updateData);
        toast.success('Product updated');
      } else {
        await createProduct(data);
        toast.success('Product created');
      }
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
          <h2 className="modal-title">{product?.id ? 'Edit Product' : 'Add Product'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className="form-control" name="name" value={form.name} onChange={handle} placeholder="MacBook Pro 16&quot;" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">SKU / Code *</label>
              <input className="form-control" name="sku" value={form.sku} onChange={handle} placeholder="MBP-16-M3" disabled={!!product?.id} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" name="category" value={form.category} onChange={handle}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input className="form-control" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handle} placeholder="2499.99" />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity in Stock</label>
              <input className="form-control" name="quantity" type="number" min="0" value={form.quantity} onChange={handle} placeholder="50" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handle} rows={3} placeholder="Product description..." style={{ resize: 'vertical' }} />
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={saving}>
              {saving ? '...' : (product?.id ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | product obj

  const load = () => {
    setLoading(true);
    getProducts().then(r => setProducts(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <p className="page-subtitle">Manage your product catalog and inventory levels</p>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="search-bar">
                <span>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." />
              </div>
              <span className="badge badge-blue">{products.length} products</span>
            </div>
            <button className="btn btn-primary" onClick={() => setModal('add')}>
              + Add Product
            </button>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-title">{search ? 'No results found' : 'No products yet'}</div>
              <div className="empty-text">
                {search ? 'Try a different search term' : 'Add your first product to get started'}
              </div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="td-primary">{p.name}</div>
                        {p.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.description.slice(0, 50)}{p.description.length > 50 ? '...' : ''}</div>}
                      </td>
                      <td><span className="sku-text">{p.sku}</span></td>
                      <td>
                        {p.category ? <span className="badge badge-purple">{p.category}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td className="revenue-value">${parseFloat(p.price).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${p.quantity === 0 ? 'badge-rose' : p.quantity <= 10 ? 'badge-amber' : 'badge-emerald'}`}>
                          {p.quantity}
                        </span>
                      </td>
                      <td>
                        <div className="action-row">
                          <button className="btn btn-secondary btn-sm" onClick={() => setModal(p)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(p.id, p.name)}>Delete</button>
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

      {(modal === 'add' || (modal && typeof modal === 'object')) && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </>
  );
}
