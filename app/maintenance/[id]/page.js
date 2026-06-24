'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// ── helpers ───────────────────────────────────────────────────────────────────
function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtRp(n) {
  if (!n && n !== 0) return 'Rp 0'
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}
// yyyy-mm-dd for <input type="date">
function toInputDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  return dt.toISOString().slice(0, 10)
}

// ── fetch logo as base64 ──────────────────────────────────────────────────────
async function fetchLogoBase64() {
  try {
    const res  = await fetch('/kreativlogo1.png')
    const blob = await res.blob()
    return await new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  } catch (_) {
    return null
  }
}

// ── ref no formatter: KL/1-DDMMYY/P ─────────────────────────────────────────
function formatRefNo(refNo) {
  if (!refNo) return '—'
  if (/^KL\//.test(refNo)) return refNo
  return refNo
}

// ── PDF generator ─────────────────────────────────────────────────────────────
function generatePDFHTML(customer, items, quotation, logoBase64) {
  const totalBiaya = items.reduce((s, i) => s + ((i.jumlahUnit || 1) * (i.hargaPerUnit || 0)), 0)
  const ppn        = Math.round(totalBiaya * 0.11)
  const grand      = totalBiaya + ppn
  const today      = new Date()
  const dateStr    = today.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')
  const refNo      = formatRefNo(quotation?.refNo) || `KL/1-${dateStr.replace(/\./g, '')}/P`

  const rows = items.map((item, i) => `
    <tr>
      <td style="text-align:center">${i + 1}</td>
      <td>${item.nama || ''}</td>
      <td style="text-align:center">${item.jumlahUnit || 1}</td>
      <td style="text-align:center">${item.tipe || 'Service'}</td>
      <td style="text-align:right">Rp ${Number(item.hargaPerUnit || 0).toLocaleString('id-ID')}</td>
      <td style="text-align:right">Rp ${Number((item.jumlahUnit || 1) * (item.hargaPerUnit || 0)).toLocaleString('id-ID')}</td>
    </tr>
  `).join('')

  const logoHTML = logoBase64
    ? `<img src="${logoBase64}" style="height:48px; object-fit:contain; display:block; margin-left:auto;" />`
    : `<div style="font-size:18px;font-weight:700;color:#CC2020;">✕ KREATIV LIFT</div>`

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #000; padding: 30px 40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
  .logo-area { text-align:right; }
  .logo-sub { font-size:9px; color:#555; letter-spacing:2px; margin-top:4px; text-align:right; }
  .address-block { font-size:11px; line-height:1.8; }
  .ref-block { display:flex; justify-content:flex-end; margin-top:14px; margin-bottom:4px; }
  .ref-table { border-collapse:collapse; font-size:11px; }
  .ref-table th { font-weight:700; padding:2px 16px 2px 0; text-align:left; }
  .ref-table td { padding:2px 16px 2px 0; }
  .perihal { margin:18px 0 6px; }
  .perihal strong { text-decoration:underline; font-size:11px; }
  .intro { margin-bottom:14px; line-height:1.8; font-size:11px; }
  table.items { width:100%; border-collapse:collapse; margin-bottom:10px; }
  table.items th {
    background:#d0d0d0; border:1px solid #999; padding:6px;
    text-align:center; font-size:10px; font-weight:700;
  }
  table.items td { border:1px solid #ccc; padding:5px 6px; font-size:10px; }
  .total-table { margin-left:auto; border-collapse:collapse; font-size:11px; min-width:260px; }
  .total-table td { padding:3px 6px; }
  .total-table .lbl { text-align:right; font-weight:600; }
  .total-table .grand { font-weight:700; }
  .syarat { margin-top:16px; }
  .syarat h4 { font-size:11px; font-weight:700; margin-bottom:6px; }
  .syarat ol { padding-left:18px; line-height:1.9; font-size:11px; }
  .payment { margin-top:14px; }
  .payment h4 { font-size:11px; font-weight:700; margin-bottom:4px; }
  .payment table td { padding:2px 0; font-size:11px; min-width:160px; }
  .closing { margin-top:14px; line-height:1.8; font-size:11px; }
  .sign-row { margin-top:40px; display:flex; justify-content:space-between; align-items:flex-end; }
  .sign-block { font-size:11px; }
  .sign-block .sig-img { height:60px; display:block; margin:8px 0 2px; }
  .sign-block .name-line { font-weight:700; border-top:1px solid #000; padding-top:4px; display:inline-block; min-width:120px; font-size:11px; }
  .footer-block { text-align:right; font-size:9px; color:#555; border-top:1px solid #ccc; padding-top:8px; line-height:1.8; }
  .telp-line { margin-top:30px; display:flex; justify-content:space-between; font-size:9px; color:#555; border-top:1px solid #eee; padding-top:6px; }
  @media print { body { padding:15px 20px; } }
</style>
</head>
<body>

  <div class="header">
    <div class="address-block">
      Kepada Yth,<br/>
      <strong>${customer.customerName || ''}</strong><br/>
      ${customer.address || customer.kota || ''}
    </div>
    <div class="logo-area">
      ${logoHTML}
      <div class="logo-sub">Elevate With Us</div>
    </div>
  </div>

  <div style="font-size:11px; margin-bottom:10px;">U.P.</div>

  <div class="ref-block">
    <table class="ref-table">
      <tr>
        <th>No. Penawaran</th>
        <th>Tanggal</th>
      </tr>
      <tr>
        <td>${refNo}</td>
        <td>${dateStr}</td>
      </tr>
    </table>
  </div>

  <div class="perihal"><strong>Perihal: Penawaran Biaya Maintenance Per Kunjungan</strong></div>

  <div class="intro" style="margin-top:14px;">
    Dengan Hormat,<br/>
    Berikut kami sertakan &nbsp; rincian biaya untuk maitenance perkunjungan:
  </div>

  <table class="items">
    <thead>
      <tr>
        <th style="width:32px">No.</th>
        <th>Nama</th>
        <th style="width:64px">Jumlah Unit</th>
        <th style="width:72px">Tipe</th>
        <th style="width:140px">Harga per unit</th>
        <th style="width:140px">Biaya</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="border:none; width:55%;"></td>
      <td style="border:none; padding:0;">
        <table class="total-table">
          <tr>
            <td class="lbl">Total Biaya :</td>
            <td>Rp</td>
            <td style="text-align:right">${Number(totalBiaya).toLocaleString('id-ID')}</td>
          </tr>
          <tr>
            <td class="lbl">PPN 11%</td>
            <td>Rp</td>
            <td style="text-align:right">${Number(ppn).toLocaleString('id-ID')}</td>
          </tr>
          <tr class="grand">
            <td class="lbl">Jumlah Pembayaran :</td>
            <td>Rp</td>
            <td style="text-align:right">${Number(grand).toLocaleString('id-ID')}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <div class="syarat">
    <h4>Syarat dan Kondisi :</h4>
    <ol>
      <li>Harga sudah termasuk biaya akomodasi teknisi</li>
      <li>Pembayaran 100% dimuka</li>
      <li>Biaya Maintenance per sekali kunjungan</li>
      <li>Garansi berlaku 3 bulan sejak maintenance.<br/>
          Apabila terdapat oli rembes, tidak dikenakan biaya apa pun termasuk cleaning site.<br/>
          Garansi akan berlanjut 3 bulan lagi sejak tanggal cleaning (jika diperlukan).</li>
    </ol>
  </div>

  <div class="payment">
    <h4>Informasi Pembayaran</h4>
    <table>
      <tr><td>Bank</td><td>: BCA Cab Kelapa Gading</td></tr>
      <tr><td>No. Rekening (IDR)</td><td>: 8310203000</td></tr>
      <tr><td>Atas Nama</td><td>: PT. Inter Kreativ Lift Indonesia</td></tr>
    </table>
  </div>

  <div class="closing">
    Demikian penawaran harga dari kami, apabila ada yang kurang jelas mohon segera menghubungi kami.<br/>
    Atas perhatian dan kerja samanya kami ucapkan terima kasih.
  </div>

  <div class="sign-row">
    <div class="sign-block">
      Hormat kami,<br/><br/><br/><br/>
      <span class="name-line">Asha Aranda</span>
    </div>
    <div class="footer-block">
      PT. Inter Kreativ Lift Indonesia<br/>
      Ruko Commercial Kendington Blok C No. 10<br/>
      Kelapa Gading<br/>
      Jakarta Utara - Indonesia
    </div>
  </div>

  <div class="telp-line">
    <span>Telp. 021 - 2452 0983</span>
    <span>info@kreativlift.co.id</span>
  </div>

</body>
</html>`
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClientDetailPage() {
  const { id }       = useParams()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const initialTab   = searchParams.get('tab') || 'overview'

  const [activeTab, setActiveTab]   = useState(initialTab)
  const [customer, setCustomer]     = useState(null)
  const [loading, setLoading]       = useState(true)

  const [editing, setEditing]       = useState(false)
  const [editForm, setEditForm]     = useState({})
  const [comment, setComment]       = useState('')
  const [comments, setComments]     = useState([])

  const [cartItems, setCartItems]   = useState([])
  const [products, setProducts]     = useState([])
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [productSearch, setProductSearch]         = useState('')
  const [manualItem, setManualItem] = useState({ nama: '', jumlahUnit: 1, tipe: 'Service', hargaPerUnit: 0 })
  const [showManual, setShowManual] = useState(false)
  const [generatingPDF, setGenerating] = useState(false)

  const [quotations, setQuotations] = useState([])
  const [qLoading, setQLoading]     = useState(false)
  const [visits, setVisits]         = useState([])

  // ── Visit history editing state ──────────────────────────────────────────
  const [editingVisits, setEditingVisits] = useState(false)
  const [visitForm, setVisitForm]         = useState([])
  const [visitMeta, setVisitMeta]         = useState({ lastVisitDate: '', nextVisitDate: '' })
  const [savingVisits, setSavingVisits]   = useState(false)

  const fetchCustomer = useCallback(async () => {
    setLoading(true)
    const res  = await fetch(`/api/maintenance/${id}`)
    const json = await res.json()
    const c    = json.data || json
    setCustomer(c)
    setEditForm({
      customerName: c.customerName || '',
      phone:        c.phone        || '',
      address:      c.address      || '',
      kota:         c.kota         || '',
      unitType:     c.unitType     || '',
      serialNumber: c.serialNumber || '',
      status:       c.status       || 'New',
      notes:        c.notes        || '',
    })
    setComments(c.comments     || [])
    setVisits(c.visitHistory   || [])
    setLoading(false)
  }, [id])

  const fetchProducts = useCallback(async () => {
    const res  = await fetch('/api/products')
    const json = await res.json()
    setProducts(json.data || json.products || [])
  }, [])

  const fetchQuotations = useCallback(async () => {
    setQLoading(true)
    const res  = await fetch(`/api/quotations?customerId=${id}`)
    const json = await res.json()
    setQuotations(json.data || [])
    setQLoading(false)
  }, [id])

  useEffect(() => { fetchCustomer() }, [fetchCustomer])
  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { if (activeTab === 'quotations') fetchQuotations() }, [activeTab, fetchQuotations])

  async function saveEdit() {
    await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditing(false)
    fetchCustomer()
  }

  async function addComment() {
    if (!comment.trim()) return
    const updated = [...comments, { text: comment, date: new Date().toISOString() }]
    await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments: updated }),
    })
    setComments(updated)
    setComment('')
  }

  function addProductToCart(product) {
    const exists = cartItems.find(i => i.productId === product._id)
    if (exists) {
      setCartItems(cartItems.map(i => i.productId === product._id
        ? { ...i, jumlahUnit: i.jumlahUnit + 1, biaya: (i.jumlahUnit + 1) * i.hargaPerUnit }
        : i
      ))
    } else {
      setCartItems([...cartItems, {
        productId:    product._id,
        nama:         product.name,
        jumlahUnit:   1,
        tipe:         product.tipeItem || 'Other',
        hargaPerUnit: product.price    || 0,
        biaya:        product.price    || 0,
      }])
    }
    setShowProductPicker(false)
    setProductSearch('')
  }

  function addManualItem() {
    if (!manualItem.nama) return
    setCartItems([...cartItems, { ...manualItem, biaya: manualItem.jumlahUnit * manualItem.hargaPerUnit }])
    setManualItem({ nama: '', jumlahUnit: 1, tipe: 'Service', hargaPerUnit: 0 })
    setShowManual(false)
  }

  function updateCartItem(idx, field, value) {
    setCartItems(cartItems.map((item, i) => {
      if (i !== idx) return item
      const updated = { ...item, [field]: value }
      updated.biaya = updated.jumlahUnit * updated.hargaPerUnit
      return updated
    }))
  }

  function removeCartItem(idx) {
    setCartItems(cartItems.filter((_, i) => i !== idx))
  }

  const cartTotal = cartItems.reduce((s, i) => s + (i.jumlahUnit * i.hargaPerUnit), 0)
  const cartPPN   = Math.round(cartTotal * 0.11)
  const cartGrand = cartTotal + cartPPN

  async function generatePDF() {
    if (cartItems.length === 0) return alert('Cart is empty!')
    setGenerating(true)

    const logoBase64 = await fetchLogoBase64()

    const res = await fetch('/api/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId:    id,
        clientName:    customer.customerName,
        clientAddress: customer.address,
        clientPhone:   customer.phone,
        project:       customer.unitType || customer.kota,
        items:         cartItems.map((item, idx) => ({
          no:           idx + 1,
          nama:         item.nama,
          jumlahUnit:   item.jumlahUnit,
          tipe:         item.tipe,
          hargaPerUnit: item.hargaPerUnit,
          biaya:        item.jumlahUnit * item.hargaPerUnit,
        })),
      }),
    })
    const json = await res.json()
    const quot = json.data

    const html = generatePDFHTML(customer, cartItems, quot, logoBase64)
    const win  = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 600)

    setGenerating(false)
    setCartItems([])
    fetchQuotations()
  }

  async function reprintPDF(q) {
    const logoBase64 = await fetchLogoBase64()
    const html = generatePDFHTML(customer, q.items, q, logoBase64)
    const win  = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 600)
  }

  async function updateStatus(val) {
    await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: val }),
    })
    fetchCustomer()
  }

  // ── Visit history editing handlers ───────────────────────────────────────
  // FIX 1: seed table from lastVisitDate if visitHistory is empty
  function startEditVisits() {
    let initialForm = (visits || []).map(v => ({
      date:  toInputDate(v.date),
      notes: v.notes || '',
    }))

    // If table is empty but lastVisitDate exists, seed it as the first row
    if (initialForm.length === 0 && customer.lastVisitDate) {
      initialForm = [{ date: toInputDate(customer.lastVisitDate), notes: '' }]
    }

    setVisitForm(initialForm)
    setVisitMeta({
      lastVisitDate: toInputDate(customer.lastVisitDate),
      nextVisitDate: toInputDate(customer.nextVisitDate),
    })
    setEditingVisits(true)
  }

  function cancelEditVisits() {
    setEditingVisits(false)
  }

  function addVisitRow() {
    setVisitForm([...visitForm, { date: '', notes: '' }])
  }

  function updateVisitRow(idx, field, value) {
    setVisitForm(visitForm.map((v, i) => i === idx ? { ...v, [field]: value } : v))
  }

  function removeVisitRow(idx) {
    setVisitForm(visitForm.filter((_, i) => i !== idx))
  }

  // FIX 2: derive visitCount and lastVisitDate from table rows on save
  async function saveVisits() {
    setSavingVisits(true)
    const cleanedVisits = visitForm
      .filter(v => v.date)
      .map(v => ({ date: v.date, notes: v.notes || '' }))

    // Auto-derive lastVisitDate from the most recent row
    const sorted = [...cleanedVisits].sort((a, b) => new Date(b.date) - new Date(a.date))
    const derivedLastVisit = sorted[0]?.date || visitMeta.lastVisitDate || null

    const payload = {
      visitHistory:  cleanedVisits,
      visitCount:    cleanedVisits.length,            // always row count
      lastVisitDate: derivedLastVisit,                // always latest row date
      nextVisitDate: visitMeta.nextVisitDate || null, // still manual
    }

    await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSavingVisits(false)
    setEditingVisits(false)
    fetchCustomer()
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  if (loading) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontFamily: "'Sora', sans-serif" }}>
      Loading...
    </div>
  )

  if (!customer) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontFamily: "'Sora', sans-serif" }}>
      Customer not found.
    </div>
  )

  const TABS = ['overview', 'cart', 'visit history', 'quotations']

  return (
    <div style={{ padding: '2rem', background: '#fff', minHeight: '100vh', fontFamily: "'Sora', sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <button onClick={() => router.push('/maintenance')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#9ca3af', padding: 0 }}>
          ← Back
        </button>
        <span style={{ color: '#d1d5db' }}>|</span>
        <span style={{ fontSize: '0.72rem', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          CLIENT DETAIL
        </span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", color: '#111', margin: 0 }}>
            {customer.customerName}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginTop: '4px' }}>
            {customer.unitType && `${customer.unitType} · `}{customer.kota}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={customer.status} onChange={e => updateStatus(e.target.value)}
            style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: '7px',
              fontSize: '0.82rem', color: '#374151', background: '#fff', fontFamily: "'Sora', sans-serif", cursor: 'pointer' }}>
            <option>New</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button onClick={() => { setActiveTab('cart'); setShowManual(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', background: '#2a2a2a', color: '#fff',
              border: 'none', borderRadius: '7px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Sora', sans-serif" }}>
            📄 GENERATE QUOTE
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem', marginTop: '1rem' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 18px', border: 'none',
            borderBottom: activeTab === tab ? '2px solid #111' : '2px solid transparent',
            background: 'none', cursor: 'pointer', fontSize: '0.8rem',
            fontWeight: activeTab === tab ? 700 : 500,
            color: activeTab === tab ? '#111' : '#9ca3af',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            fontFamily: "'Sora', sans-serif", marginBottom: '-1px',
          }}>
            {tab === 'quotations'
              ? `QUOTATIONS${quotations.length > 0 ? ` (${quotations.length})` : ''}`
              : tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>

          {/* Client Information */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280' }}>
                CLIENT INFORMATION
              </span>
              {!editing ? (
                <button onClick={() => setEditing(true)} style={ghostBtn}>✏ EDIT</button>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={saveEdit} style={{ ...ghostBtn, color: '#16a34a', borderColor: '#bbf7d0' }}>Save</button>
                  <button onClick={() => setEditing(false)} style={ghostBtn}>Cancel</button>
                </div>
              )}
            </div>

            {[
              { label: 'NAME',   field: 'customerName' },
              { label: 'PHONE',  field: 'phone' },
              { label: 'EMAIL',  field: null },
              { label: 'KOTA',   field: 'kota' },
              { label: 'ADDRESS',field: 'address' },
              { label: 'UNIT',   field: 'unitType' },
              { label: 'SERIAL', field: 'serialNumber' },
            ].map(({ label, field }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em' }}>{label}</span>
                {editing && field ? (
                  <input value={editForm[field] || ''}
                    onChange={e => setEditForm({ ...editForm, [field]: e.target.value })}
                    style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', fontSize: '0.82rem', color: '#111', textAlign: 'right', width: '55%' }} />
                ) : (
                  <span style={{ fontSize: '0.85rem', color: field ? '#111' : '#9ca3af', fontWeight: field ? 500 : 400 }}>
                    {field ? (customer[field] || '—') : '—'}
                  </span>
                )}
              </div>
            ))}

            {[
              { label: 'BAST DATE',  value: fmt(customer.bastDate) },
              { label: 'LAST VISIT', value: fmt(customer.lastVisitDate) },
              { label: 'NEXT VISIT', value: fmt(customer.nextVisitDate) },
              { label: 'STATUS',     value: customer.status },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em' }}>{label}</span>
                <span style={{ fontSize: '0.85rem', color: '#111', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Comments */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', display: 'block', marginBottom: '12px' }}>
              COMMENTS
            </span>
            {comments.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: '0.82rem', fontStyle: 'italic', marginBottom: '12px' }}>No comments yet</p>
              : <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {comments.map((c, i) => (
                    <div key={i} style={{ background: '#f9fafb', borderRadius: '8px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '0.85rem', color: '#111', margin: 0 }}>{c.text}</p>
                      <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '4px 0 0' }}>{fmt(c.date)}</p>
                    </div>
                  ))}
                </div>
            }
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Add a comment..." rows={3}
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 12px',
                fontSize: '0.85rem', resize: 'vertical', fontFamily: "'Sora', sans-serif", boxSizing: 'border-box' }} />
            <button onClick={addComment}
              style={{ marginTop: '8px', padding: '8px 18px', background: '#111', color: '#fff',
                border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
              ADD COMMENT
            </button>
          </div>
        </div>
      )}

      {/* ── CART TAB ── */}
      {activeTab === 'cart' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => { setShowProductPicker(true); setShowManual(false) }} style={darkBtn}>
              + Add from Products
            </button>
            <button onClick={() => { setShowManual(true); setShowProductPicker(false) }} style={outlineBtn}>
              + Add Manually
            </button>
            {cartItems.length > 0 && (
              <button onClick={generatePDF} disabled={generatingPDF}
                style={{ ...darkBtn, background: '#CC2020', marginLeft: 'auto' }}>
                {generatingPDF ? 'Generating...' : '📄 Generate PDF'}
              </button>
            )}
          </div>

          {showProductPicker && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '16px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Select Product</span>
                <button onClick={() => setShowProductPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
              </div>
              <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
                placeholder="Search products..."
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '7px', padding: '8px 12px',
                  fontSize: '0.85rem', marginBottom: '10px', boxSizing: 'border-box' }} />
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredProducts.map(p => (
                  <div key={p._id} onClick={() => addProductToCart(p)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', borderRadius: '7px', cursor: 'pointer',
                      background: '#fff', border: '1px solid #e5e7eb' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#111' }}>{p.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '8px' }}>{p.tipeItem}</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>{fmtRp(p.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showManual && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px', marginBottom: '16px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Add Item Manually</span>
                <button onClick={() => setShowManual(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={labelStyle}>Nama</label>
                  <input value={manualItem.nama} onChange={e => setManualItem({ ...manualItem, nama: e.target.value })} style={inputStyle} placeholder="Item name" />
                </div>
                <div>
                  <label style={labelStyle}>Jumlah Unit</label>
                  <input type="number" min="1" value={manualItem.jumlahUnit}
                    onChange={e => setManualItem({ ...manualItem, jumlahUnit: parseInt(e.target.value) || 1 })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Tipe</label>
                  <select value={manualItem.tipe} onChange={e => setManualItem({ ...manualItem, tipe: e.target.value })} style={inputStyle}>
                    {['Service','Part','General','Consumable','Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Harga per Unit</label>
                  <input type="number" min="0" value={manualItem.hargaPerUnit}
                    onChange={e => setManualItem({ ...manualItem, hargaPerUnit: parseFloat(e.target.value) || 0 })} style={inputStyle} />
                </div>
              </div>
              <button onClick={addManualItem} style={darkBtn}>Add to Cart</button>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.9rem' }}>Cart is empty.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Add products from the buttons above.</p>
            </div>
          ) : (
            <>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['NO.','NAMA','JUMLAH UNIT','TIPE','HARGA PER UNIT','BIAYA',''].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#9ca3af',
                          fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < cartItems.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <input value={item.nama} onChange={e => updateCartItem(idx, 'nama', e.target.value)}
                            style={{ ...inputStyle, width: '100%', minWidth: '140px' }} />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input type="number" min="1" value={item.jumlahUnit}
                            onChange={e => updateCartItem(idx, 'jumlahUnit', parseInt(e.target.value) || 1)}
                            style={{ ...inputStyle, width: '70px' }} />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <select value={item.tipe} onChange={e => updateCartItem(idx, 'tipe', e.target.value)} style={inputStyle}>
                            {['Service','Part','General','Consumable','Other'].map(t => <option key={t}>{t}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input type="number" min="0" value={item.hargaPerUnit}
                            onChange={e => updateCartItem(idx, 'hargaPerUnit', parseFloat(e.target.value) || 0)}
                            style={{ ...inputStyle, width: '120px' }} />
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111' }}>
                          {fmtRp(item.jumlahUnit * item.hargaPerUnit)}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <button onClick={() => removeCartItem(idx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem' }}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px 24px', minWidth: '280px' }}>
                  {[
                    { label: 'Total Biaya', val: fmtRp(cartTotal) },
                    { label: 'PPN 11%',     val: fmtRp(cartPPN) },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                      borderBottom: '1px solid #f3f4f6', fontSize: '0.85rem', color: '#374151' }}>
                      <span>{label}</span><span>{val}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#111' }}>
                    <span>Jumlah Pembayaran</span><span>{fmtRp(cartGrand)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── VISIT HISTORY TAB ── */}
      {activeTab === 'visit history' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', gap: '8px' }}>
            {!editingVisits ? (
              <button onClick={startEditVisits} style={ghostBtn}>✏ EDIT</button>
            ) : (
              <>
                <button onClick={saveVisits} disabled={savingVisits}
                  style={{ ...ghostBtn, color: '#16a34a', borderColor: '#bbf7d0' }}>
                  {savingVisits ? 'Saving...' : 'Save'}
                </button>
                <button onClick={cancelEditVisits} style={ghostBtn}>Cancel</button>
              </>
            )}
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['#', 'DATE', 'NOTES', editingVisits ? '' : null].filter(h => h !== null).map(h => (
                    <th key={h || 'actions'} style={{ padding: '10px 16px', textAlign: 'left', color: '#9ca3af',
                      fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!editingVisits ? (
                  visits.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>No visit history yet.</td></tr>
                  ) : visits.map((v, i) => (
                    <tr key={i} style={{ borderBottom: i < visits.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{i + 1}</td>
                      <td style={{ padding: '12px 16px', color: '#111', fontWeight: 500 }}>{fmt(v.date)}</td>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>{v.notes || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    {visitForm.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No visits yet. Add one below.</td></tr>
                    ) : visitForm.map((v, i) => (
                      <tr key={i} style={{ borderBottom: i < visitForm.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <td style={{ padding: '10px 16px', color: '#9ca3af' }}>{i + 1}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <input type="date" value={v.date}
                            onChange={e => updateVisitRow(i, 'date', e.target.value)}
                            style={{ ...inputStyle, width: '160px' }} />
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <input value={v.notes} onChange={e => updateVisitRow(i, 'notes', e.target.value)}
                            placeholder="Notes" style={{ ...inputStyle, width: '100%', minWidth: '160px' }} />
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <button onClick={() => removeVisitRow(i)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem' }}>✕</button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4} style={{ padding: '10px 16px' }}>
                        <button onClick={addVisitRow} style={outlineBtn}>+ Add Visit</button>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary cards */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>

            {/* FIX 3: Total Visits — live count from table rows, not manual input */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', flex: 1 }}>
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Total Visits</p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>
                {editingVisits ? visitForm.filter(v => v.date).length : (customer.visitCount || 0)}
              </p>
            </div>

            {/* Last Visit — still editable manually, but overridden by latest row on save */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', flex: 1 }}>
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Last Visit</p>
              {!editingVisits ? (
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>{fmt(customer.lastVisitDate)}</p>
              ) : (
                <input type="date" value={visitMeta.lastVisitDate}
                  onChange={e => setVisitMeta({ ...visitMeta, lastVisitDate: e.target.value })}
                  style={{ ...inputStyle, fontWeight: 700 }} />
              )}
            </div>

            {/* Next Visit — fully manual */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', flex: 1 }}>
              <p style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Next Visit</p>
              {!editingVisits ? (
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>{fmt(customer.nextVisitDate)}</p>
              ) : (
                <input type="date" value={visitMeta.nextVisitDate}
                  onChange={e => setVisitMeta({ ...visitMeta, nextVisitDate: e.target.value })}
                  style={{ ...inputStyle, fontWeight: 700 }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── QUOTATIONS TAB ── */}
      {activeTab === 'quotations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
              {quotations.length} quotation{quotations.length !== 1 ? 's' : ''} generated for {customer.customerName}
            </p>
            <button onClick={() => setActiveTab('cart')} style={darkBtn}>+ New Quote</button>
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['REF NO.','DATE','ITEMS','AMOUNT','STATUS','ACTIONS'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#9ca3af',
                      fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {qLoading ? (
                  <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
                ) : quotations.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>No quotations yet. Generate one from the Cart tab.</td></tr>
                ) : quotations.map((q, i) => (
                  <tr key={q._id} style={{ borderBottom: i < quotations.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontFamily: 'monospace', fontSize: '0.8rem' }}>{q.refNo}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{fmt(q.quoteDate)}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{q.items?.length || 0} items</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111' }}>{fmtRp(q.grandTotal)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
                        background: q.status === 'Paid' ? '#f0fdf4' : q.status === 'Sent' ? '#eff6ff' : q.status === 'Cancelled' ? '#fef2f2' : '#f9fafb',
                        color: q.status === 'Paid' ? '#16a34a' : q.status === 'Sent' ? '#2563eb' : q.status === 'Cancelled' ? '#dc2626' : '#6b7280',
                        border: `1px solid ${q.status === 'Paid' ? '#bbf7d0' : q.status === 'Sent' ? '#bfdbfe' : q.status === 'Cancelled' ? '#fecaca' : '#e5e7eb'}`,
                      }}>
                        {q.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button title="Reprint PDF" onClick={() => reprintPDF(q)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1rem' }}>⬇</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const ghostBtn = {
  padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: '6px',
  background: '#fff', color: '#374151', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
}
const darkBtn = {
  padding: '8px 16px', background: '#111', color: '#fff',
  border: 'none', borderRadius: '7px', cursor: 'pointer',
  fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Sora', sans-serif",
}
const outlineBtn = {
  ...darkBtn, background: '#fff', color: '#111', border: '1px solid #d1d5db',
}
const labelStyle = {
  display: 'block', fontSize: '0.72rem', color: '#6b7280',
  fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em',
}
const inputStyle = {
  border: '1px solid #e5e7eb', borderRadius: '6px', padding: '7px 10px',
  fontSize: '0.83rem', color: '#111', width: '100%', boxSizing: 'border-box',
  fontFamily: "'Sora', sans-serif",
}