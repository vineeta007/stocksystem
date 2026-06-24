'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_TABS = ['All', 'Draft', 'Sent', 'Paid', 'Cancelled']

function formatRupiah(n) {
  if (!n && n !== 0) return '—'
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function QuotationPage() {
  const router = useRouter()
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState('All')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeTab !== 'All') params.set('status', activeTab)
    const res  = await fetch(`/api/quotations?${params}`)
    const json = await res.json()
    setQuotations(json.data || [])
    setLoading(false)
  }, [activeTab])

  useEffect(() => { fetchData() }, [fetchData])

  async function updateStatus(id, status) {
    await fetch(`/api/quotations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchData()
  }

  async function deleteQuotation(id) {
    if (!confirm('Delete this quotation?')) return
    await fetch(`/api/quotations/${id}`, { method: 'DELETE' })
    fetchData()
  }

  return (
    <div style={{ padding: '2rem', background: '#fff', minHeight: '100vh', fontFamily: "'Sora', sans-serif" }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '0.72rem', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
        GENERATED
      </p>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", color: '#111', margin: 0 }}>
          Quotations
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.8rem' }}>
          Generate quotations from a client's cart
        </p>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem' }}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 18px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: activeTab === tab ? '#111' : '#fff',
              color: activeTab === tab ? '#fff' : '#374151',
              fontFamily: "'Sora', sans-serif",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
              {['REF NO.', 'CLIENT', 'PROJECT', 'DATE', 'STATUS', 'AMOUNT', 'ACTIONS'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left', color: '#9ca3af',
                  fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
            ) : quotations.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>No quotations yet.</td></tr>
            ) : quotations.map((q, i) => (
              <tr key={q._id} style={{ borderBottom: i < quotations.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '16px', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                  {q.refNo}
                </td>
                <td style={{ padding: '16px', fontWeight: 500, color: '#111' }}>{q.clientName}</td>
                <td style={{ padding: '16px', color: '#CC2020' }}>{q.project || '—'}</td>
                <td style={{ padding: '16px', color: '#374151', fontWeight: 500 }}>{formatDate(q.quoteDate)}</td>
                <td style={{ padding: '16px' }}>
                  <select
                    value={q.status}
                    onChange={e => updateStatus(q._id, e.target.value)}
                    style={{
                      padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem',
                      border: '1px solid #d1d5db', background: '#fff', color: '#374151',
                      cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    {['Draft','Sent','Paid','Cancelled'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding: '16px', fontWeight: 500, color: '#111', fontFamily: 'monospace' }}>
                  {formatRupiah(q.grandTotal)}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      onClick={() => router.push(`/maintenance/${q.customerId}?tab=quotations`)}
                      title="View"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1rem' }}
                    >👁</button>
                    <button
                      title="Download PDF"
                      onClick={() => window.open(`/api/quotations/${q._id}/pdf`, '_blank')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1rem' }}
                    >⬇</button>
                    <button
                      onClick={() => deleteQuotation(q._id)}
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1rem' }}
                    >✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}