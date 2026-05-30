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

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>📦 Klaim Sparepart</h1>
          <p className="subtitle">Kelola klaim sparepart dari teknisi / customer</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Buat Klaim</button>
      </div>

      {/* Summary Cards */}
      <div className="summary-row">
        {[
          { label:'Total Klaim', val: claims.length,  color:'' },
          { label:'Pending',     val: pendingCount,   color:'amber' },
          { label:'Disetujui',   val: approvedCount,  color:'green' },
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

      {/* Content */}
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
        .page-container {
          padding: 1.5rem;
          width: 100%;
          box-sizing: border-box;
          min-height: 100vh;
          background: #0B1629;
          color: #e2e8f0;
          font-family: 'Sora', sans-serif;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }
        h1 { font-size: 1.5rem; font-weight: 700; margin: 0; color: #f1f5f9; }
        .subtitle { color: #64748b; margin: 4px 0 0; font-size: 0.875rem; }

        /* Summary Cards */
        .summary-row { display: flex; gap: 12px; margin-bottom: 1.25rem; flex-wrap: wrap; justify-content: center; }
        .summary-card {
  background: #1E2D45;
  border: 1px solid #1E3A5F;
  border-radius: 10px;
  padding: 14px 24px;
  min-width: 150px;
  text-align: center;
}
        .summary-card.amber { border-left: 3px solid #f59e0b; }
        .summary-card.green { border-left: 3px solid #10b981; }
        .sum-label { font-size: 0.75rem; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
        .sum-num { font-size: 1.75rem; font-weight: 700; color: #f1f5f9; }

        /* Filter */
        .filter-row { display: flex; gap: 8px; margin-bottom: 1rem; align-items: center; }
        .filter-row select {
          padding: 8px 12px;
          border: 1px solid #1E3A5F;
          border-radius: 7px;
          font-size: 0.85rem;
          background: #1E2D45;
          color: #e2e8f0;
          flex: 1;
          max-width: 300px;
        }

        /* Table */
        .table-wrapper { overflow-x: auto; border-radius: 10px; border: 1px solid #1E3A5F; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
        .data-table th {
          background: #1E2D45;
          color: #64748b;
          padding: 10px 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 1px solid #1E3A5F;
          white-space: nowrap;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .data-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #1E3A5F;
          vertical-align: middle;
          color: #cbd5e1;
        }
        .data-table tbody tr:last-child td { border-bottom: none; }
        .data-table tbody tr:hover { background: #1E2D45; }
        .customer-name { font-weight: 600; color: #f1f5f9; }
        .text-muted { font-size: 0.78rem; color: #475569; }
        .text-center { text-align: center; }

        /* Badges */
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; }
        .badge-amber { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
        .badge-green { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
        .badge-red   { background: rgba(239,68,68,0.15);  color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
        .badge-gray  { background: rgba(100,116,139,0.15); color: #94a3b8; border: 1px solid rgba(100,116,139,0.3); }

        /* Buttons */
        .action-btns { display: flex; gap: 4px; }
        .btn-sm { padding: 4px 10px; border-radius: 6px; font-size: 0.72rem; cursor: pointer; border: none; font-weight: 600; }
        .btn-approve { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
        .btn-reject  { background: rgba(239,68,68,0.15);  color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
        .btn-done    { background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); }
        .btn-primary {
          background: #2E90FA;
          color: #fff;
          padding: 9px 18px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #1d6fca; }
        .btn-ghost {
          background: transparent;
          border: 1px solid #1E3A5F;
          color: #94a3b8;
          padding: 8px 14px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        /* States */
        .loading-text { color: #475569; padding: 2rem; text-align: center; }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #475569;
          background: #1E2D45;
          border-radius: 10px;
          border: 1px solid #1E3A5F;
        }
        .empty-state p { margin-bottom: 1rem; font-size: 0.9rem; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
        }
        .modal {
          background: #1E2D45;
          border: 1px solid #1E3A5F;
          border-radius: 14px;
          width: 640px;
          max-width: 95vw;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #1E3A5F;
        }
        .modal-header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #f1f5f9; }
        .modal-header button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 20px; }
        .form-grid label { display: flex; flex-direction: column; font-size: 0.8rem; color: #64748b; gap: 5px; font-weight: 600; letter-spacing: 0.03em; }
        .form-grid input, .form-grid select, .form-grid textarea {
          border: 1px solid #1E3A5F;
          border-radius: 7px;
          padding: 8px 10px;
          font-size: 0.875rem;
          background: #0B1629;
          color: #e2e8f0;
          outline: none;
        }
        .form-grid input:focus, .form-grid select:focus, .form-grid textarea:focus {
          border-color: #2E90FA;
        }
        .full-width { grid-column: 1 / -1; }
        .form-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
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