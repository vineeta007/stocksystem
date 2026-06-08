'use client';

import { useState, useEffect } from 'react';

function statusStyle(quantity, minStock) {
  if (quantity === 0) return { bg: 'rgba(204,32,32,0.08)', color: '#CC2020', border: 'rgba(204,32,32,0.25)', label: 'OUT OF STOCK' };
  if (quantity <= minStock) return { bg: 'rgba(217,119,6,0.08)', color: '#d97706', border: 'rgba(217,119,6,0.25)', label: 'LOW STOCK' };
  return { bg: 'rgba(22,163,74,0.08)', color: '#16a34a', border: 'rgba(22,163,74,0.25)', label: 'IN STOCK' };
}

const EMPTY_FORM = { name: '', category: '', stock: '', minStock: '', sku: '' };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [openStatusId, setOpenStatusId] = useState(null);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch('/api/products');
    const json = await res.json();
    if (json.success) setProducts(json.data);
    setLoading(false);
  }

  useEffect(() => { fetchProducts(); }, []);

  function openAdd() {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(p) {
    setEditProduct(p);
    setForm({ name: p.name, category: p.category, stock: String(p.quantity ?? 0), minStock: String(p.minStock ?? 0), sku: p.sku || '' });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.category.trim()) return alert('Name and category are required');
    setSaving(true);

    if (editProduct) {
      const res = await fetch(`/api/products/${editProduct._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, category: form.category,
          quantity: Number(form.stock) || 0,
          minStock: Number(form.minStock) || 0,
          sku: form.sku,
        }),
      });
      const json = await res.json();
      setSaving(false);
      if (json.success) { setShowModal(false); fetchProducts(); }
      else alert('Failed: ' + json.error);
    } else {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, category: form.category,
          quantity: Number(form.stock) || 0,
          minStock: Number(form.minStock) || 0,
          sku: form.sku,
        }),
      });
      const json = await res.json();
      setSaving(false);
      if (json.success) { setShowModal(false); setForm(EMPTY_FORM); fetchProducts(); }
      else alert('Failed: ' + json.error);
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
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Sora', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
  padding: '32px 28px 20px', borderBottom: '1px solid #e0e0e0',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  background: '#f5f5f5', position: 'relative',
}}>
        <h1 style={{
          fontSize: 40, fontWeight: 700, color: '#111111', margin: 0,
          letterSpacing: '-0.3px', fontFamily: "'Cormorant Garamond', serif",
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        }}>Products</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginLeft: 'auto' }}>
          <button onClick={openAdd} style={{
            padding: '9px 18px', fontSize: 12, letterSpacing: '0.08em',
            textTransform: 'uppercase', background: '#000000', color: '#ffffff',
            border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700,
            fontFamily: "'Sora', sans-serif", transition: 'background 0.15s',
          }}>
            + Add Product
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{
        padding: '18px 28px 28px', borderBottom: '1px solid #e0e0e0',
        display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
        background: '#ffffff',
      }}>
        {/* Search */}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{
            background: '#3d4a5c', border: 'none', borderRadius: 6,
            padding: '8px 14px', color: '#ffffff', fontSize: 13,
            outline: 'none', width: 220, fontFamily: "'Sora', sans-serif",
          }}
        />

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', background: '#e0e0e0', flexShrink: 0 }} />

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '6px 12px', fontSize: 11, letterSpacing: '0.08em',
              textTransform: 'uppercase', borderRadius: 6, cursor: 'pointer',
              background: category === cat ? '#000000' : '#ffffff',
              color: category === cat ? '#ffffff' : '#555555',
              border: `1px solid ${category === cat ? '#000000' : '#dddddd'}`,
              fontWeight: category === cat ? 600 : 400,
              fontFamily: "'Sora', sans-serif",
            }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Right side: stat boxes + divider + status filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <span style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: 'rgba(17,17,17,0.06)', border: '1px solid #e0e0e0', color: '#111111',
          }}>{total} total</span>
          <span style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.3)', color: '#d97706',
          }}>{low} low</span>
          <span style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: 'rgba(204,32,32,0.08)', border: '1px solid rgba(204,32,32,0.3)', color: '#CC2020',
          }}>{out} out</span>

          {/* Divider */}
          <div style={{ width: '1px', height: '24px', background: '#e0e0e0' }} />

          {/* Status filters */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'In Stock', 'Low', 'Out'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '6px 12px', fontSize: 11, letterSpacing: '0.08em',
                textTransform: 'uppercase', borderRadius: 6, cursor: 'pointer',
                background: statusFilter === s ? '#000000' : '#ffffff',
                color: statusFilter === s ? '#ffffff' : '#555555',
                border: `1px solid ${statusFilter === s ? '#000000' : '#dddddd'}`,
                fontFamily: "'Sora', sans-serif",
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ padding: '16px 28px 40px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'visible', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#888888', fontSize: 14 }}>Loading...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eeeeee', background: '#fafafa' }}>
                  {['#', 'Product Name', 'Category', 'Stock', 'Min Stock', 'Status', ''].map((h, idx) => (
                    <th key={idx} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: 10, letterSpacing: '0.15em',
                      color: '#888888', textTransform: 'uppercase', fontWeight: 600,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const st = statusStyle(p.quantity ?? 0, p.minStock ?? 0);
                  return (
                    <tr key={p._id} style={{
                      borderBottom: '1px solid #f0f0f0',
                      background: i % 2 === 0 ? '#ffffff' : '#fafafa',
                      transition: 'background 0.1s',
                    }}>
                      <td style={{ padding: '13px 16px', color: '#aaaaaa', fontSize: 13 }}>{i + 1}</td>
                      <td style={{ padding: '13px 16px', color: '#111111', fontWeight: 600, fontSize: 14 }}>{p.name}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 20,
                          background: '#f0f0f0', color: '#555555', border: '1px solid #e0e0e0',
                          fontWeight: 500,
                        }}>{p.category}</span>
                      </td>
                      <td style={{ padding: '13px 16px', fontWeight: 700, color: '#111111', fontSize: 14 }}>{p.quantity ?? 0}</td>
                      <td style={{ padding: '13px 16px', color: '#888888', fontSize: 13 }}>{p.minStock ?? 0}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <span
                            onClick={() => setOpenStatusId(openStatusId === p._id ? null : p._id)}
                            style={{
                              fontSize: 10, padding: '4px 10px', borderRadius: 6,
                              background: st.bg, color: st.color,
                              border: `1px solid ${st.border}`,
                              fontWeight: 700, letterSpacing: '0.06em',
                              cursor: 'pointer', userSelect: 'none',
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}>
                            {st.label} ▾
                          </span>
                          {openStatusId === p._id && (
                            <div style={{
                              position: 'absolute', top: '110%', left: 0, zIndex: 100,
                              background: '#ffffff', border: '1px solid #e0e0e0',
                              borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                              minWidth: 160, overflow: 'hidden',
                            }}>
                              {[
                                { label: 'IN STOCK', value: (p.minStock ?? 0) + 1 },
                                { label: 'LOW STOCK', value: Math.max((p.minStock ?? 1), 1) },
                                { label: 'OUT OF STOCK', value: 0 },
                              ].map(opt => (
                                <div
                                  key={opt.label}
                                  onClick={async () => {
                                    setOpenStatusId(null);
                                    await fetch(`/api/products/${p._id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ quantity: opt.value }),
                                    });
                                    fetchProducts();
                                  }}
                                  style={{
                                    padding: '10px 14px', fontSize: 12, cursor: 'pointer',
                                    color: '#111111', fontWeight: 500,
                                    borderBottom: '1px solid #f0f0f0',
                                    transition: 'background 0.1s',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  {opt.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <button onClick={() => openEdit(p)} style={{
                          padding: '5px 14px', fontSize: 11, letterSpacing: '0.08em',
                          textTransform: 'uppercase', background: 'transparent',
                          color: '#CC2020', border: '1px solid rgba(204,32,32,0.3)',
                          borderRadius: 6, cursor: 'pointer', fontWeight: 600,
                          fontFamily: "'Sora', sans-serif",
                        }}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#888888', fontSize: 14 }}>No products found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: '#ffffff', border: '1px solid #e0e0e0',
            borderRadius: 12, width: '100%', maxWidth: 480, padding: 32,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111111', marginBottom: 24, margin: '0 0 24px' }}>
              {editProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            {[
              { label: 'Product Name *', key: 'name', placeholder: 'e.g. Fuse Pec 150' },
              { label: 'Category *', key: 'category', placeholder: 'e.g. Swift' },
              { label: 'Stock', key: 'stock', placeholder: '0', type: 'number' },
              { label: 'Min Stock', key: 'minStock', placeholder: '0', type: 'number' },
              { label: 'SKU', key: 'sku', placeholder: 'optional' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.15em', color: '#888888', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>{f.label}</div>
                <input
                  type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{
                    width: '100%', background: '#3d4a5c', border: 'none',
                    borderRadius: 6, padding: '10px 14px', color: '#ffffff',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    fontFamily: "'Sora', sans-serif",
                  }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: '11px 0', background: '#000000', color: '#ffffff',
                border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                fontFamily: "'Sora', sans-serif", transition: 'background 0.15s',
              }}>
                {saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Create Product'}
              </button>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setEditProduct(null); }} style={{
                padding: '11px 20px', background: 'transparent', color: '#555555',
                border: '1px solid #dddddd', borderRadius: 6, fontSize: 13,
                cursor: 'pointer', fontFamily: "'Sora', sans-serif",
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}