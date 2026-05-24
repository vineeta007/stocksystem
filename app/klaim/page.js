'use client'
import { useState, useEffect } from 'react'

const STATUS_OPTIONS = ['Pending','Disetujui','Ditolak','Selesai']

export default function KlaimPage() {
  const [claims, setClaims]     = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const [form, setForm] = useState({
    customerName:'', kota:'', unitSerial:'', sparepartId:'',
    qty:1, reason:'', technicianName:'', claimDate:'', notes:''
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/klaim').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([klaimData, prodData]) => {
      setClaims(klaimData.data || [])
      setProducts(prodData.data || prodData.products || [])
      setLoading(false)
    })
  }, [])

  const filtered = filterStatus
    ? claims.filter((c) => c.status === filterStatus)
    : claims

  async function handleSubmit(e) {
    e.preventDefault()
    await fetch('/api/klaim', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ ...form, status: 'Pending' }),
    })
    setShowForm(false)
    setForm({ customerName:'', kota:'', unitSerial:'', sparepartId:'', qty:1, reason:'', technicianName:'', claimDate:'', notes:'' })
    fetch('/api/klaim').then(r => r.json()).then(d => setClaims(d.data || []))
  }

  async function updateStatus(id, status) {
    await fetch(`/api/klaim/${id}`, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ status }),
    })
    fetch('/api/klaim').then(r => r.json()).then(d => setClaims(d.data || []))
  }

  const pendingCount   = claims.filter(c => c.status === 'Pending').length
  const approvedCount  = claims.filter(c => c.status === 'Disetujui').length

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>📦 Klaim Sparepart</h1>
          <p className="subtitle">Kelola klaim sparepart dari teknisi / customer</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Buat Klaim</button>
      </div>

      {/* Summary */}
      <div className="summary-row">
        {[
          { label:'Total Klaim', val: claims.length, color:'' },
          { label:'Pending',     val: pendingCount,  color:'amber' },
          { label:'Disetujui',   val: approvedCount, color:'green' },
        ].map(s => (
          <div key={s.label} className={`summary-card ${s.color}`}>
            <div className="sum-label">{s.label}</div>
            <div className="sum-num">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="filter-row">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        {filterStatus && <button className="btn-ghost" onClick={() => setFilterStatus('')}>Reset</button>}
      </div>

      {loading ? (
        <p className="loading-text">Memuat data...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada klaim sparepart.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Buat Klaim Pertama</button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tanggal</th>
                <th>Customer</th>
                <th>Kota</th>
                <th>Serial Unit</th>
                <th>Sparepart</th>
                <th>Qty</th>
                <th>Alasan</th>
                <th>Teknisi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c._id}>
                  <td>{i + 1}</td>
                  <td>{c.claimDate ? new Date(c.claimDate).toLocaleDateString('id-ID') : '—'}</td>
                  <td className="customer-name">{c.customerName}</td>
                  <td>{c.kota}</td>
                  <td className="text-muted">{c.unitSerial}</td>
                  <td>{c.sparepartName || c.sparepartId}</td>
                  <td className="text-center">{c.qty}</td>
                  <td style={{maxWidth:'160px', fontSize:'0.78rem'}}>{c.reason}</td>
                  <td>{c.technicianName}</td>
                  <td><span className={`badge badge-${statusColor(c.status)}`}>{c.status}</span></td>
                  <td>
                    {c.status === 'Pending' && (
                      <div className="action-btns">
                        <button className="btn-sm btn-approve" onClick={() => updateStatus(c._id, 'Disetujui')}>✓ Setuju</button>
                        <button className="btn-sm btn-reject"  onClick={() => updateStatus(c._id, 'Ditolak')}>✕ Tolak</button>
                      </div>
                    )}
                    {c.status === 'Disetujui' && (
                      <button className="btn-sm btn-done" onClick={() => updateStatus(c._id, 'Selesai')}>Selesai</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Buat Klaim Sparepart</h2>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="form-grid">
              <label>Nama Customer *
                <input required value={form.customerName} onChange={e => setForm({...form, customerName:e.target.value})} />
              </label>
              <label>Kota
                <input value={form.kota} onChange={e => setForm({...form, kota:e.target.value})} />
              </label>
              <label>Serial Unit
                <input value={form.unitSerial} onChange={e => setForm({...form, unitSerial:e.target.value})} />
              </label>
              <label>Teknisi
                <input value={form.technicianName} onChange={e => setForm({...form, technicianName:e.target.value})} />
              </label>
              <label>Sparepart *
                <select required value={form.sparepartId} onChange={e => setForm({...form, sparepartId:e.target.value})}>
                  <option value="">Pilih Sparepart</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (Stok: {p.stock ?? p.qty ?? 0})</option>
                  ))}
                </select>
              </label>
              <label>Qty *
                <input type="number" min="1" required value={form.qty} onChange={e => setForm({...form, qty:parseInt(e.target.value)||1})} />
              </label>
              <label>Tanggal Klaim
                <input type="date" value={form.claimDate} onChange={e => setForm({...form, claimDate:e.target.value})} />
              </label>
              <label>Alasan *
                <input required value={form.reason} onChange={e => setForm({...form, reason:e.target.value})} />
              </label>
              <label className="full-width">Catatan
                <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} />
              </label>
              <div className="form-actions full-width">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Batal</button>
                <button type="submit" className="btn-primary">Kirim Klaim</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-container { padding:1.5rem; max-width:1400px; }
        .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; }
        h1 { font-size:1.5rem; font-weight:600; margin:0; }
        .subtitle { color:#666; margin:4px 0 0; font-size:0.875rem; }
        .summary-row { display:flex; gap:12px; margin-bottom:1.25rem; flex-wrap:wrap; }
        .summary-card { background:#f9f9f9; border:1px solid #e5e5e5; border-radius:10px; padding:14px 20px; min-width:140px; }
        .summary-card.green { border-left:3px solid #10b981; }
        .summary-card.amber { border-left:3px solid #f59e0b; }
        .sum-label { font-size:0.78rem; color:#666; margin-bottom:4px; }
        .sum-num { font-size:1.5rem; font-weight:700; }
        .filter-row { display:flex; gap:8px; margin-bottom:1rem; }
        .filter-row select { padding:6px 10px; border:1px solid #ddd; border-radius:6px; font-size:0.85rem; }
        .table-wrapper { overflow-x:auto; }
        .data-table { width:100%; border-collapse:collapse; font-size:0.83rem; }
        .data-table th { background:#f5f5f5; padding:8px 10px; text-align:left; font-weight:600; border-bottom:2px solid #e5e5e5; white-space:nowrap; }
        .data-table td { padding:8px 10px; border-bottom:1px solid #f0f0f0; vertical-align:middle; }
        .customer-name { font-weight:500; }
        .text-muted { font-size:0.78rem; color:#888; }
        .text-center { text-align:center; }
        .badge { display:inline-block; padding:2px 9px; border-radius:12px; font-size:0.75rem; font-weight:600; }
        .badge-amber   { background:#fef3c7; color:#92400e; }
        .badge-green   { background:#d1fae5; color:#065f46; }
        .badge-red     { background:#fee2e2; color:#b91c1c; }
        .badge-gray    { background:#f3f4f6; color:#374151; }
        .action-btns { display:flex; gap:4px; }
        .btn-sm { padding:3px 8px; border-radius:5px; font-size:0.75rem; cursor:pointer; border:none; }
        .btn-approve { background:#d1fae5; color:#065f46; }
        .btn-reject  { background:#fee2e2; color:#b91c1c; }
        .btn-done    { background:#e0e7ff; color:#3730a3; }
        .btn-primary { background:#111; color:#fff; padding:8px 16px; border-radius:7px; border:none; cursor:pointer; font-size:0.875rem; }
        .btn-ghost { background:transparent; border:1px solid #ddd; padding:8px 14px; border-radius:7px; cursor:pointer; font-size:0.875rem; }
        .loading-text { color:#888; padding:2rem; text-align:center; }
        .empty-state { text-align:center; padding:3rem; color:#888; background:#fafafa; border-radius:10px; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; z-index:100; }
        .modal { background:#fff; border-radius:12px; width:640px; max-width:95vw; max-height:90vh; overflow-y:auto; }
        .modal-header { display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #eee; }
        .modal-header h2 { margin:0; font-size:1.1rem; font-weight:600; }
        .modal-header button { background:none; border:none; font-size:1.2rem; cursor:pointer; }
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:20px; }
        .form-grid label { display:flex; flex-direction:column; font-size:0.82rem; color:#555; gap:4px; }
        .form-grid input, .form-grid select, .form-grid textarea { border:1px solid #ddd; border-radius:6px; padding:7px 10px; font-size:0.875rem; }
        .full-width { grid-column:1 / -1; }
        .form-actions { display:flex; justify-content:flex-end; gap:8px; padding-top:4px; }
      `}</style>
    </div>
  )
}

function statusColor(s) {
  if (s === 'Pending')   return 'amber'
  if (s === 'Disetujui') return 'green'
  if (s === 'Ditolak')   return 'red'
  return 'gray'
}