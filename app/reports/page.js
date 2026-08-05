'use client';

import { useState, useEffect, useMemo } from 'react';

const BORDER = '#1e1e16';
const TEXT   = '#d8d4c8';
const FAINT  = '#3a3830';
const DARK   = '#1e1e16';

const fmtRp = (n) =>
  n || n === 0
    ? `Rp ${Number(n).toLocaleString('id-ID')}`
    : '—';

const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date)) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

function statusOf(product) {
  const tersedia = Math.max(0, (product.quantity || 0) - (product.stokDiHold || 0));
  if (tersedia <= 0) return 'Out of Stock';
  if (tersedia <= (product.minStock || 0)) return 'Low Stock';
  return 'In Stock';
}

const statusColor = {
  'Low Stock':   { bg: '#3a2a10', fg: '#e0a94a' },
  'In Stock':    { bg: '#12301f', fg: '#5ec98a' },
  'Out of Stock':{ bg: '#3a1414', fg: '#e05c5c' },
};

/* ---------------- Small UI bits ---------------- */

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? TEXT : 'transparent',
        color: active ? DARK : TEXT,
        border: `0.5px solid ${BORDER}`,
        padding: '7px 16px',
        fontSize: 9,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </button>
  );
}

function ActionButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'transparent',
        color: disabled ? FAINT : TEXT,
        border: `0.5px solid ${BORDER}`,
        padding: '7px 14px',
        fontSize: 8,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }) {
  const c = statusColor[status] || { bg: '#2a2a22', fg: TEXT };
  return (
    <span style={{
      background: c.bg,
      color: c.fg,
      fontSize: 8,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      padding: '3px 8px',
      borderRadius: 3,
    }}>
      {status}
    </span>
  );
}

/* ---------------- Main Page ---------------- */

