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
function toInputDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  return dt.toISOString().slice(0, 10)
}

async function fetchLogoBase64() {
  try {
    const res  = await fetch('/kreativlogo1.png')
    const blob = await res.blob()
    return await new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  } catch (_) { return null }
}

function formatRefNo(refNo) {
  if (!refNo) return '—'
  return refNo
}

// ── PDF generator ──────────────────────────────────────────────────────────────
function generatePDFHTML(customer, items, quotation, logoBase64) {
  const totalBiaya = items.reduce((s, i) => s + ((i.jumlahUnit || 1) * (i.hargaPerUnit || 0)), 0)
  const ppn        = Math.round(totalBiaya * 0.11)
  const grand      = totalBiaya + ppn
  const today      = new Date()
  const dd   = String(today.getDate()).padStart(2, '0')
  const mm   = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()
  const dateStr = `${dd}.${mm}.${yyyy}`
  const refNo = formatRefNo(quotation?.refNo) || '—'

  const rows = items.map((item, i) => `
    <tr>
      <td style="text-align:center;padding:11px 8px;border-bottom:1px solid #e8e8e8;color:#000;">${i + 1}</td>
      <td style="padding:11px 8px;border-bottom:1px solid #e8e8e8;font-weight:700;color:#000;">${item.nama || ''}</td>
      <td style="text-align:center;padding:11px 8px;border-bottom:1px solid #e8e8e8;color:#000;">${item.jumlahUnit || 1}</td>
      <td style="text-align:center;padding:11px 8px;border-bottom:1px solid #e8e8e8;color:#000;">${item.tipe || 'Service'}</td>
      <td style="padding:11px 8px;border-bottom:1px solid #e8e8e8;">
        <table style="width:100%;border-collapse:collapse;"><tr>
          <td style="width:22px;color:#000;">Rp</td>
          <td style="text-align:right;color:#000;">${Number(item.hargaPerUnit || 0).toLocaleString('id-ID')}</td>
        </tr></table>
      </td>
      <td style="padding:11px 8px;border-bottom:1px solid #e8e8e8;">
        <table style="width:100%;border-collapse:collapse;"><tr>
          <td style="width:22px;color:#000;">Rp</td>
          <td style="text-align:right;color:#000;">${Number((item.jumlahUnit || 1) * (item.hargaPerUnit || 0)).toLocaleString('id-ID')}</td>
        </tr></table>
      </td>
    </tr>
  `).join('')

  const logoHTML = logoBase64
    ? `<img src="${logoBase64}" style="height:130px;object-fit:contain;display:block;" />`
    : `<div style="display:flex;align-items:center;gap:8px;">
        <span style="color:#cc2020;font-size:28px;font-weight:900;line-height:1;">✕</span>
        <div>
          <div style="font-size:15px;font-weight:900;letter-spacing:0.5px;color:#000;">KREATIV <span style="color:#cc2020;">LIFT</span></div>
          <div style="font-size:8.5px;color:#888;letter-spacing:2px;">Elevate With Us</div>
        </div>
      </div>`

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;color:#000;}
  body{font-family:Arial,sans-serif;font-size:11.5px;color:#000;padding:36px 44px;background:#fff;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;}
  .to-block{font-size:12px;line-height:1.8;}
  .up-line{font-size:12px;margin-bottom:16px;margin-top:-10px;}
  .ref-outer{display:flex;justify-content:flex-end;margin-bottom:16px;}
  .ref-table{border-collapse:collapse;font-size:12px;}
  .ref-table th{font-weight:700;padding:2px 40px 4px 0;text-align:left;}
  .ref-table td{padding:2px 40px 2px 0;}
  .perihal{font-size:12px;font-weight:700;text-decoration:underline;margin-bottom:12px;}
  .intro{font-size:12px;line-height:1.8;margin-bottom:14px;}
  table.items{width:100%;border-collapse:collapse;border:1px solid #bbb;}
  table.items th{background:#d8d8d8;border-bottom:1px solid #bbb;padding:9px 8px;text-align:center;font-size:11px;font-weight:700;color:#000;}
  table.items tbody tr:last-child td{border-bottom:none;}
  .syarat{margin-top:18px;font-size:11.5px;}
  .syarat h4{font-weight:700;font-size:11.5px;margin-bottom:6px;text-decoration:underline;}
  .syarat ol{list-style:none;padding:0;margin:0;}
  .syarat li{display:flex;gap:6px;padding:1px 0;line-height:1.85;}
  .syarat li .num{min-width:20px;}
  .closing{margin-top:14px;font-size:12px;line-height:1.9;}
  .sign-row{margin-top:32px;display:flex;justify-content:space-between;align-items:flex-end;}
  .sign-left{font-size:12px;line-height:1.8;}
  .sign-name{display:inline-block;font-weight:700;font-size:12px;border-top:1.5px solid #000;padding-top:4px;min-width:110px;margin-top:2px;}
  .sign-right{text-align:right;font-size:11px;color:#333;line-height:1.9;}
  .footer-line{margin-top:24px;display:flex;justify-content:space-between;font-size:9.5px;color:#666;border-top:1px solid #ddd;padding-top:6px;}
  @media print{body{padding:18px 24px;}}
</style>
</head>
<body>
  <div class="header">
    <div class="to-block">Kepada Yth,<br/><strong>${customer.customerName || ''}</strong><br/>${customer.address || customer.kota || ''}</div>
    <div>${logoHTML}</div>
  </div>
  <div class="up-line">U.P.</div>
  <div class="ref-outer">
    <table class="ref-table">
      <thead><tr><th>No. Penawaran</th><th>Tanggal</th></tr></thead>
      <tbody><tr><td>${refNo}</td><td>${dateStr}</td></tr></tbody>
    </table>
  </div>
  <div class="perihal">Perihal: Penawaran Biaya Maintenance Per Kunjungan</div>
  <div class="intro">Dengan Hormat,<br/>Berikut kami sertakan &nbsp; rincian biaya untuk maitenance perkunjungan:</div>
  <table class="items">
    <thead>
      <tr>
        <th style="width:38px;">No.</th>
        <th style="text-align:left;">Nama</th>
        <th style="width:65px;">Jumlah<br/>Unit</th>
        <th style="width:75px;">Tipe</th>
        <th style="width:155px;">Harga per unit</th>
        <th style="width:155px;">Biaya</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <table style="width:100%;border-collapse:collapse;margin-top:0;font-size:12px;">
    <tr>
      <td style="border:none;width:52%;"></td>
      <td style="border:none;padding:0;vertical-align:top;">
        <table style="width:100%;border-collapse:collapse;font-size:11.5px;">
          <tr>
            <td style="text-align:right;padding:4px 8px;white-space:nowrap;font-weight:600;color:#000;">Total Biaya :</td>
            <td style="width:22px;padding:4px 4px;color:#000;">Rp</td>
            <td style="text-align:right;padding:4px 8px;min-width:100px;color:#000;">${Number(totalBiaya).toLocaleString('id-ID')}</td>
          </tr>
          <tr>
            <td style="text-align:right;padding:4px 8px;font-weight:600;white-space:nowrap;color:#000;">PPN 11%</td>
            <td style="width:22px;padding:4px 4px;color:#000;">Rp</td>
            <td style="text-align:right;padding:4px 8px;color:#000;">${Number(ppn).toLocaleString('id-ID')}</td>
          </tr>
          <tr style="border-top:1.5px solid #000;">
            <td style="text-align:right;padding:5px 8px 6px;font-weight:700;white-space:nowrap;color:#000;">Jumlah Pembayaran :</td>
            <td style="width:22px;padding:5px 4px 6px;font-weight:700;color:#000;">Rp</td>
            <td style="text-align:right;padding:5px 8px 6px;font-weight:700;color:#000;">${Number(grand).toLocaleString('id-ID')}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  <div class="syarat">
    <h4>Syarat dan Kondisi :</h4>
    <ol>
      <li><span class="num">1 .</span><span>Harga sudah termasuk biaya akomodasi teknisi</span></li>
      <li><span class="num">2 .</span><span>Pembayaran 100% dimuka</span></li>
      <li><span class="num">3 .</span><span>Biaya Maintenance per sekali kunjungan</span></li>
      <li><span class="num">4 .</span><span>Garansi berlaku 3 bulan sejak maintenance.<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Apabila terdapat oli rembes, tidak dikenakan biaya apa pun termasuk cleaning site.<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Garansi akan berlanjut 3 bulan lagi sejak tanggal cleaning (jika diperlukan).</span></li>
    </ol>
    <div style="margin-top:12px;">
      <div style="font-weight:700;font-size:11.5px;margin-bottom:5px;">Informasi Pembayaran</div>
      <table style="border-collapse:collapse;">
        <tr><td style="padding:2px 0;min-width:140px;font-size:11.5px;">Bank</td><td style="padding:2px 0;font-size:11.5px;">: BCA Cab Kelapa Gading</td></tr>
        <tr><td style="padding:2px 0;font-size:11.5px;">No. Rekening (IDR)</td><td style="padding:2px 0;font-size:11.5px;">: 8310203000</td></tr>
        <tr><td style="padding:2px 0;font-size:11.5px;">Atas Nama</td><td style="padding:2px 0;font-size:11.5px;">: PT. Inter Kreativ Lift Indonesia</td></tr>
      </table>
    </div>
  </div>
  <div class="closing">Demikian penawaran harga dari kami, apabila ada yang kurang jelas mohon segera menghubungi kami.<br/>Atas perhatian dan kerja samanya kami ucapkan terima kasih.</div>
  <div class="sign-row">
    <div class="sign-left">Hormat kami,<br/><br/><br/><br/><br/><span class="sign-name">Asha Aranda</span></div>
    <div class="sign-right">PT. Inter Kreativ Lift Indonesia<br/>Ruko Commercial Kendington Blok C No. 10<br/>Kelapa Gading<br/>Jakarta Utara - Indonesia</div>
  </div>
  <div class="footer-line"><span>Telp. 021 - 2452 0983</span><span>info@kreativlift.co.id</span></div>
</body></html>`
}

// ── Catalog Product Picker Modal ──────────────────────────────────────────────
function ProductCatalogModal({ products, onDone, onClose, initialSelected = [] }) {
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(() => {
    // map: productId -> { ...product, jumlahUnit }
    const map = {}
    initialSelected.forEach(item => {
      if (item.productId) map[item.productId] = { ...item }
    })
    return map
  })

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.tipeItem || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  // Group by category
  const grouped = filtered.reduce((acc, p) => {
    const cat = p.category || p.tipeItem || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  const totalSelected = Object.values(selected).reduce((s, v) => s + (v.jumlahUnit || 1), 0)

  function toggle(product) {
    setSelected(prev => {
      const next = { ...prev }
      if (next[product._id]) {
        delete next[product._id]
      } else {
        next[product._id] = {
          productId:    product._id,
          nama:         product.name,
          jumlahUnit:   1,
          tipe:         product.tipeItem || 'Other',
          hargaPerUnit: product.price || 0,
          biaya:        product.price || 0,
        }
      }
      return next
    })
  }

  function setQty(productId, qty) {
    if (qty < 1) return
    setSelected(prev => ({
      ...prev,
      [productId]: { ...prev[productId], jumlahUnit: qty, biaya: qty * (prev[productId].hargaPerUnit || 0) }
    }))
  }

  function handleDone() {
    onDone(Object.values(selected))
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: '#faf9f7', display: 'flex', flexDirection: 'column',
      fontFamily: "'Sora', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 32px 16px',
        borderBottom: '1px solid #e8e5df',
        background: '#faf9f7',
      }}>
        <div>
          <p style={{ fontSize: '0.68rem', color: '#a89f91', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 4px' }}>
            PRODUCT CATALOG
          </p>
          <h2 style={{ fontSize: '1.8rem', fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: '#1a1714', margin: 0 }}>
            Select Product
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handleDone} style={{
            padding: '9px 22px', background: '#5a5145', color: '#fff',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em',
            fontFamily: "'Sora', sans-serif",
          }}>
            DONE ({totalSelected})
          </button>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#a89f91', fontSize: '1.3rem', lineHeight: 1,
            padding: '4px',
          }}>✕</button>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '14px 32px', background: '#faf9f7', borderBottom: '1px solid #e8e5df' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{
            width: '100%', border: '1px solid #ddd9d1', borderRadius: '6px',
            padding: '10px 14px', fontSize: '0.88rem', background: '#fff',
            color: '#1a1714', fontFamily: "'Sora', sans-serif", boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>

      {/* Product list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 32px' }}>
        {Object.keys(grouped).length === 0 ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#a89f91', fontSize: '0.9rem' }}>No products found.</p>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              {/* Category header */}
              <div style={{
                padding: '16px 0 10px',
                borderBottom: '1px solid #e8e5df',
                fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em',
                color: '#a89f91', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <span style={{ color: '#c4b89a' }}>A</span>
                <span>·</span>
                <span>{category.toUpperCase()}</span>
              </div>

              {items.map(product => {
                const isSelected = !!selected[product._id]
                const qty = selected[product._id]?.jumlahUnit || 1

                return (
                  <div key={product._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 0',
                    borderBottom: '1px solid #f0ede7',
                    cursor: 'pointer',
                    background: isSelected ? '#f5f2ec' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                    onClick={() => !isSelected && toggle(product)}
                  >
                    <div style={{ flex: 1, paddingRight: '24px' }}>
                      <p style={{
                        margin: 0, fontSize: '0.9rem', fontWeight: 600,
                        color: isSelected ? '#5a5145' : '#1a1714',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1rem',
                      }}>{product.name}</p>
                      {product.description && (
                        <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#a89f91', lineHeight: 1.5 }}>
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '0.82rem', color: '#6b6357', minWidth: '90px', textAlign: 'right' }}>
                        {fmtRp(product.price)}
                      </span>

                      {isSelected ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => qty <= 1 ? toggle(product) : setQty(product._id, qty - 1)} style={{
                            width: '28px', height: '28px', border: '1px solid #c4b89a',
                            background: '#fff', borderRadius: '4px 0 0 4px',
                            cursor: 'pointer', fontSize: '0.9rem', color: '#5a5145',
                          }}>−</button>
                          <span style={{
                            width: '36px', height: '28px', border: '1px solid #c4b89a',
                            borderLeft: 'none', borderRight: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.82rem', fontWeight: 700, color: '#1a1714', background: '#fff',
                          }}>{qty}</span>
                          <button onClick={() => setQty(product._id, qty + 1)} style={{
                            width: '28px', height: '28px', border: '1px solid #c4b89a',
                            background: '#fff', borderRadius: '0 4px 4px 0',
                            cursor: 'pointer', fontSize: '0.9rem', color: '#5a5145',
                          }}>+</button>
                        </div>
                      ) : (
                        <span style={{
                          fontSize: '0.72rem', color: '#a89f91', minWidth: '60px', textAlign: 'right',
                          letterSpacing: '0.06em',
                        }}>NO ·</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>
    </div>
  )
}


// ── Main Component ─────────────────────────────────────────────────────────────
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

  // ── Persistent cart state ────────────────────────────────────────────────
  const [cartItems, setCartItems]   = useState([])
  const [cartSaved, setCartSaved]   = useState(true)   // true = no unsaved changes
  const [cartSaving, setCartSaving] = useState(false)

  const [products, setProducts]     = useState([])
  const [showCatalog, setShowCatalog] = useState(false)
  const [manualItem, setManualItem] = useState({ nama: '', jumlahUnit: 1, tipe: 'Service', hargaPerUnit: 0 })
  const [showManual, setShowManual] = useState(false)
  const [generatingPDF, setGenerating] = useState(false)

  const [quotations, setQuotations] = useState([])
  const [qLoading, setQLoading]     = useState(false)
  const [visits, setVisits]         = useState([])

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
    // ── Load persisted cart from customer record ──
    if (c.draftCart && c.draftCart.length > 0) {
      setCartItems(c.draftCart)
    }
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

  // ── Mark cart dirty whenever items change ────────────────────────────────
  function markCartDirty(newItems) {
    setCartItems(newItems)
    setCartSaved(false)
  }

  // ── Save cart to MongoDB ──────────────────────────────────────────────────
  async function saveCart() {
    setCartSaving(true)
    await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftCart: cartItems }),
    })
    setCartSaved(true)
    setCartSaving(false)
  }

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

  // ── Catalog done → merge into cart ───────────────────────────────────────
  function handleCatalogDone(selectedProducts) {
    // Merge: keep manually added items, replace product-sourced items
    const manualItems = cartItems.filter(i => !i.productId)
    const merged = [...manualItems, ...selectedProducts]
    markCartDirty(merged)
    setShowCatalog(false)
  }

  function addManualItem() {
    if (!manualItem.nama) return
    markCartDirty([...cartItems, { ...manualItem, biaya: manualItem.jumlahUnit * manualItem.hargaPerUnit }])
    setManualItem({ nama: '', jumlahUnit: 1, tipe: 'Service', hargaPerUnit: 0 })
    setShowManual(false)
  }

  function updateCartItem(idx, field, value) {
    const updated = cartItems.map((item, i) => {
      if (i !== idx) return item
      const u = { ...item, [field]: value }
      u.biaya = u.jumlahUnit * u.hargaPerUnit
      return u
    })
    markCartDirty(updated)
  }

  function removeCartItem(idx) {
    markCartDirty(cartItems.filter((_, i) => i !== idx))
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
    const quot = json.data || {}

    const html = generatePDFHTML(customer, cartItems, quot, logoBase64)
    const win  = window.open('', '_blank')

    if (!win) {
      setGenerating(false)
      alert('Popup was blocked. Please allow popups for this site and try again.')
      return
    }

    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 600)

    // Clear cart from DB after generating
    await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ draftCart: [] }),
    })

    setGenerating(false)
    setCartItems([])
    setCartSaved(true)
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

  // ── Visit history ──────────────────────────────────────────────────────────
  function startEditVisits() {
    let initialForm = (visits || []).map(v => ({
      date:  toInputDate(v.date),
      notes: v.notes || '',
    }))
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

  function cancelEditVisits() { setEditingVisits(false) }
  function addVisitRow() { setVisitForm([...visitForm, { date: '', notes: '' }]) }
  function updateVisitRow(idx, field, value) {
    setVisitForm(visitForm.map((v, i) => i === idx ? { ...v, [field]: value } : v))
  }
  function removeVisitRow(idx) { setVisitForm(visitForm.filter((_, i) => i !== idx)) }

  async function saveVisits() {
    setSavingVisits(true)
    const cleanedVisits = visitForm.filter(v => v.date).map(v => ({ date: v.date, notes: v.notes || '' }))
    const sorted = [...cleanedVisits].sort((a, b) => new Date(b.date) - new Date(a.date))
    const derivedLastVisit = sorted[0]?.date || visitMeta.lastVisitDate || null

    await fetch(`/api/maintenance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitHistory:  cleanedVisits,
        visitCount:    cleanedVisits.length,
        lastVisitDate: derivedLastVisit,
        nextVisitDate: visitMeta.nextVisitDate || null,
      }),
    })
    setSavingVisits(false)
    setEditingVisits(false)
    fetchCustomer()
  }

  // ── Quotation status update ────────────────────────────────────────────────
  async function updateQuotationStatus(quotId, status) {
    await fetch(`/api/quotations/${quotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchQuotations()
  }

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
    <>
      {/* Catalog Modal */}
      {showCatalog && (
        <ProductCatalogModal
          products={products}
          initialSelected={cartItems.filter(i => i.productId)}
          onDone={handleCatalogDone}
          onClose={() => setShowCatalog(false)}
        />
      )}

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
                : tab === 'cart'
                  ? `CART${cartItems.length > 0 ? ` (${cartItems.length})` : ''}`
                  : tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
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
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={() => { setShowCatalog(true); setShowManual(false) }} style={darkBtn}>
                + Add from Products
              </button>
              <button onClick={() => { setShowManual(true) }} style={outlineBtn}>
                + Add Manually
              </button>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Save Cart button */}
                {cartItems.length > 0 && (
                  <button
                    onClick={saveCart}
                    disabled={cartSaved || cartSaving}
                    style={{
                      padding: '8px 16px',
                      background: cartSaved ? '#f3f4f6' : '#fff',
                      color: cartSaved ? '#9ca3af' : '#111',
                      border: `1px solid ${cartSaved ? '#e5e7eb' : '#111'}`,
                      borderRadius: '7px', cursor: cartSaved ? 'default' : 'pointer',
                      fontSize: '0.82rem', fontWeight: 600, fontFamily: "'Sora', sans-serif",
                    }}>
                    {cartSaving ? 'Saving...' : cartSaved ? '✓ Saved' : '💾 Save Cart'}
                  </button>
                )}
                {cartItems.length > 0 && (
                  <button onClick={generatePDF} disabled={generatingPDF}
                    style={{ ...darkBtn, background: '#CC2020' }}>
                    {generatingPDF ? 'Generating...' : '📄 Generate PDF'}
                  </button>
                )}
              </div>
            </div>

            {/* Unsaved notice */}
            {!cartSaved && cartItems.length > 0 && (
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px',
                padding: '10px 14px', marginBottom: '14px', fontSize: '0.82rem', color: '#92400e',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                ⚠ You have unsaved changes. Click <strong>Save Cart</strong> to keep them when switching tabs.
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

            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', flex: 1 }}>
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Total Visits</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>
                  {editingVisits ? visitForm.filter(v => v.date).length : (customer.visitCount || 0)}
                </p>
              </div>
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
                    {['REF NO.','CLIENT','PROJECT','DATE','STATUS','AMOUNT','ACTIONS'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#9ca3af',
                        fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {qLoading ? (
                    <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
                  ) : quotations.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>No quotations yet.</td></tr>
                  ) : quotations.map((q, i) => (
                    <tr key={q._id} style={{ borderBottom: i < quotations.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      {/* REF NO — styled like Image 3: amber/gold monospace */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: '0.8rem',
                          color: '#b45309', fontWeight: 600,
                        }}>{q.refNo}</span>
                      </td>
                      {/* CLIENT */}
                      <td style={{ padding: '12px 16px', color: '#111', fontWeight: 500 }}>
                        {q.clientName || customer.customerName}
                      </td>
                      {/* PROJECT */}
                      <td style={{ padding: '12px 16px', color: '#374151' }}>
                        {q.project || customer.unitType || '—'}
                      </td>
                      {/* DATE */}
                      <td style={{ padding: '12px 16px', color: '#374151' }}>{fmt(q.quoteDate)}</td>
                      {/* STATUS — inline dropdown */}
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          value={q.status || 'Draft'}
                          onChange={e => updateQuotationStatus(q._id, e.target.value)}
                          style={{
                            padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem',
                            fontWeight: 600, border: '1px solid',
                            fontFamily: "'Sora', sans-serif", cursor: 'pointer',
                            background: q.status === 'Paid' ? '#f0fdf4' : q.status === 'Sent' ? '#eff6ff' : q.status === 'Cancelled' ? '#fef2f2' : '#f9fafb',
                            color: q.status === 'Paid' ? '#16a34a' : q.status === 'Sent' ? '#2563eb' : q.status === 'Cancelled' ? '#dc2626' : '#6b7280',
                            borderColor: q.status === 'Paid' ? '#bbf7d0' : q.status === 'Sent' ? '#bfdbfe' : q.status === 'Cancelled' ? '#fecaca' : '#e5e7eb',
                          }}>
                          {['Draft','Sent','Paid','Cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      {/* AMOUNT — styled like Image 3 */}
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#111', fontSize: '0.88rem' }}>
                        {fmtRp(q.grandTotal)}
                      </td>
                      {/* ACTIONS */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button title="Reprint PDF" onClick={() => reprintPDF(q)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1rem' }}>⬇</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
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