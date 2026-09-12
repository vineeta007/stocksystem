// Shared PDF/print templates for quotations and invoices.
// Used by both the per-customer detail page and the global quotation list
// so every place that prints a quotation/invoice renders the same document.

export async function fetchLogoBase64() {
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

export function generateQuotationPDFHTML(customer, items, quotation, logoBase64) {
  const totalBiaya = items.reduce((s, i) => s + ((i.jumlahUnit || 1) * (i.hargaPerUnit || 0)), 0)
  const ppn        = Math.round(totalBiaya * 0.11)
  const grand      = totalBiaya + ppn
  const today      = quotation?.quoteDate ? new Date(quotation.quoteDate) : new Date()
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
  <div class="ref-outer">
    <table class="ref-table">
      <thead><tr><th>No. Penawaran</th><th>Tanggal</th></tr></thead>
      <tbody><tr><td>${refNo}</td><td>${dateStr}</td></tr></tbody>
    </table>
  </div>
  <div class="perihal">Perihal: ${customer.perihal || 'Penawaran Biaya Maintenance Per Kunjungan'}</div>
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

export function generateInvoicePDFHTML(invoiceData, logoBase64) {
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
