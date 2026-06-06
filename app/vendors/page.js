'use client';
import { useState, useEffect } from 'react';

const EMPTY = { name: '', phone: '', city: '', speciality: '' };

export default function VendorListPage() {
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('vendors');
    if (saved) setVendors(JSON.parse(saved));
  }, []);

  function save(updated) {
    setVendors(updated);
    localStorage.setItem('vendors', JSON.stringify(updated));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (editId !== null) {
      save(vendors.map((v, i) => i === editId ? form : v));
    } else {
      save([...vendors, form]);
    }
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY);
  }

  function handleEdit(i) {
    setEditId(i);
    setForm(vendors[i]);
    setShowForm(true);
  }

  function handleDelete(i) {
    if (!confirm('Delete this vendor?')) return;
    save(vendors.filter((_, idx) => idx !== i));
  }

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.city.toLowerCase().includes(search.toLowerCase()) ||
    v.speciality.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', background: '#f5f5f5', minHeight: '100vh', fontFamily: "'Sora', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#888', letterSpacing: '1.2px', textTransform: 'uppercase', margin: '0 0 6px' }}>CATALOGUE</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111', margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>Vendor List</h1>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }} style={{
            background: '#000', color: '#fff', padding: '9px 18px',
            borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, fontFamily: "'Sora', sans-serif",
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.target.style.background = '#CC2020'}
            onMouseLeave={e => e.target.style.background = '#000'}
          >+ Add Vendor</button>
        </div>
        <p style={{ color: '#888', fontSize: '13px', margin: '6px 0 0' }}>{vendors.length} vendors registered</p>
      </div>

      {/* Search */}
      <input
        placeholder="Search by name, city or speciality..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', maxWidth: '360px', padding: '9px 14px',
          background: '#fff', border: '1px solid #e0e0e0',
          borderRadius: '8px', color: '#111', fontSize: '14px',
          margin: '20px 0 16px', boxSizing: 'border-box', outline: 'none',
          fontFamily: "'Sora', sans-serif",
          WebkitTextFillColor: '#111',
        }}
      />

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e0e0e0', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f9f9f9' }}>
              {['#', 'Name', 'Phone Number', 'City', 'Speciality', 'Actions'].map(h => (
                <th key={h} style={{
                  color: '#888', padding: '12px 16px',
                  textAlign: 'left', fontWeight: 600, fontSize: '11px',
                  textTransform: 'uppercase', letterSpacing: '1.2px',
                  borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap',
                  fontFamily: "'Sora', sans-serif",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
                  No vendors yet. Click "+ Add Vendor" to get started.
                </td>
              </tr>
            ) : filtered.map((v, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '13px 16px', color: '#888' }}>{i + 1}</td>
                <td style={{ padding: '13px 16px', fontWeight: 600, color: '#111' }}>{v.name}</td>
                <td style={{ padding: '13px 16px', color: '#555' }}>{v.phone}</td>
                <td style={{ padding: '13px 16px', color: '#555' }}>{v.city}</td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{
                    background: 'rgba(29,158,117,0.12)', color: '#1D9E75',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                  }}>{v.speciality}</span>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleEdit(i)} style={{
                      padding: '4px 12px', borderRadius: '6px', fontSize: '12px',
                      fontWeight: 600, cursor: 'pointer',
                      border: '1px solid #e0e0e0', background: 'transparent', color: '#555',
                      fontFamily: "'Sora', sans-serif",
                    }}>Edit</button>
                    <button onClick={() => handleDelete(i)} style={{
                      padding: '4px 12px', borderRadius: '6px', fontSize: '12px',
                      fontWeight: 600, cursor: 'pointer',
                      border: '1px solid rgba(204,32,32,0.3)',
                      background: 'rgba(204,32,32,0.08)', color: '#CC2020',
                      fontFamily: "'Sora', sans-serif",
                    }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }} onClick={() => setShowForm(false)}>
          <div style={{
            background: '#fff', border: '1px solid #e0e0e0',
            borderRadius: '14px', width: '480px', maxWidth: '95vw',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e0e0e0' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#111', fontFamily: "'Sora', sans-serif" }}>
                {editId !== null ? 'Edit Vendor' : 'Add Vendor'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Name *', key: 'name', required: true, placeholder: 'Vendor name' },
                { label: 'Phone Number', key: 'phone', placeholder: '+62 xxx xxxx xxxx' },
                { label: 'City', key: 'city', placeholder: 'e.g. Jakarta' },
                { label: 'Speciality', key: 'speciality', placeholder: 'e.g. Hydraulic Parts' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: '#888', fontWeight: 600, fontFamily: "'Sora', sans-serif" }}>
                  {f.label}
                  <input
                    required={f.required}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{
                      padding: '9px 12px', borderRadius: '7px',
                      border: '1px solid #e0e0e0', background: '#f9f9f9',
                      color: '#111', fontSize: '14px', outline: 'none',
                      fontFamily: "'Sora', sans-serif",
                      WebkitTextFillColor: '#111',
                    }}
                  />
                </label>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  background: 'transparent', border: '1px solid #e0e0e0',
                  color: '#555', padding: '8px 16px', borderRadius: '7px', cursor: 'pointer',
                  fontFamily: "'Sora', sans-serif", fontSize: '13px', fontWeight: 600,
                }}>Cancel</button>
                <button type="submit" style={{
                  background: '#000', color: '#fff', padding: '8px 20px',
                  borderRadius: '7px', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontFamily: "'Sora', sans-serif", fontSize: '13px',
                }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}