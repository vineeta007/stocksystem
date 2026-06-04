'use client';

import { useState, useEffect } from 'react';

const BORDER = '#1e1e16';
const TEXT = '#d8d4c8';
const FAINT = '#3a3830';
const MUTED = '#6a6658';
const GOLD = '#c9a84c';

function statusStyle(quantity, minStock) {
  if (quantity === 0) return { bg: '#2e1a1a', color: '#e05050', border: '#4a2020', label: 'OUT OF STOCK' };
  if (quantity <= minStock) return { bg: '#2e1e10', color: '#d97b3a', border: '#4a3010', label: 'LOW STOCK' };
  return { bg: '#1a2e22', color: '#4caf7a', border: '#2a4a32', label: 'IN STOCK' };
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
  const data = await res.json();
  return data.secure_url;
}

const EMPTY_FORM = { name: '', category: '', stock: '', minStock: '', sku: '' };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch('/api/products');
    const json = await res.json();
    if (json.success) setProducts(json.data);
    setLoading(false);
  }

  useEffect(() => { fetchProducts(); }, []);

  async function handleAdd() {
    if (!form.name.trim() || !form.category.trim()) return alert('Name and category are required');
    setSaving(true);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        quantity: Number(form.stock) || 0,
        minStock: Number(form.minStock) || 0,
        sku: form.sku,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (json.success) {
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchProducts();
    } else {
      alert('Failed: ' + json.error);
    }
  }

  async function handlePhotoUpload(productId, file) {
    try {
      const imageUrl = await uploadImage(file);
      await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      fetchProducts();
    } catch (err) {
      alert('Upload failed');
    }
  }

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const qty = p.quantity ?? 0;
    const st = qty === 0 ? 'out' : qty <= p.minStock ? 'low' : 'in';
    const matchStatus = statusFilter === 'All' ? true : statusFilter === 'Low' ? st === 'low' : statusFilter === 'Out' ? st === 'out' : st === 'in';
    return matchCat && matchSearch && matchStatus;
  });

  const total = products.length;
  const low = products.filter(p => (p.quantity ?? 0) > 0 && (p.quantity ?? 0) <= p.minStock).length;
  const out = products.filter(p => (p.quantity ?? 0) === 0).length;

  return (
    <div style={{ minHeight: '100vh', color: TEXT }}>

      {/* Header */}
      <div style={{ padding: '18px 28px 14px', borderBottom: `0.5px solid ${BORDER}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 8, letterSpacing: '0.3em', color: FAINT, textTransform: 'uppercase', marginBottom: 3 }}>Catalogue</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: TEXT }}>Products</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 11, color: MUTED }}>
            <span style={{ color: TEXT, fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{total}</span> total &nbsp;·&nbsp;
            <span style={{ color: '#d97b3a', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{low}</span> low &nbsp;·&nbsp;
            <span style={{ color: '#e05050', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{out}</span> out
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ padding: '7px 14px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', background: GOLD, color: '#0a0a07', border: 'none', borderRadius: 3, cursor: 'pointer', fontWeight: 700 }}>
            + Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '14px 28px', borderBottom: `0.5px solid ${BORDER}`, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          style={{ background: '#111109', border: `0.5px solid ${BORDER}`, borderRadius: 3, padding: '7px 12px', color: TEXT, fontSize: 11, outline: 'none', width: 200 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ padding: '5px 10px', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 3, cursor: 'pointer',
                background: category === cat ? GOLD : 'transparent', color: category === cat ? '#0a0a07' : MUTED,
                border: `0.5px solid ${category === cat ? GOLD : BORDER}`, fontWeight: category === cat ? 600 : 400 }}>
              {cat}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {['All', 'In Stock', 'Low', 'Out'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: '5px 10px', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 3, cursor: 'pointer',
                background: statusFilter === s ? '#1e1d19' : 'transparent', color: statusFilter === s ? TEXT : FAINT,
                border: `0.5px solid ${statusFilter === s ? '#333230' : BORDER}` }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 28px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: MUTED }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${BORDER}` }}>
                {['#', 'Product Name', 'Category', 'Stock', 'Min Stock', 'Status', 'Photo'].map(h => (
                  <th key={h} style={{ padding: '12px 10px', textAlign: 'left', fontSize: 8, letterSpacing: '0.2em', color: FAINT, textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const st = statusStyle(p.quantity ?? 0, p.minStock ?? 0);
                return (
                  <tr key={p._id} style={{ borderBottom: '0.5px solid #16150f', background: i % 2 === 0 ? 'transparent' : '#111109' }}>
                    <td style={{ padding: '11px 10px', color: FAINT, fontFamily: 'Space Mono, monospace', fontSize: 10 }}>{i + 1}</td>
                    <td style={{ padding: '11px 10px', color: TEXT, fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 2, background: '#1a1915', color: MUTED, border: `0.5px solid ${BORDER}`, letterSpacing: '0.05em' }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '11px 10px', fontFamily: 'Space Mono, monospace', fontWeight: 700, color: TEXT }}>{p.quantity ?? 0}</td>
                    <td style={{ padding: '11px 10px', color: FAINT, fontFamily: 'Space Mono, monospace' }}>{p.minStock ?? 0}</td>
                    <td style={{ padding: '11px 10px' }}>
                      <span style={{ fontSize: 8, padding: '3px 7px', borderRadius: 2, background: st.bg, color: st.color, border: `0.5px solid ${st.border}`, fontWeight: 700, letterSpacing: '0.08em' }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '11px 10px' }}>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={e => { const file = e.target.files[0]; if (file) handlePhotoUpload(p._id, file); }} />
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, border: '1px solid #1E3A5F' }} />
                        ) : (
                          <div style={{ width: 52, height: 52, borderRadius: 8, border: '1px dashed #2E4C75', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7EA8D4', fontSize: 10, background: '#13294B', fontWeight: 700 }}>Add</div>
                        )}
                      </label>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: MUTED }}>No products found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#13120e', border: `1px solid ${BORDER}`, borderRadius: 6, width: '100%', maxWidth: 480, padding: 28 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: TEXT, marginBottom: 24 }}>Add Product</div>
            {[
              { label: 'Product Name *', key: 'name', placeholder: 'e.g. Fuse Pec 150' },
              { label: 'Category *', key: 'category', placeholder: 'e.g. Swift' },
              { label: 'Stock', key: 'stock', placeholder: '0', type: 'number' },
              { label: 'Min Stock', key: 'minStock', placeholder: '0', type: 'number' },
              { label: 'SKU', key: 'sku', placeholder: 'optional' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.15em', color: MUTED, textTransform: 'uppercase', marginBottom: 5 }}>{f.label}</div>
                <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', background: '#0d0d0b', border: `0.5px solid ${BORDER}`, borderRadius: 3, padding: '8px 12px', color: TEXT, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleAdd} disabled={saving}
                style={{ flex: 1, padding: '9px 0', background: GOLD, color: '#0a0a07', border: 'none', borderRadius: 3, fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Create Product'}
              </button>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                style={{ padding: '9px 20px', background: 'transparent', color: MUTED, border: `0.5px solid ${BORDER}`, borderRadius: 3, fontSize: 11, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}