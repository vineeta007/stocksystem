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
    <div style={{ padding: '1.5rem', background: '#0B1629', minHeight: '100vh', color: '#e2e8f0', fontFamily: "'Sora', sans-serif" }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>🏪 Vendor List</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>{vendors.length} vendors registered</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }} style={{
          background: '#2E90FA', color: '#fff', padding: '9px 18px',
          borderRadius: '8px', border: 'none', cursor: 'pointer',
          fontSize: '0.875rem', fontWeight: 600,
        }}>+ Add Vendor</button>
      </div>

      <input
        placeholder="Search by name, city or speciality..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', maxWidth: '360px', padding: '8px 12px',
          background: '#1E2D45', border: '1px solid #1E3A5F',
          borderRadius: '8px', color: '#e2e8f0', fontSize: '0.875rem',
          marginBottom: '1rem', boxSizing: 'border-box', outline: 'none',
        }}
      />

      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #1E3A5F' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              {['#', 'Name', 'Phone Number', 'City', 'Speciality', 'Actions'].map(h => (
                <th key={h} style={{
                  background: '#1E2D45', color: '#64748b', padding: '12px 16px',
                  textAlign: 'left', fontWeight: 600, fontSize: '0.75rem',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  borderBottom: '1px solid #1E3A5F', whiteSpace: 'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
                  No vendors yet. Click "+ Add Vendor" to get started.
                </td>
              </tr>
            ) : filtered.map((v, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1E3A5F' }}>
                <td style={{ padding: '12px 16px', color: '#475569' }}>{i + 1}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f1f5f9' }}>{v.name}</td>
                <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{v.phone}</td>
                <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{v.city}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    background: 'rgba(46,144,250,0.15)', color: '#60a5fa',
                    border: '1px solid rgba(46,144,250,0.3)',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                  }}>{v.speciality}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleEdit(i)} style={{
                      padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem',
                      fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(99,102,241,0.3)',
                      background: 'rgba(99,102,241,0.15)', color: '#818cf8',
                    }}>Edit</button>
                    <button onClick={() => handleDelete(i)} style={{
                      padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem',
                      fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                    }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }} onClick={() => setShowForm(false)}>
          <div style={{
            background: '#1E2D45', border: '1px solid #1E3A5F',
            borderRadius: '14px', width: '480px', maxWidth: '95vw',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1E3A5F' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
                {editId !== null ? 'Edit Vendor' : 'Add Vendor'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Name *', key: 'name', required: true, placeholder: 'Vendor name' },
                { label: 'Phone Number', key: 'phone', placeholder: '+62 xxx xxxx xxxx' },
                { label: 'City', key: 'city', placeholder: 'e.g. Jakarta' },
                { label: 'Speciality', key: 'speciality', placeholder: 'e.g. Hydraulic Parts' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  {f.label}
                  <input
                    required={f.required}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{
                      padding: '8px 10px', borderRadius: '7px',
                      border: '1px solid #1E3A5F', background: '#0B1629',
                      color: '#e2e8f0', fontSize: '0.875rem', outline: 'none',
                    }}
                  />
                </label>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  background: 'transparent', border: '1px solid #1E3A5F',
                  color: '#94a3b8', padding: '8px 16px', borderRadius: '7px', cursor: 'pointer',
                }}>Cancel</button>
                <button type="submit" style={{
                  background: '#2E90FA', color: '#fff', padding: '8px 20px',
                  borderRadius: '7px', border: 'none', cursor: 'pointer', fontWeight: 600,
                }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}