export default function ReportsPage() {
  const [tab, setTab] = useState('products'); // 'products' | 'customers'
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [pRes, cRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/maintenance'),
        ]);
        const pJson = await pRes.json();
        const cJson = await cRes.json();
        setProducts(pJson.data || []);
        setCustomers(cJson.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ---------- Excel export ---------- */
  const downloadExcel = async () => {
    const XLSX = await import('xlsx');

    if (tab === 'products') {
      const productRows = products.map((p, i) => ({
        '#': i + 1,
        'Product Name': p.name,
        'Category': p.category || '',
        'Stock': p.quantity,
        'Min Stock': p.minStock,
        'Price': p.price,
        'Status': statusOf(p),
      }));

      const remarkRows = [];
      products.forEach((p) => {
        (p.remarks || []).forEach((r) => {
          remarkRows.push({
            'Product Name': p.name,
            'Customer Name': r.customerName,
            'Quantity Sold': r.quantitySold,
            'Amount (Rp)': r.amount,
            'Note': r.note || '',
            'Date': fmtDate(r.date),
          });
        });
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productRows), 'Products');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(remarkRows), 'Sales Remarks');
      XLSX.writeFile(wb, `products-report-${Date.now()}.xlsx`);
    } else {
      const rows = customers.map((c, i) => ({
        '#': i + 1,
        'Customer Name': c.customerName,
        'Address': c.address || '',
        'Kota': c.kota || '',
        'Wilayah': c.wilayah || '',
        'Phone': c.phone || '',
        'Unit Type': c.unitType || '',
        'Serial Number': c.serialNumber || '',
        'Last Visit': fmtDate(c.lastVisitDate),
        'Next Visit': fmtDate(c.nextVisitDate),
        'Visit Count': c.visitCount,
        'Status': c.status,
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Customer List');
      XLSX.writeFile(wb, `customer-list-${Date.now()}.xlsx`);
    }
  };

  /* ---------- PDF export ---------- */
  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF({ orientation: 'landscape' });

    if (tab === 'products') {
      doc.setFontSize(14);
      doc.text('Products Report', 14, 14);

      autoTable(doc, {
        startY: 20,
        head: [['#', 'Product Name', 'Category', 'Stock', 'Min Stock', 'Price', 'Status']],
        body: products.map((p, i) => [
          i + 1,
          p.name,
          p.category || '-',
          p.quantity,
          p.minStock,
          fmtRp(p.price),
          statusOf(p),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 30, 22] },
      });

      let y = doc.lastAutoTable.finY + 10;
      products.forEach((p) => {
        if (!p.remarks || p.remarks.length === 0) return;
        if (y > 180) { doc.addPage(); y = 14; }

        doc.setFontSize(10);
        doc.text(p.name, 14, y);
        y += 4;

        autoTable(doc, {
          startY: y,
          head: [['Customer Name', 'Qty Sold', 'Amount', 'Note', 'Date']],
          body: p.remarks.map((r) => [
            r.customerName,
            r.quantitySold,
            fmtRp(r.amount),
            r.note || '-',
            fmtDate(r.date),
          ]),
          styles: { fontSize: 7 },
          headStyles: { fillColor: [70, 70, 60] },
          margin: { left: 14 },
        });

        y = doc.lastAutoTable.finY + 10;
      });

      doc.save(`products-report-${Date.now()}.pdf`);
    } else {
      doc.setFontSize(14);
      doc.text('Customer List', 14, 14);

      autoTable(doc, {
        startY: 20,
        head: [['#', 'Customer Name', 'Kota', 'Phone', 'Unit Type', 'Last Visit', 'Next Visit', 'Status']],
        body: customers.map((c, i) => [
          i + 1,
          c.customerName,
          c.kota || '-',
          c.phone || '-',
          c.unitType || '-',
          fmtDate(c.lastVisitDate),
          fmtDate(c.nextVisitDate),
          c.status,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [30, 30, 22] },
      });

      doc.save(`customer-list-${Date.now()}.pdf`);
    }
  };

  const isEmpty = tab === 'products' ? products.length === 0 : customers.length === 0;

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ padding: '18px 24px 14px', borderBottom: `0.5px solid ${BORDER}` }}>
        <div style={{ fontSize: 8, letterSpacing: '0.3em', color: FAINT, textTransform: 'uppercase', marginBottom: 3 }}>
          Analytics
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: TEXT }}>
          Reports
        </div>
      </div>

      <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <TabButton active={tab === 'products'} onClick={() => setTab('products')}>Products</TabButton>
          <TabButton active={tab === 'customers'} onClick={() => setTab('customers')}>Customer List</TabButton>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ActionButton onClick={downloadPDF} disabled={loading || isEmpty}>Download PDF</ActionButton>
          <ActionButton onClick={downloadExcel} disabled={loading || isEmpty}>Download Excel</ActionButton>
        </div>
      </div>

      <div style={{ padding: '0 24px 40px' }}>
        {loading && (
          <div style={{ color: FAINT, fontSize: 11, padding: '40px 0', textAlign: 'center' }}>Loading…</div>
        )}

        {!loading && error && (
          <div style={{ color: '#e05c5c', fontSize: 11, padding: '40px 0', textAlign: 'center' }}>{error}</div>
        )}

        {!loading && !error && tab === 'products' && (
          <ProductsTable products={products} expanded={expanded} toggleExpand={toggleExpand} />
        )}

        {!loading && !error && tab === 'customers' && (
          <CustomersTable customers={customers} />
        )}
      </div>
    </div>
  );
}

/* ---------------- Products Table ---------------- */

