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
function formatThousands(n) {
  if (n === '' || n === null || n === undefined) return ''
  return Number(n).toLocaleString('id-ID')
}
function parseThousands(str) {
  const digits = str.replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
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
function generateInvoiceHTML(invoiceData, logoBase64) {
  const {
    invoiceNo, refNo, invoiceDate, clientName, clientAddress,
    projectLocation, paymentTerms, items, subTotal, ppnPercent, ppnAmount, totalAmount, status,
  } = invoiceData

  const dateStr = invoiceDate
    ? new Date(invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')
    : ''

  const termsRows = (paymentTerms || []).map(t => `
    <tr style="${t.active ? 'background:#fdf0c8;' : ''}">
      <td style="padding:2px 8px 2px 0;font-size:10px;color:#000;white-space:nowrap;">${t.percent}%</td>
      <td style="padding:2px 0;font-size:10px;font-style:italic;color:#000;white-space:nowrap;">${t.label}</td>
    </tr>
  `).join('')

  const itemRows = (items || []).map(item => `
    <tr>
      <td style="padding:10px 6px;font-size:10.5px;color:#000;vertical-align:top;border-bottom:1px solid #f0f0f0;">
        ${item.specification}
        ${item.serialNo || item.stops ? `<div style="font-size:9.5px;margin-top:2px;color:#444;"><span style="font-weight:600;">${item.serialNo || ''}</span>&nbsp;&nbsp;${item.stops || ''}</div>` : ''}
      </td>
      <td style="padding:10px 6px;font-size:10.5px;color:#000;text-align:center;vertical-align:top;border-bottom:1px solid #f0f0f0;">${item.termPercent}%</td>
      <td style="padding:10px 6px;font-size:10.5px;color:#000;text-align:right;vertical-align:top;border-bottom:1px solid #f0f0f0;">${Number(item.unitPrice).toLocaleString('id-ID')}</td>
      <td style="padding:10px 6px;font-size:10.5px;color:#000;text-align:left;vertical-align:top;width:20px;border-bottom:1px solid #f0f0f0;">Rp</td>
      <td style="padding:10px 6px;font-size:10.5px;color:#000;text-align:right;vertical-align:top;border-bottom:1px solid #f0f0f0;">${Number(item.amount).toLocaleString('id-ID')}</td>
    </tr>
  `).join('')

  const logoHTML = logoBase64
    ? `<img src="${logoBase64}" style="height:130px;object-fit:contain;display:block;" />`
    : `<div style="display:flex;align-items:center;gap:6px;">
        <span style="color:#cc2020;font-size:20px;font-weight:900;line-height:1;">✕</span>
        <div>
          <div style="font-size:12px;font-weight:900;color:#000;">KREATIV <span style="color:#cc2020;">LIFT</span></div>
          <div style="font-size:6.5px;color:#888;letter-spacing:2px;">Elevate With Us</div>
        </div>
      </div>`

  const paidStamp = status === 'Paid'
    ? `<div style="position:absolute;top:108px;left:50%;transform:translateX(-50%);font-size:30px;font-weight:900;color:#3b6dc9;border:4px solid #3b6dc9;border-radius:6px;padding:0 20px;letter-spacing:4px;opacity:0.8;">PAID</div>`
    : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;color:#000;}
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;padding:30px 40px;background:#fff;position:relative;}
  .top-row{display:flex;justify-content:space-between;align-items:flex-start;}
  .invoice-title{font-size:12px;font-weight:700;text-align:right;letter-spacing:0.5px;}
  .invoice-meta-table{margin-left:auto;border-collapse:collapse;margin-top:6px;}
  .invoice-meta-table td{font-size:9px;padding:0 0 2px 30px;vertical-align:top;}
  .invoice-meta-table .lbl{color:#999;}
  .invoice-meta-table .val{color:#000;font-weight:400;}
  .cust-block{font-size:10px;line-height:1.55;margin-top:6px;}
  .cust-block .lbl{font-size:9px;color:#999;}
  .ref-block{text-align:right;font-size:9px;color:#999;line-height:1.5;}
  table.terms{border-collapse:collapse;}
  table.terms th{font-size:9px;color:#999;font-weight:400;padding-bottom:3px;text-align:left;}
  table.items{width:100%;border-collapse:collapse;margin-top:14px;}
  table.items th{font-size:9.5px;color:#999;font-weight:600;text-align:left;padding:0 6px 8px;border-bottom:2px solid #cc2020;text-transform:uppercase;letter-spacing:0.04em;}
  table.items tbody tr:first-child td{border-top:2px solid #cc2020;}
  table.items tbody tr:last-child td{border-bottom:none !important;}
  .totals{margin-left:auto;width:240px;margin-top:4px;border-top:1.5px solid #cc2020;padding-top:4px;}
  .totals tr td{padding:3px 4px;font-size:10px;}
  .totals .label{color:#000;}
  .totals .grand{border-top:2px solid #cc2020;font-weight:700;font-size:10.5px;}
  .pay-info{margin-top:30px;font-size:9px;line-height:1.7;}
  .pay-info .lbl{color:#999;display:inline-block;width:155px;}
  .sign-block{margin-top:6px;text-align:right;}
  .sign-block .company{font-size:9.5px;font-weight:700;}
  .sign-block .stamp-area{height:70px;}
  .sign-block .name{font-size:9.5px;font-weight:700;text-decoration:underline;}
  .sign-block .role{font-size:8.5px;color:#666;}
  .footer{margin-top:24px;border-top:2px solid #cc2020;padding-top:8px;}
  .footer-content{display:flex;justify-content:space-between;font-size:8.5px;}
  .footer-content .co-name{color:#cc2020;font-weight:700;margin-bottom:2px;}
  .footer-content .addr-block{line-height:1.6;color:#000;}
  .footer-content .contact-block{line-height:1.6;color:#000;text-align:right;}
  .footer-bottom{border-top:2px solid #cc2020;margin-top:8px;padding-top:6px;text-align:center;font-size:7.5px;color:#000;line-height:1.6;}
  @media print{body{padding:18px 26px;}}
</style>
</head>
<body>
  ${paidStamp}
  <div class="top-row">
    <div>
      ${logoHTML}
      <div class="cust-block">
        <div class="lbl">Customer</div>
        <div style="font-weight:700;">${clientName || ''}</div>
        <div>${(clientAddress || '').replace(/\n/g, '<br/>')}</div>
      </div>
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <table class="invoice-meta-table">
        <tr><td class="lbl">INVOICE</td><td class="lbl" style="padding-left:50px;">Date</td></tr>
        <tr><td class="val">${invoiceNo || ''}</td><td class="val" style="padding-left:50px;">${dateStr}</td></tr>
      </table>
      <div class="ref-block" style="margin-top:10px;">
        Reference :<br/>${refNo || ''}
      </div>
    </div>
  </div>

  <div style="display:flex;justify-content:space-between;margin-top:16px;">
    <div style="font-size:10px;">
      <div class="lbl" style="font-size:9px;color:#999;">Project Location</div>
      <div style="line-height:1.5;margin-top:2px;">${(projectLocation || '').replace(/\n/g, '<br/>')}</div>
    </div>
    <table class="terms">
      <thead><tr><th colspan="2" style="text-align:right;padding-right:0;">Payment Terms</th></tr></thead>
      <tbody>${termsRows}</tbody>
    </table>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Specification</th>
        <th style="text-align:center;">Term</th>
        <th colspan="3" style="text-align:right;">Unit Price&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <table class="totals">
    <tr><td class="label">Sub Total</td><td style="text-align:left;width:20px;">Rp</td><td style="text-align:right;">${Number(subTotal).toLocaleString('id-ID')}</td></tr>
    <tr><td class="label">PPN ${ppnPercent}%</td><td style="text-align:left;"></td><td style="text-align:right;">${Number(ppnAmount).toLocaleString('id-ID')}</td></tr>
    <tr class="grand"><td>TOTAL AMOUNT</td><td style="text-align:left;">Rp</td><td style="text-align:right;">${Number(totalAmount).toLocaleString('id-ID')}</td></tr>
  </table>

  <div class="pay-info">
    <div><span class="lbl">PAYMENT INFORMATION</span></div>
    <div><span class="lbl">Beneficial Bank</span>BCA Cab Kelapa Gading</div>
    <div><span class="lbl">Beneficial Account Number</span>831-0203-000</div>
    <div><span class="lbl">Beneficial Account Name</span>PT. Inter Kreativ Lift Indonesia</div>
    <div><span class="lbl">Beneficial Bank Swift</span>CENAIDJA</div>
  </div>

  <div class="sign-block">
    <div class="company">PT. Inter Kreativ Lift Indonesia</div>
    <div class="stamp-area"></div>
    <div class="name">Rohana</div>
    <div class="role">Finance Manager</div>
  </div>

  <div class="footer">
    <div class="footer-content">
      <div class="addr-block">
        <div class="co-name">PT. Inter Kreativ Lift Indonesia</div>
        <div>The Kensington Commercial Blok C/09</div>
        <div>Jl. Boulevard Raya,Kelapa Gading Timur</div>
        <div>Jakarta Utara 14240 - Indonesia</div>
      </div>
      <div class="contact-block">
        <div>&nbsp;</div>
        <div><a href="mailto:info@kreativlift.co.id" style="color:#2563eb;text-decoration:underline;">Info@kreativlift.co.id</a></div>
        <div><a href="https://www.kreativlift.co.id" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">www.kreativlift.co.id</a></div>
        <div>021-22452623</div>
      </div>
    </div>
    <div class="footer-bottom">
      The Kensington Commercial Blok C no. 10, Jl Boulevard Raya, Kelapa Gading - Jakarta Utara 14240<br/>
      Call Center: 021-2245-2623 | Hotline: 0811-129-9888 | E-mail: info@kreativlift.co.id
    </div>
  </div>
</body></html>`
}

// ── Catalog Product Picker Modal ──────────────────────────────────────────────
function ProductCatalogModal({ products, onDone, onClose, initialSelected = [] }) {
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(() => {
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 32px' }}>
        {Object.keys(grouped).length === 0 ? (
          <p style={{ padding: '3rem', textAlign: 'center', color: '#a89f91', fontSize: '0.9rem' }}>No products found.</p>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
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
                        }}>TAP TO ADD</span>
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

  const [cartItems, setCartItems]   = useState([])
  const [cartSaved, setCartSaved]   = useState(true)
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
  // ── Invoice state ──────────────────────────────────────────────────────────
  const [invoices, setInvoices]         = useState([])
  const [invLoading, setInvLoading]     = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [generatingInvoice, setGeneratingInvoice] = useState(false)
  const DEFAULT_TERMS = [
    { percent: 20, label: 'DP-1', active: false },
    { percent: 40, label: 'OI part 1', active: false },
    { percent: 30, label: 'Term BL', active: false },
    { percent: 10, label: 'Final', active: false },
  ]
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNo: '',
    refNo: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    projectLocation: '',
    paymentTerms: DEFAULT_TERMS.map(t => ({ ...t })),
    items: [],
  })

   const [nextRefNo, setNextRefNo] = useState('')

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
    setCartItems(c.draftCart || [])
    setCartSaved(true)
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

  const fetchInvoices = useCallback(async () => {
    setInvLoading(true)
    const res  = await fetch(`/api/invoices?customerId=${id}`)
    const json = await res.json()
    setInvoices(json.data || [])
    setInvLoading(false)
  }, [id])

  const fetchNextRefNo = useCallback(async () => {
    const res  = await fetch('/api/quotations/next-ref')
    const json = await res.json()
    setNextRefNo(json.refNo || '')
  }, [])

  useEffect(() => { fetchCustomer() }, [fetchCustomer])
  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { fetchQuotations() }, [fetchQuotations])
  useEffect(() => { fetchInvoices() }, [fetchInvoices])
  useEffect(() => { fetchNextRefNo() }, [fetchNextRefNo])
  useEffect(() => { if (activeTab === 'quotations') fetchQuotations() }, [activeTab, fetchQuotations])
  useEffect(() => { if (activeTab === 'invoice' || activeTab === 'invoice details') fetchInvoices() }, [activeTab, fetchInvoices])

  function markCartDirty(newItems) {
    setCartItems(newItems)
    setCartSaved(false)
  }

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

  function handleCatalogDone(selectedProducts) {
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
        totalBiaya:    cartTotal,
        ppn:           cartPPN,
        grandTotal:    cartGrand,
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

    setGenerating(false)
    setCartSaved(true)
    setActiveTab('quotations')
    fetchQuotations()
  }

  // ── Print PDF for a draft (cart) — no refNo yet ───────────────────────────
  async function generateDraftPDF() {
    if (cartItems.length === 0) return
    const logoBase64 = await fetchLogoBase64()
    const html = generatePDFHTML(customer, cartItems, { refNo: nextRefNo || 'DRAFT' }, logoBase64)
    const win  = window.open('', '_blank')
    if (!win) { alert('Popup was blocked.'); return }
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 600)
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

  async function updateQuotationStatus(quotId, status) {
    await fetch(`/api/quotations/${quotId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchQuotations()
  }
  // ── Invoice handlers ──────────────────────────────────────────────────────
  function addInvoiceItem() {
    const activeTerm = invoiceForm.paymentTerms.find(t => t.active)
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { specification: '', serialNo: '', stops: '', termPercent: activeTerm ? activeTerm.percent : 0, unitPrice: 0 }],
    }))
  }

  function updateInvoiceItem(idx, field, value) {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }))
  }

  function removeInvoiceItem(idx) {
    setInvoiceForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
  }

  function toggleInvoiceTerm(idx) {
    setInvoiceForm(prev => {
      const updatedTerms = prev.paymentTerms.map((t, i) => i === idx ? { ...t, active: !t.active } : t)
      const activeTerm = updatedTerms.find(t => t.active)
      return {
        ...prev,
        paymentTerms: updatedTerms,
        items: prev.items.map(item => ({
          ...item,
          termPercent: activeTerm ? activeTerm.percent : item.termPercent,
        })),
      }
    })
  }

  function updateInvoiceTermLabel(idx, field, value) {
    setInvoiceForm(prev => ({
      ...prev,
      paymentTerms: prev.paymentTerms.map((t, i) => i === idx ? { ...t, [field]: value } : t),
    }))
  }

  const invoiceItemsCalc = invoiceForm.items.map(item => ({
  ...item,
  amount: Math.round((item.unitPrice || 0) * (parseFloat(item.stops) || 0)),
}))
  const invoiceSubTotal = invoiceItemsCalc.reduce((s, i) => s + i.amount, 0)
  const invoicePPN      = Math.round(invoiceSubTotal * 0.11)
  const invoiceTotal    = invoiceSubTotal + invoicePPN

  async function generateInvoice() {
    if (!invoiceForm.invoiceNo.trim()) return alert('Invoice number is required')
    if (invoiceForm.items.length === 0) return alert('Add at least one item')
    setGeneratingInvoice(true)

    const logoBase64 = await fetchLogoBase64()

    const payload = {
      customerId:      id,
      invoiceNo:       invoiceForm.invoiceNo,
      refNo:           invoiceForm.refNo,
      invoiceDate:     invoiceForm.invoiceDate,
      clientName:      customer.customerName,
      clientAddress:   customer.address,
      projectLocation: invoiceForm.projectLocation,
      paymentTerms:    invoiceForm.paymentTerms,
      items:           invoiceForm.items,
    }

    const res  = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    const inv  = json.data || {}

    const html = generateInvoiceHTML(inv, logoBase64)
    const win   = window.open('', '_blank')
    if (!win) {
      setGeneratingInvoice(false)
      alert('Popup was blocked. Please allow popups for this site and try again.')
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 600)

    setGeneratingInvoice(false)
    setShowInvoiceForm(false)
    setActiveTab('invoice details')
    setInvoiceForm({
      invoiceNo: '',
      refNo: '',
      invoiceDate: new Date().toISOString().slice(0, 10),
      projectLocation: '',
      paymentTerms: DEFAULT_TERMS.map(t => ({ ...t })),
      items: [],
    })
    fetchInvoices()
  }

  async function reprintInvoice(inv) {
    const logoBase64 = await fetchLogoBase64()
    const html = generateInvoiceHTML(inv, logoBase64)
    const win  = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 600)
  }

  async function updateInvoiceStatus(invId, status) {
    await fetch(`/api/invoices/${invId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchInvoices()
  }
  async function deleteInvoice(invId) {
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    await fetch(`/api/invoices/${invId}`, { method: 'DELETE' })
    fetchInvoices()
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

  const TABS = ['overview', 'cart', 'visit history', 'quotations', 'invoice', 'invoice details']

  // ── Draft row: cart items shown in Quotations tab ─────────────────────────
  const hasDraftCart = cartItems.length > 0
  const draftTotal   = cartGrand

  return (
    <>
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
  ? `QUOTATIONS${(quotations.length + (hasDraftCart ? 1 : 0)) > 0 ? ` (${quotations.length + (hasDraftCart ? 1 : 0)})` : ''}`
  : tab === 'cart'
    ? `CART${cartItems.length > 0 ? ` (${cartItems.length})` : ''}`
    : tab === 'invoice'
      ? 'INVOICE'
      : tab === 'invoice details'
        ? `INVOICE DETAILS${invoices.length > 0 ? ` (${invoices.length})` : ''}`
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
                { label: 'NO. PENAWARAN', value: quotations[0]?.refNo || nextRefNo || '—' },
                { label: 'BAST DATE',      value: fmt(customer.bastDate) },
                { label: 'LAST VISIT',     value: fmt(customer.lastVisitDate) },
                { label: 'NEXT VISIT',     value: fmt(customer.nextVisitDate) },
                { label: 'STATUS',         value: customer.status },
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                {quotations.length + (hasDraftCart ? 1 : 0)} quotation{(quotations.length + (hasDraftCart ? 1 : 0)) !== 1 ? 's' : ''} for <strong>{customer.customerName}</strong>
              </p>
              <button onClick={() => setActiveTab('cart')} style={darkBtn}>+ New Quote</button>
            </div>

            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['REF NO.', 'CLIENT', 'DATE', 'ITEMS', 'AMOUNT (incl. PPN)', 'STATUS', 'ACTIONS'].map(h => (
                      <th key={h} style={{
                        padding: '11px 16px', textAlign: 'left', color: '#9ca3af',
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {qLoading ? (
                    <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
                  ) : (
                    <>
                      {/* ── Draft row from Cart ── */}
                      {hasDraftCart && (
                        <tr style={{ background: '#fffdf5', borderBottom: '1px solid #f3f4f6' }}>
                          {/* REF NO */}
                          <td style={{ padding: '13px 16px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              fontFamily: 'monospace', fontSize: '0.82rem', color: '#92400e', fontWeight: 700,
                            }}>
                              DRAFT
                              <span style={{
                                fontSize: '0.62rem', background: '#fef3c7', color: '#92400e',
                                border: '1px solid #fde68a', borderRadius: '4px',
                                padding: '1px 6px', fontFamily: "'Sora', sans-serif", fontWeight: 600,
                                letterSpacing: '0.06em',
                              }}>CART</span>
                            </span>
                          </td>
                          {/* CLIENT */}
                          <td style={{ padding: '13px 16px', color: '#374151', fontSize: '0.84rem', fontWeight: 500 }}>
                            {customer.customerName}
                          </td>
                          {/* DATE */}
                          <td style={{ padding: '13px 16px', color: '#374151', fontSize: '0.84rem' }}>
                            {fmt(new Date().toISOString())}
                          </td>
                          {/* ITEMS */}
                          <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: '0.83rem' }}>
                            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                          </td>
                          {/* AMOUNT */}
                          <td style={{ padding: '13px 16px' }}>
                            <span style={{ fontWeight: 700, color: '#111', fontSize: '0.9rem' }}>
                              {fmtRp(draftTotal)}
                            </span>
                          </td>
                          {/* STATUS */}
                          <td style={{ padding: '13px 16px' }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: '20px', fontSize: '0.73rem',
                              fontWeight: 600, border: '1px solid #fde68a',
                              background: '#fef9ee', color: '#92400e',
                              fontFamily: "'Sora', sans-serif",
                            }}>
                              Draft
                            </span>
                          </td>
                          {/* ACTIONS */}
                          <td style={{ padding: '13px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {/* Edit cart */}
                              <button
                                title="Edit cart"
                                onClick={() => setActiveTab('cart')}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '6px',
                                  background: '#fff', color: '#374151', cursor: 'pointer',
                                  fontSize: '0.75rem', fontWeight: 600, fontFamily: "'Sora', sans-serif",
                                }}>
                                ✏
                              </button>
                              {/* Print draft PDF */}
                              <button
                                title="Print draft PDF"
                                onClick={generateDraftPDF}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '6px',
                                  background: '#fff', color: '#374151', cursor: 'pointer',
                                  fontSize: '0.75rem', fontWeight: 600, fontFamily: "'Sora', sans-serif",
                                }}>
                                ⬇ PDF
                              </button>
                              {/* Confirm & save as real quotation */}
                              <button
                                title="Confirm & save quotation"
                                onClick={generatePDF}
                                disabled={generatingPDF}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '6px 12px', border: 'none', borderRadius: '6px',
                                  background: '#CC2020', color: '#fff', cursor: 'pointer',
                                  fontSize: '0.75rem', fontWeight: 700, fontFamily: "'Sora', sans-serif",
                                }}>
                                {generatingPDF ? '...' : '📄 Confirm'}
                              </button>
                              {/* Delete draft cart */}
                              <button
                                title="Clear cart"
                                onClick={() => {
                                  if (confirm('Clear the draft cart? This cannot be undone.')) {
                                    markCartDirty([])
                                    saveCart()
                                  }
                                }}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  padding: '6px 10px', border: '1px solid #fecaca', borderRadius: '6px',
                                  background: '#fff', color: '#dc2626', cursor: 'pointer',
                                  fontSize: '0.75rem', fontWeight: 600, fontFamily: "'Sora', sans-serif",
                                }}>
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* ── Saved quotations ── */}
                      {quotations.length === 0 && !hasDraftCart ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                            <p style={{ margin: '0 0 6px', fontSize: '0.9rem' }}>No quotations yet.</p>
                            <p style={{ margin: 0, fontSize: '0.8rem' }}>Add items to Cart to get started.</p>
                          </td>
                        </tr>
                      ) : quotations.map((q, i) => (
                        <tr key={q._id} style={{
                          borderBottom: i < quotations.length - 1 ? '1px solid #f3f4f6' : 'none',
                          background: i % 2 === 0 ? '#fff' : '#fafafa',
                        }}>
                          {/* REF NO */}
                          <td style={{ padding: '13px 16px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#b45309', fontWeight: 700 }}>
                              {q.refNo || '—'}
                            </span>
                          </td>
                          {/* CLIENT */}
                          <td style={{ padding: '13px 16px', color: '#374151', fontSize: '0.84rem', fontWeight: 500 }}>
                            {customer.customerName}
                          </td>
                          {/* DATE */}
                          <td style={{ padding: '13px 16px', color: '#374151', fontSize: '0.84rem' }}>
                            {fmt(q.quoteDate || q.createdAt)}
                          </td>
                          {/* ITEMS */}
                          <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: '0.83rem' }}>
                            {q.items?.length || 0} item{(q.items?.length || 0) !== 1 ? 's' : ''}
                          </td>
                          {/* AMOUNT */}
                          <td style={{ padding: '13px 16px' }}>
                            <span style={{ fontWeight: 700, color: '#111', fontSize: '0.9rem' }}>
                              {fmtRp(q.grandTotal || ((q.items || []).reduce((s, it) => s + ((it.jumlahUnit || 1) * (it.hargaPerUnit || 0)), 0) * 1.11))}
                            </span>
                          </td>
                          {/* STATUS */}
                          <td style={{ padding: '13px 16px' }}>
                            <select
                              value={q.status || 'Draft'}
                              onChange={e => updateQuotationStatus(q._id, e.target.value)}
                              style={{
                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.73rem',
                                fontWeight: 600, border: '1px solid', cursor: 'pointer',
                                fontFamily: "'Sora', sans-serif",
                                background: q.status === 'Paid' ? '#f0fdf4' : q.status === 'Sent' ? '#eff6ff' : q.status === 'Cancelled' ? '#fef2f2' : '#f9fafb',
                                color: q.status === 'Paid' ? '#16a34a' : q.status === 'Sent' ? '#2563eb' : q.status === 'Cancelled' ? '#dc2626' : '#6b7280',
                                borderColor: q.status === 'Paid' ? '#bbf7d0' : q.status === 'Sent' ? '#bfdbfe' : q.status === 'Cancelled' ? '#fecaca' : '#e5e7eb',
                              }}>
                              {['Draft', 'Sent', 'Paid', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                          {/* ACTIONS */}
                          <td style={{ padding: '13px 16px' }}>
                            <button
                              title="Download / Print PDF"
                              onClick={() => reprintPDF(q)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '6px',
                                background: '#fff', color: '#374151', cursor: 'pointer',
                                fontSize: '0.75rem', fontWeight: 600, fontFamily: "'Sora', sans-serif",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db' }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                            >
                              ⬇ PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── INVOICE TAB ── */}
        {activeTab === 'invoice' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} for <strong>{customer.customerName}</strong>
              </p>
              <button onClick={() => setShowInvoiceForm(s => !s)} style={darkBtn}>
                {showInvoiceForm ? 'Cancel' : '+ Generate Invoice'}
              </button>
            </div>

            {showInvoiceForm && (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', marginBottom: '20px', background: '#fafafa' }}>

                {/* Invoice meta */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Invoice No. *</label>
                    <input value={invoiceForm.invoiceNo}
                      onChange={e => setInvoiceForm(p => ({ ...p, invoiceNo: e.target.value }))}
                      placeholder="" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Reference</label>
                    <input value={invoiceForm.refNo}
                      onChange={e => setInvoiceForm(p => ({ ...p, refNo: e.target.value }))}
                      placeholder="" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Invoice Date</label>
                    <input type="date" value={invoiceForm.invoiceDate}
                      onChange={e => setInvoiceForm(p => ({ ...p, invoiceDate: e.target.value }))}
                      style={inputStyle} />
                  </div>
                </div>

                {/* Client info (read-only, from overview) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Customer</label>
                    <input value={customer.customerName} readOnly style={{ ...inputStyle, background: '#f3f4f6', color: '#6b7280' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Address</label>
                    <input value={customer.address || ''} readOnly style={{ ...inputStyle, background: '#f3f4f6', color: '#6b7280' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Project Location</label>
                  <textarea value={invoiceForm.projectLocation} rows={3}
                    onChange={e => setInvoiceForm(p => ({ ...p, projectLocation: e.target.value }))}
                    placeholder=""
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: "'Sora', sans-serif" }} />
                </div>

                {/* Payment terms */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Payment Terms (tap to highlight active term)</label>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', maxWidth: '420px' }}>
                    {invoiceForm.paymentTerms.map((t, idx) => (
                      <div key={idx}
                        onClick={() => toggleInvoiceTerm(idx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '8px 14px', cursor: 'pointer',
                          background: t.active ? '#fff3cd' : (idx % 2 === 0 ? '#fff' : '#fafafa'),
                          borderBottom: idx < invoiceForm.paymentTerms.length - 1 ? '1px solid #f3f4f6' : 'none',
                        }}>
                        <input type="number" value={t.percent}
  onClick={e => e.stopPropagation()}
  onChange={e => updateInvoiceTermLabel(idx, 'percent', parseFloat(e.target.value) || 0)}
  style={{ width: '64px', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '3px 6px', fontSize: '0.78rem', textAlign: 'center' }} />
                        <span style={{ fontSize: '0.78rem' }}>%</span>
                        <input value={t.label}
                          onClick={e => e.stopPropagation()}
                          onChange={e => updateInvoiceTermLabel(idx, 'label', e.target.value)}
                          style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '4px', padding: '3px 8px', fontSize: '0.78rem', fontStyle: 'italic' }} />
                        {t.active && <span style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 700 }}>● ACTIVE</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Line items */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Line Items</label>
                    <button onClick={addInvoiceItem} style={outlineBtn}>+ Add Item</button>
                  </div>

                  {invoiceForm.items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: '8px', fontSize: '0.85rem' }}>
                      No items yet. Click "+ Add Item" to add one.
                    </div>
                  ) : (
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            {['SPECIFICATION', 'SERIAL NO.', 'STOPS', 'TERM %', 'UNIT PRICE (Rp)', 'AMOUNT', ''].map(h => (
                              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#9ca3af',
                                fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.06em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceForm.items.map((item, idx) => {
  const amount = Math.round((item.unitPrice || 0) * (parseFloat(item.stops) || 0))
                            return (
                              <tr key={idx} style={{ borderBottom: idx < invoiceForm.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                <td style={{ padding: '8px 10px' }}>
                                  <input value={item.specification}
                                    onChange={e => updateInvoiceItem(idx, 'specification', e.target.value)}
                                    placeholder=""
                                    style={{ ...inputStyle, minWidth: '180px' }} />
                                </td>
                                <td style={{ padding: '8px 10px' }}>
                                  <input value={item.serialNo}
                                    onChange={e => updateInvoiceItem(idx, 'serialNo', e.target.value)}
                                    placeholder="" style={{ ...inputStyle, width: '100px' }} />
                                </td>
                                <td style={{ padding: '8px 10px' }}>
                                  <input value={item.stops}
                                    onChange={e => updateInvoiceItem(idx, 'stops', e.target.value)}
                                    placeholder="" style={{ ...inputStyle, width: '80px' }} />
                                </td>
                                <td style={{ padding: '8px 10px' }}>
                                  <input type="number" value={item.termPercent}
                                    onChange={e => updateInvoiceItem(idx, 'termPercent', parseFloat(e.target.value) || 0)}
                                    style={{ ...inputStyle, width: '70px' }} />
                                </td>
                                <td style={{ padding: '8px 10px' }}>
                                  <input type="text" inputMode="numeric" value={formatThousands(item.unitPrice)}
                                    onChange={e => updateInvoiceItem(idx, 'unitPrice', parseThousands(e.target.value))}
                                    style={{ ...inputStyle, width: '130px' }} />
                                </td>
                                <td style={{ padding: '8px 10px', fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }}>
                                  {fmtRp(amount)}
                                </td>
                                <td style={{ padding: '8px 10px' }}>
                                  <button onClick={() => removeInvoiceItem(idx)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '1rem' }}>✕</button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Totals preview */}
                {invoiceForm.items.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 20px', minWidth: '260px' }}>
                      {[
                        { label: 'Sub Total', val: fmtRp(invoiceSubTotal) },
                        { label: 'PPN 11%',   val: fmtRp(invoicePPN) },
                      ].map(({ label, val }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.82rem', color: '#374151' }}>
                          <span>{label}</span><span>{val}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0', borderTop: '1px solid #f3f4f6', marginTop: '4px', fontSize: '0.92rem', fontWeight: 700, color: '#111' }}>
                        <span>Total Amount</span><span>{fmtRp(invoiceTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={generateInvoice} disabled={generatingInvoice}
                  style={{ ...darkBtn, background: '#CC2020', width: '100%', padding: '12px' }}>
                  {generatingInvoice ? 'Generating...' : '📄 Generate & Print Invoice'}
                </button>
              </div>
            )}

            </div>
        )}

        {/* ── INVOICE DETAILS TAB ── */}
        {activeTab === 'invoice details' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} for <strong>{customer.customerName}</strong>
              </p>
              <button onClick={() => setActiveTab('invoice')} style={darkBtn}>+ Generate Invoice</button>
            </div>

            <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['INVOICE NO.', 'CLIENT', 'DATE', 'ITEMS', 'TOTAL', 'STATUS', 'ACTIONS'].map(h => (
                      <th key={h} style={{
                        padding: '11px 16px', textAlign: 'left', color: '#9ca3af',
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invLoading ? (
                    <tr><td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                        <p style={{ margin: '0 0 6px', fontSize: '0.9rem' }}>No invoices yet.</p>
                        <p style={{ margin: 0, fontSize: '0.8rem' }}>Click "+ Generate Invoice" to create one.</p>
                      </td>
                    </tr>
                  ) : invoices.map((inv, i) => (
                    <tr key={inv._id} style={{
                      borderBottom: i < invoices.length - 1 ? '1px solid #f3f4f6' : 'none',
                      background: i % 2 === 0 ? '#fff' : '#fafafa',
                    }}>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#b45309', fontWeight: 700 }}>
                          {inv.invoiceNo || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', color: '#374151', fontSize: '0.84rem', fontWeight: 500 }}>
                        {customer.customerName}
                      </td>
                      <td style={{ padding: '13px 16px', color: '#374151', fontSize: '0.84rem' }}>
                        {fmt(inv.invoiceDate || inv.createdAt)}
                      </td>
                      <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: '0.83rem' }}>
                        {inv.items?.length || 0} item{(inv.items?.length || 0) !== 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontWeight: 700, color: '#111', fontSize: '0.9rem' }}>
                          {fmtRp(inv.totalAmount)}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <select
                          value={inv.status || 'Draft'}
                          onChange={e => updateInvoiceStatus(inv._id, e.target.value)}
                          style={{
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.73rem',
                            fontWeight: 600, border: '1px solid', cursor: 'pointer',
                            fontFamily: "'Sora', sans-serif",
                            background: inv.status === 'Paid' ? '#f0fdf4' : inv.status === 'Sent' ? '#eff6ff' : inv.status === 'Cancelled' ? '#fef2f2' : '#f9fafb',
                            color: inv.status === 'Paid' ? '#16a34a' : inv.status === 'Sent' ? '#2563eb' : inv.status === 'Cancelled' ? '#dc2626' : '#6b7280',
                            borderColor: inv.status === 'Paid' ? '#bbf7d0' : inv.status === 'Sent' ? '#bfdbfe' : inv.status === 'Cancelled' ? '#fecaca' : '#e5e7eb',
                          }}>
                          {['Draft', 'Sent', 'Paid', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => reprintInvoice(inv)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '6px',
                              background: '#fff', color: '#374151', cursor: 'pointer',
                              fontSize: '0.75rem', fontWeight: 600, fontFamily: "'Sora', sans-serif",
                            }}>
                            ⬇ PDF
                          </button>
                          <button
                            onClick={() => deleteInvoice(inv._id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '6px 12px', border: '1px solid #fecaca', borderRadius: '6px',
                              background: '#fff', color: '#dc2626', cursor: 'pointer',
                              fontSize: '0.75rem', fontWeight: 600, fontFamily: "'Sora', sans-serif",
                            }}>
                            🗑
                          </button>
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