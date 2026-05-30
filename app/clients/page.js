'use client'
import { useState, useEffect } from 'react'

export default function ClientsPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all') // all | free | berbayar | expired

  useEffect(() => {
    fetch('/api/maintenance')
      .then((r) => r.json())
      .then((json) => {
        setCustomers(json.data || [])
        setLoading(false)
      })
  }, [])

  const withBast = customers.filter((c) => c.bastDate)

  const filtered = withBast.filter((c) => {
    if (filter === 'free')     return c.warrantyStatus === 'free'
    if (filter === 'berbayar') return c.warrantyStatus === 'berbayar'
    if (filter === 'expired')  return !c.bastDate
    return true
  })

  const freeCount     = withBast.filter((c) => c.warrantyStatus === 'free').length
  const berbayarCount = withBast.filter((c) => c.warrantyStatus === 'berbayar').length

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>🛡 Data Garansi</h1>
          <p className="subtitle">Garansi: 2 kunjungan pertama gratis setelah tanggal BAST</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="summary-row">
        <div className="summary-card" onClick={() => setFilter('all')} data-active={filter === 'all'}>
          <div className="sum-label">Total Customer</div>
          <div className="sum-num">{withBast.length}</div>
        </div>
        <div className="summary-card green" onClick={() => setFilter('free')} data-active={filter === 'free'}>
          <div className="sum-label">Masih Garansi (Free)</div>
          <div className="sum-num">{freeCount}</div>
        </div>
        <div className="summary-card amber" onClick={() => setFilter('berbayar')} data-active={filter === 'berbayar'}>
          <div className="sum-label">Sudah Berbayar</div>
          <div className="sum-num">{berbayarCount}</div>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Memuat Data Garansi...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">Belum ada data garansi. Tambahkan customer di halaman Maintenance.</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Kota</th>
                <th>Unit / Serial</th>
                <th>Tanggal BAST</th>
                <th>Kunjungan ke-1</th>
                <th>Kunjungan ke-2</th>
                <th>Total Kunjungan</th>
                <th>Status Garansi</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const isWarranty = c.warrantyStatus === 'free'
                const remaining  = Math.max(0, 2 - c.visitCount)
                return (
                  <tr key={c._id}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="customer-name">{c.customerName}</div>
                      <div className="text-muted">{c.phone}</div>
                    </td>
                    <td>{c.kota}</td>
                    <td>
                      <div>{c.unitType}</div>
                      <div className="text-muted">{c.serialNumber}</div>
                    </td>
                    <td>
                      {c.bastDate
                        ? new Date(c.bastDate).toLocaleDateString('id-ID')
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <VisitCell visitNumber={1} visitCount={c.visitCount} lastVisitDate={c.lastVisitDate} />
                    </td>
                    <td>
                      <VisitCell visitNumber={2} visitCount={c.visitCount} lastVisitDate={c.lastVisitDate} />
                    </td>
                    <td className="text-center">
                      <strong>{c.visitCount}</strong>
                    </td>
                    <td>
                      {isWarranty ? (
                        <span className="badge badge-info">Free ({remaining} sisa)</span>
                      ) : (
                        <span className="badge badge-amber">Berbayar</span>
                      )}
                    </td>
                    <td className="text-muted" style={{fontSize:'0.78rem'}}>
                      {isWarranty
                        ? `${remaining} kunjungan gratis tersisa`
                        : `Kunjungan ke-${c.visitCount} sudah berbayar`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .page-container { padding: 1.5rem; width: 100%; }
        .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem; }
        h1 { font-size:1.5rem; font-weight:600; margin:0; }
        .subtitle { color:#666; margin:4px 0 0; font-size:0.875rem; }
        .summary-row { display:flex; gap:12px; margin-bottom:1.5rem; flex-wrap:wrap; }
        .summary-card {
  background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.15); border-radius:10px;
  padding:14px 20px; min-width:160px; cursor:pointer; transition:box-shadow .15s;
}
.summary-card:hover { box-shadow:0 2px 8px rgba(0,0,0,.3); }
.summary-card[data-active="true"] { border-color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.12); }
.summary-card.green { border-left:3px solid #10b981; }
.summary-card.amber { border-left:3px solid #f59e0b; }
.sum-label { font-size:0.78rem; color:rgba(255,255,255,0.6); margin-bottom:4px; }
.sum-num { font-size:1.5rem; font-weight:700; color:#fff; }
        .table-wrapper { overflow-x:auto; }
        .data-table { width:100%; border-collapse:collapse; font-size:0.83rem; }
        .data-table th { background:#f5f5f5; padding:8px 10px; text-align:left; font-weight:600; border-bottom:2px solid #e5e5e5; white-space:nowrap; }
        .data-table td { padding:8px 10px; border-bottom:1px solid #f0f0f0; vertical-align:middle; }
        .customer-name { font-weight:500; }
        .text-muted { font-size:0.78rem; color:#888; }
        .text-center { text-align:center; }
        .badge { display:inline-block; padding:3px 10px; border-radius:12px; font-size:0.75rem; font-weight:600; }
        .badge-info  { background:#1e40af; color:#fff; }
        .badge-amber { background:#fef3c7; color:#92400e; }
        .loading-text { color:#888; padding:2rem; text-align:center; }
        .empty-state { text-align:center; padding:3rem; color:#888; background:#fafafa; border-radius:10px; }
      `}</style>
    </div>
  )
}

// Helper component: show visit checkmark if done
function VisitCell({ visitNumber, visitCount, lastVisitDate }) {
  const done = visitCount >= visitNumber
  return done ? (
    <span style={{color:'#10b981', fontWeight:600, fontSize:'0.8rem'}}>
      ✓ {visitNumber === visitCount && lastVisitDate
        ? new Date(lastVisitDate).toLocaleDateString('id-ID')
        : 'Selesai'}
    </span>
  ) : (
    <span style={{color:'#d1d5db', fontSize:'0.8rem'}}>—</span>
  )
}