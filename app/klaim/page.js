'use client';

// app/klaim/page.js
// Halaman untuk melihat & approve/reject klaim sparepart

import { useEffect, useState } from 'react';

export default function KlaimPage() {
  const [klaims,  setKlaims]  = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadKlaims() {
    setLoading(true);
    try {
      const res  = await fetch('/api/products/klaim');
      const json = await res.json();
      if (json.success) setKlaims(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadKlaims(); }, []);

  async function handleAction(productId, klaimId, action) {
    try {
      const res = await fetch(`/api/products/klaim/${klaimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action }),
      });
      const json = await res.json();
      if (json.success) { alert(`Klaim berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}!`); loadKlaims(); }
      else alert('Gagal: ' + json.error);
    } catch (err) { console.error(err); }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', fontFamily: 'inherit' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>📦 Klaim Sparepart</h1>
        <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
          Daftar klaim sparepart yang menunggu persetujuan
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Memuat data...</p>
      ) : klaims.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>✅</p>
          <p style={{ color: '#64748b', fontSize: 14 }}>Tidak ada klaim yang pending.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Produk', 'SKU', 'Stok Sekarang', 'Jumlah Klaim', 'Customer', 'Alasan', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {klaims.map((k, idx) => (
                <tr key={k.klaim._id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{k.productName}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>{k.sku || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#1e293b', fontWeight: 600 }}>{k.stokSekarang}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: 20, fontWeight: 700, fontSize: 12 }}>
                      {k.klaim.jumlah}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{k.klaim.namaCustomer || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{k.klaim.alasan || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {k.klaim.createdAt ? new Date(k.klaim.createdAt).toLocaleDateString('id-ID') : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleAction(k.productId, k.klaim._id, 'approve')}
                        style={{ padding: '4px 12px', borderRadius: 6, background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >✓ Setuju</button>
                      <button
                        onClick={() => handleAction(k.productId, k.klaim._id, 'reject')}
                        style={{ padding: '4px 12px', borderRadius: 6, background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >✕ Tolak</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}