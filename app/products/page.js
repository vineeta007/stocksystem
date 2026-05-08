'use client';
import { useState } from 'react';
import { products, CATEGORIES, getStockStatus } from '@/lib/products';

const BORDER = '#1e1e16';
const TEXT = '#d8d4c8';
const FAINT = '#3a3830';
const MUTED = '#6a6658';
const GOLD = '#c9a84c';

function statusStyle(status) {
  if (status === 'out') return { bg: '#2e1a1a', color: '#e05050', border: '#4a2020', label: 'OUT OF STOCK' };
  if (status === 'low') return { bg: '#2e1e10', color: '#d97b3a', border: '#4a3010', label: 'LOW STOCK' };
  return { bg: '#1a2e22', color: '#4caf7a', border: '#2a4a32', label: 'IN STOCK' };
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = products.filter(p => {
    const matchCat = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const s = getStockStatus(p);
    const matchStatus =
      statusFilter === 'All' ? true :
      statusFilter === 'Low' ? s === 'low' :
      statusFilter === 'Out' ? s === 'out' :
      s === 'in';
    return matchCat && matchSearch && matchStatus;
  });

  const total = products.length;
  const low = products.filter(p => getStockStatus(p) === 'low').length;
  const out = products.filter(p => getStockStatus(p) === 'out').length;

  return (
    <div style={{ minHeight: '100vh', color: TEXT }}>
      {/* Header */}
      <div style={{ padding: '18px 28px 14px', borderBottom: `0.5px solid ${BORDER}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 8, letterSpacing: '0.3em', color: FAINT, textTransform: 'uppercase', marginBottom: 3 }}>Catalogue</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: TEXT }}>Products</div>
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: MUTED }}>
          <span style={{ color: TEXT, fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{total}</span> total &nbsp;·&nbsp;
          <span style={{ color: '#d97b3a', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{low}</span> low &nbsp;·&nbsp;
          <span style={{ color: '#e05050', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{out}</span> out
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '14px 28px', borderBottom: `0.5px solid ${BORDER}`, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{
            background: '#111109', border: `0.5px solid ${BORDER}`,
            borderRadius: 3, padding: '7px 12px', color: TEXT,
            fontSize: 11, outline: 'none', width: 200,
          }}
        />

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '5px 10px', fontSize: 9, letterSpacing: '0.1em',
              textTransform: 'uppercase', borderRadius: 3, cursor: 'pointer',
              background: category === cat ? GOLD : 'transparent',
              color: category === cat ? '#0a0a07' : MUTED,
              border: `0.5px solid ${category === cat ? GOLD : BORDER}`,
              fontWeight: category === cat ? 600 : 400,
            }}>{cat}</button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {['All', 'In Stock', 'Low', 'Out'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '5px 10px', fontSize: 9, letterSpacing: '0.1em',
              textTransform: 'uppercase', borderRadius: 3, cursor: 'pointer',
              background: statusFilter === s ? '#1e1d19' : 'transparent',
              color: statusFilter === s ? TEXT : FAINT,
              border: `0.5px solid ${statusFilter === s ? '#333230' : BORDER}`,
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 28px 32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `0.5px solid ${BORDER}` }}>
              {['#', 'Product Name', 'Category', 'Stock', 'Min Stock', 'Status', 'Photos'].map(h => (
                <th key={h} style={{
                  padding: '12px 10px', textAlign: 'left',
                  fontSize: 8, letterSpacing: '0.2em', color: FAINT,
                  textTransform: 'uppercase', fontWeight: 600,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
  {filtered.length === 0 ? (
    <tr>
      <td
        colSpan={7}
        style={{
          padding: '40px',
          textAlign: 'center',
          color: FAINT,
          fontSize: 11,
        }}
      >
        No products found.
      </td>
    </tr>
  ) : (
    filtered.map((p, i) => {
      const s = getStockStatus(p);
      const st = statusStyle(s);

      return (
        <tr
          key={p.id}
          style={{
            borderBottom: `0.5px solid #16150f`,
            background: i % 2 === 0 ? 'transparent' : '#111109',
          }}
        >
          {/* ID */}
          <td
            style={{
              padding: '11px 10px',
              color: FAINT,
              fontFamily: 'Space Mono, monospace',
              fontSize: 10,
            }}
          >
            {p.id}
          </td>

          {/* Product Name */}
          <td
            style={{
              padding: '11px 10px',
              color: TEXT,
              fontWeight: 500,
            }}
          >
            {p.name}
          </td>

          {/* Category */}
          <td style={{ padding: '11px 10px' }}>
            <span
              style={{
                fontSize: 9,
                padding: '2px 7px',
                borderRadius: 2,
                background: '#1a1915',
                color: MUTED,
                border: `0.5px solid ${BORDER}`,
                letterSpacing: '0.05em',
              }}
            >
              {p.category}
            </span>
          </td>

          {/* Stock */}
          <td
            style={{
              padding: '11px 10px',
              fontFamily: 'Space Mono, monospace',
              fontWeight: 700,
              color: TEXT,
            }}
          >
            {p.stock}
          </td>

          {/* Min Stock */}
          <td
            style={{
              padding: '11px 10px',
              color: FAINT,
              fontFamily: 'Space Mono, monospace',
            }}
          >
            {p.minStock}
          </td>

          {/* Status */}
          <td style={{ padding: '11px 10px' }}>
            <span
              style={{
                fontSize: 8,
                padding: '3px 7px',
                borderRadius: 2,
                background: st.bg,
                color: st.color,
                border: `0.5px solid ${st.border}`,
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              {st.label}
            </span>
          </td>

          {/* Photos Button */}
          <td style={{ padding: '11px 10px' }}>
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                    p.name
                  )}`,
                  '_blank'
                )
              }
              style={{
                background: '#13294B',
                border: '1px solid #1E3A5F',
                color: '#7EA8D4',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              Photos+
            </button>
          </td>
        </tr>
      );
    })
  )}
</tbody>
        </table>
      </div>
    </div>
  );
}