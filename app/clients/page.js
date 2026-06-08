'use client'
import { useState, useEffect } from 'react'

export default function ClientsPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')

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
      <div style={{
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '32px 0 32px', borderBottom: '1px solid #e0e0e0',
  marginBottom: '20px', position: 'relative',
}}>
  <h1 style={{
    fontSize: '40px', fontWeight: 700, color: '#111', margin: 0,
    fontFamily: "'Cormorant Garamond', serif",
    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: '12px',
    whiteSpace: 'nowrap',
  }}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1e40af" width="44" height="44">
      <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6l-9-4z" />
    </svg>
    Data Garansi
  </h1>
</div>

<p className="subtitle" style={{ marginBottom: '1rem' }}>Garansi: 2 kunjungan pertama gratis setelah tanggal BAST</p>

      {/* Summary cards */}
      <div className="summary-row">
        <div
          className={`summary-card ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <div className="sum-label">Total Customer</div>
          <div className="sum-num">{withBast.length}</div>
        </div>

        <div
          className={`summary-card green ${filter === 'free' ? 'active' : ''}`}
          onClick={() => setFilter('free')}
        >
          <div className="sum-label">Masih Garansi (Free)</div>
          <div className="sum-num">{freeCount}</div>
        </div>

        <div
          className={`summary-card amber ${filter === 'berbayar' ? 'active' : ''}`}
          onClick={() => setFilter('berbayar')}
        >
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
        .page-container {
          padding: 1.5rem;
          width: 100%;
          background: #f8fafc;
          min-height: 100vh;
          color: #1e293b;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
        }

        .subtitle {
          color: #64748b;
          margin: 4px 0 0;
          font-size: 0.875rem;
        }

        /* ── Summary row: centered with gaps ── */
        .summary-row {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .summary-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 28px;
          min-width: 180px;
          cursor: pointer;
          transition: box-shadow 0.15s, border-color 0.15s, transform 0.1s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          text-align: center;
        }

        .summary-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }

        .summary-card.active {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }

        .summary-card.green {
          border-left: 4px solid #10b981;
        }

        .summary-card.green.active {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
        }

        .summary-card.amber {
          border-left: 4px solid #f59e0b;
        }

        .summary-card.amber.active {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
        }

        /* ── Card label & number: fully visible ── */
        .sum-label {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .sum-num {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
        }

        /* ── Table ── */
        .table-wrapper {
          overflow-x: auto;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.83rem;
        }

        .data-table th {
          background: #f1f5f9;
          padding: 10px 12px;
          text-align: left;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
          white-space: nowrap;
        }

        .data-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          color: #1e293b;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:hover td {
          background: #f8fafc;
        }

        .customer-name {
          font-weight: 600;
          color: #0f172a;
        }

        .text-muted {
          font-size: 0.78rem;
          color: #94a3b8;
        }

        .text-center {
          text-align: center;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.74rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .badge-info {
          background: #1e40af;
          color: #ffffff;
        }

        .badge-amber {
          background: #fef3c7;
          color: #92400e;
        }

        .loading-text {
          color: #94a3b8;
          padding: 2rem;
          text-align: center;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #94a3b8;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px dashed #e2e8f0;
        }
      `}</style>
    </div>
  )
}

function VisitCell({ visitNumber, visitCount, lastVisitDate }) {
  const done = visitCount >= visitNumber
  return done ? (
    <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.8rem' }}>
      ✓ {visitNumber === visitCount && lastVisitDate
        ? new Date(lastVisitDate).toLocaleDateString('id-ID')
        : 'Selesai'}
    </span>
  ) : (
    <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
  )
}