function ProductsTable({ products, expanded, toggleExpand }) {
  if (products.length === 0) {
    return <div style={{ color: FAINT, fontSize: 11, padding: '40px 0', textAlign: 'center' }}>No products found.</div>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ borderBottom: `0.5px solid ${BORDER}` }}>
          {['#', 'Product Name', 'Category', 'Stock', 'Min Stock', 'Price', 'Status', ''].map((h) => (
            <th key={h} style={{ textAlign: 'left', padding: '10px 8px', color: FAINT, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 400 }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {products.map((p, i) => {
          const isOpen = !!expanded[p._id];
          const remarks = p.remarks || [];
          return (
            <>
              <tr
                key={p._id}
                onClick={() => toggleExpand(p._id)}
                style={{ borderBottom: `0.5px solid ${BORDER}`, cursor: 'pointer' }}
              >
                <td style={{ padding: '10px 8px', color: FAINT }}>{i + 1}</td>
                <td style={{ padding: '10px 8px', color: TEXT, fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '10px 8px', color: TEXT }}>{p.category || '—'}</td>
                <td style={{ padding: '10px 8px', color: TEXT }}>{p.quantity}</td>
                <td style={{ padding: '10px 8px', color: FAINT }}>{p.minStock}</td>
                <td style={{ padding: '10px 8px', color: TEXT }}>{fmtRp(p.price)}</td>
                <td style={{ padding: '10px 8px' }}><StatusPill status={statusOf(p)} /></td>
                <td style={{ padding: '10px 8px', color: FAINT, fontSize: 10 }}>
                  {remarks.length > 0 ? (isOpen ? '▲' : `▼ ${remarks.length}`) : ''}
                </td>
              </tr>
              {isOpen && remarks.length > 0 && (
                <tr key={`${p._id}-remarks`}>
                  <td colSpan={8} style={{ padding: '0 8px 16px 32px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: 8, letterSpacing: '0.15em', color: FAINT, textTransform: 'uppercase', margin: '10px 0 6px' }}>
                      Customers who bought this
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr>
                          {['Customer Name', 'Qty Sold', 'Amount', 'Note', 'Date'].map((h) => (
                            <th key={h} style={{ textAlign: 'left', padding: '4px 8px', color: FAINT, fontSize: 8, textTransform: 'uppercase', fontWeight: 400 }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {remarks.map((r) => (
                          <tr key={r._id}>
                            <td style={{ padding: '4px 8px', color: TEXT }}>{r.customerName}</td>
                            <td style={{ padding: '4px 8px', color: TEXT }}>{r.quantitySold}</td>
                            <td style={{ padding: '4px 8px', color: TEXT }}>{fmtRp(r.amount)}</td>
                            <td style={{ padding: '4px 8px', color: FAINT }}>{r.note || '—'}</td>
                            <td style={{ padding: '4px 8px', color: FAINT }}>{fmtDate(r.date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </>
          );
        })}
      </tbody>
    </table>
  );
}

/* ---------------- Customers Table ---------------- */

function CustomersTable({ customers }) {
  if (customers.length === 0) {
    return <div style={{ color: FAINT, fontSize: 11, padding: '40px 0', textAlign: 'center' }}>No customers found.</div>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ borderBottom: `0.5px solid ${BORDER}` }}>
          {['#', 'Customer Name', 'Kota', 'Phone', 'Unit Type', 'Last Visit', 'Next Visit', 'Status'].map((h) => (
            <th key={h} style={{ textAlign: 'left', padding: '10px 8px', color: FAINT, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 400 }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {customers.map((c, i) => (
          <tr key={c._id} style={{ borderBottom: `0.5px solid ${BORDER}` }}>
            <td style={{ padding: '10px 8px', color: FAINT }}>{i + 1}</td>
            <td style={{ padding: '10px 8px', color: TEXT, fontWeight: 500 }}>{c.customerName}</td>
            <td style={{ padding: '10px 8px', color: TEXT }}>{c.kota || '—'}</td>
            <td style={{ padding: '10px 8px', color: TEXT }}>{c.phone || '—'}</td>
            <td style={{ padding: '10px 8px', color: TEXT }}>{c.unitType || '—'}</td>
            <td style={{ padding: '10px 8px', color: FAINT }}>{fmtDate(c.lastVisitDate)}</td>
            <td style={{ padding: '10px 8px', color: FAINT }}>{fmtDate(c.nextVisitDate)}</td>
            <td style={{ padding: '10px 8px', color: TEXT }}>{c.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}