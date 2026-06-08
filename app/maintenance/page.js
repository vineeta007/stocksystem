'use client'
import { useState, useEffect, useCallback } from 'react'

const KOTA_LIST = [
  'Semua Kota','Jakarta','Surabaya','Bandung','Medan','Semarang',
  'Bekasi','Depok','Tangerang','Makassar','Palembang',
]

function daysBadge(days) {
  if (days === null || days === undefined) return null
  if (days < 0)    return <span className="badge badge-danger">Terlambat {Math.abs(days)}h</span>
  if (days <= 14)  return <span className="badge badge-warning">⚠ {days} hari lagi</span>
  return <span className="badge badge-success">{days} hari</span>
}

function warrantyBadge(status) {
  if (status === 'free') return <span className="badge badge-info">Garansi (Free)</span>
  return <span className="badge badge-secondary">Berbayar</span>
}

export default function MaintenancePage() {
  const [customers, setCustomers]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [kotaFilter, setKotaFilter]     = useState('Semua Kota')
  const [statusFilter, setStatus]       = useState('')
  const [showForm, setShowForm]         = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [reminderOnly, setReminderOnly] = useState(false)

  const [form, setForm] = useState({
    customerName:'', address:'', kota:'', phone:'', unitType:'',
    serialNumber:'', bastDate:'', lastVisitDate:'', visitCount:0, status:'New', notes:''
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (kotaFilter !== 'Semua Kota') params.set('kota', kotaFilter)
    if (statusFilter)                params.set('status', statusFilter)
    if (reminderOnly)                params.set('reminder', 'true')
    const res  = await fetch(`/api/maintenance?${params}`)
    const json = await res.json()
    setCustomers(json.data || [])
    setLoading(false)
  }, [kotaFilter, statusFilter, reminderOnly])

  useEffect(() => { fetchData() }, [fetchData])

  const needAttention = customers.filter(
    (c) => c.daysUntilNextVisit !== null && c.daysUntilNextVisit <= 14
  ).length

  async function handleSubmit(e) {
    e.preventDefault()
    const method = editTarget ? 'PATCH' : 'POST'
    const url    = editTarget ? `/api/maintenance/${editTarget._id}` : '/api/maintenance'
    await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    setShowForm(false)
    setEditTarget(null)
    setForm({ customerName:'', address:'', kota:'', phone:'', unitType:'',
              serialNumber:'', bastDate:'', lastVisitDate:'', visitCount:0, status:'New', notes:'' })
    fetchData()
  }

  function openEdit(c) {
    setEditTarget(c)
    setForm({
      customerName:  c.customerName  || '',
      address:       c.address       || '',
      kota:          c.kota          || '',
      phone:         c.phone         || '',
      unitType:      c.unitType      || '',
      serialNumber:  c.serialNumber  || '',
      bastDate:      c.bastDate      ? c.bastDate.slice(0,10)      : '',
      lastVisitDate: c.lastVisitDate ? c.lastVisitDate.slice(0,10) : '',
      visitCount:    c.visitCount    || 0,
      status:        c.status        || 'New',
      notes:         c.notes         || '',
    })
    setShowForm(true)
  }

  async function recordVisit(id) {
    await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ action: 'recordVisit' }),
    })
    fetchData()
  }

  async function deleteCustomer(id) {
    if (!confirm('Hapus customer ini?')) return
    await fetch(`/api/maintenance/${id}`, { method: 'DELETE' })
    fetchData()
  }

  return (
    <div className="page-container">

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '32px 0 32px', borderBottom: '1px solid #e0e0e0',
        marginBottom: '20px', position: 'relative',
      }}>
        <h1 style={{
          fontSize: '40px', fontWeight: 700, color: '#111', margin: 0,
          fontFamily: "'Cormorant Garamond', serif",
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        }}>Customer List</h1>
        <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => { setEditTarget(null); setShowForm(true) }}>
          + Tambah Customer
        </button>
      </div>

      {/* Subtitle */}
      <p className="subtitle" style={{ marginBottom: '1rem' }}>
        {customers.length} customer aktif
        {needAttention > 0 && (
          <span className="badge badge-warning ml-2">⚠ {needAttention} perlu perhatian</span>
        )}
      </p>

      {/* Reminder banner */}
      {!reminderOnly && needAttention > 0 && (
        <div className="reminder-banner" onClick={() => setReminderOnly(true)}>
          🔔 <strong>{needAttention} customer</strong> memiliki jadwal kunjungan dalam 14 hari ke depan.
          <span className="reminder-link">Lihat semua →</span>
        </div>
      )}
      {reminderOnly && (
        <div className="reminder-banner active">
          🔔 Menampilkan customer dengan jadwal ≤ 14 hari.
          <span className="reminder-link" onClick={() => setReminderOnly(false)}>Reset →</span>
        </div>
      )}

      {/* Filters */}
      <div className="filter-row">
        <select value={kotaFilter} onChange={(e) => setKotaFilter(e.target.value)}>
          {KOTA_LIST.map((k) => <option key={k}>{k}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="New">New</option>
        </select>
        {(kotaFilter !== 'Semua Kota' || statusFilter || reminderOnly) && (
          <button className="btn-ghost" onClick={() => { setKotaFilter('Semua Kota'); setStatus(''); setReminderOnly(false) }}>
            Reset Filter
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <p className="loading-text">Memuat data...</p>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <p>Tidak ada data{kotaFilter !== 'Semua Kota' ? ` untuk kota ${kotaFilter}` : ''}.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Tambah Customer</button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Kota</th>
                <th>Unit</th>
                <th>Kunjungan Terakhir</th>
                <th>Kunjungan Berikutnya</th>
                <th>Sisa Hari</th>
                <th>Jml Kunjungan</th>
                <th>Garansi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr key={c._id} className={c.daysUntilNextVisit !== null && c.daysUntilNextVisit <= 14 ? 'row-warning' : ''}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="customer-name">{c.customerName}</div>
                    <div className="customer-addr">{c.address}</div>
                  </td>
                  <td>{c.kota}</td>
                  <td>
                    <div>{c.unitType}</div>
                    <div className="text-muted">{c.serialNumber}</div>
                  </td>
                  <td>{c.lastVisitDate ? new Date(c.lastVisitDate).toLocaleDateString('id-ID') : <span className="text-muted">—</span>}</td>
                  <td>{c.nextVisitDate  ? new Date(c.nextVisitDate).toLocaleDateString('id-ID')  : <span className="text-muted">—</span>}</td>
                  <td>{daysBadge(c.daysUntilNextVisit)}</td>
                  <td className="text-center">{c.visitCount}</td>
                  <td>{warrantyBadge(c.warrantyStatus)}</td>
                  <td><span className={`status-pill status-${c.status?.toLowerCase()}`}>{c.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-sm btn-visit" onClick={() => recordVisit(c._id)}>✓ Kunjungan</button>
                      <button className="btn-sm btn-edit"  onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn-sm btn-del"   onClick={() => deleteCustomer(c._id)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTarget ? 'Edit Customer' : 'Tambah Customer'}</h2>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="form-grid">
              <label>Nama Customer *
                <input required value={form.customerName} onChange={(e) => setForm({...form, customerName: e.target.value})} />
              </label>
              <label>Kota *
                <select required value={form.kota} onChange={(e) => setForm({...form, kota: e.target.value})}>
                  <option value="">Pilih Kota</option>
                  {KOTA_LIST.slice(1).map((k) => <option key={k}>{k}</option>)}
                </select>
              </label>
              <label>Alamat
                <input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
              </label>
              <label>Telepon
                <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
              </label>
              <label>Tipe Unit
                <input value={form.unitType} onChange={(e) => setForm({...form, unitType: e.target.value})} />
              </label>
              <label>Serial Number
                <input value={form.serialNumber} onChange={(e) => setForm({...form, serialNumber: e.target.value})} />
              </label>
              <label>Tanggal BAST
                <input type="date" value={form.bastDate} onChange={(e) => setForm({...form, bastDate: e.target.value})} />
              </label>
              <label>Tanggal Kunjungan Terakhir
                <input type="date" value={form.lastVisitDate} onChange={(e) => setForm({...form, lastVisitDate: e.target.value})} />
              </label>
              <label>Jumlah Kunjungan
                <input type="number" min="0" value={form.visitCount} onChange={(e) => setForm({...form, visitCount: parseInt(e.target.value)||0})} />
              </label>
              <label>Status
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                  <option>New</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
              <label className="full-width">Catatan
                <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows={3} />
              </label>
              <div className="form-actions full-width">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Batal</button>
                <button type="submit" className="btn-primary">Simpan</button>
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
          background: #ffffff;
          color: #111111;
          font-family: 'Sora', sans-serif;
        }
        .subtitle { color: #6b7280; margin: 4px 0 0; font-size: 0.9rem; }

        /* Reminder */
        .reminder-banner {
          background: #fffbeb; border: 1px solid #f59e0b; border-radius: 8px;
          padding: 10px 16px; margin-bottom: 1rem; font-size: 0.9rem;
          cursor: pointer; color: #92400e;
        }
        .reminder-banner.active { background: #fffbeb; border-color: #f59e0b; }
        .reminder-link { margin-left: 8px; color: #d97706; font-weight: 600; }

        /* Filters */
        .filter-row { display: flex; gap: 8px; margin-bottom: 1rem; flex-wrap: wrap; }
        .filter-row select {
          padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 6px;
          font-size: 0.85rem; background: #ffffff; color: #111111;
          width: auto; min-width: 160px;
        }

        /* Table */
        .table-wrapper { overflow-x: auto; border-radius: 10px; border: 1px solid #e5e7eb; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
        .data-table th {
          background: #f9fafb; color: #6b7280; padding: 10px 12px; text-align: left;
          font-weight: 600; border-bottom: 1px solid #e5e7eb; white-space: nowrap;
          font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .data-table td {
          padding: 10px 12px; border-bottom: 1px solid #f3f4f6;
          vertical-align: middle; color: #374151;
        }
        .data-table tbody tr:last-child td { border-bottom: none; }
        .data-table tbody tr:hover td { background: #f9fafb; }
        .row-warning td { background: rgba(245,158,11,0.06) !important; }
        .customer-name { font-weight: 600; color: #111111; }
        .customer-addr { font-size: 0.78rem; color: #9ca3af; }
        .text-muted { font-size: 0.78rem; color: #9ca3af; }
        .text-center { text-align: center; }

        /* Badges */
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
        .badge-danger    { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .badge-warning   { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
        .badge-success   { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .badge-info      { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
        .badge-secondary { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }
        .ml-2 { margin-left: 8px; }

        /* Status pills */
        .status-pill { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; }
        .status-active   { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .status-inactive { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .status-new      { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }

        /* Action buttons */
        .action-btns { display: flex; gap: 4px; }
        .btn-sm { padding: 4px 10px; border-radius: 6px; font-size: 0.72rem; cursor: pointer; border: 1px solid; font-weight: 600; }
        .btn-visit { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
        .btn-edit  { background: #f5f3ff; color: #7c3aed; border-color: #ddd6fe; }
        .btn-del   { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

        /* Primary / ghost buttons */
        .btn-primary {
          background: #111111; color: #fff; padding: 9px 18px; border-radius: 8px;
          border: none; cursor: pointer; font-size: 0.875rem; font-weight: 600; white-space: nowrap;
        }
        .btn-primary:hover { background: #333333; }
        .btn-ghost {
          background: transparent; border: 1px solid #e5e7eb; color: #6b7280;
          padding: 8px 14px; border-radius: 7px; cursor: pointer; font-size: 0.875rem;
        }

        /* States */
        .loading-text { color: #9ca3af; padding: 2rem; text-align: center; }
        .empty-state {
          text-align: center; padding: 3rem; color: #9ca3af;
          background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb;
        }
        .empty-state p { margin-bottom: 1rem; }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center; z-index: 100;
        }
        .modal {
          background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;
          width: 680px; max-width: 95vw; max-height: 90vh; overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px; border-bottom: 1px solid #e5e7eb;
        }
        .modal-header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; color: #111111; }
        .modal-header button { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #9ca3af; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 20px; }
        .form-grid label { display: flex; flex-direction: column; font-size: 0.8rem; color: #6b7280; gap: 4px; font-weight: 600; }
        .form-grid input, .form-grid select, .form-grid textarea {
          border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px;
          font-size: 0.875rem; background: #ffffff; color: #111111; outline: none;
        }
        .form-grid input:focus, .form-grid select:focus, .form-grid textarea:focus {
          border-color: #111111;
        }
        .full-width { grid-column: 1 / -1; }
        .form-actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
      `}</style>
    </div>
  )
}