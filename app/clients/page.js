'use client';

import { useEffect, useState } from 'react';

function excelDateToString(val) {
  if (!val || isNaN(val)) return val ?? '—';
  const date = new Date(Math.round((val - 25569) * 86400 * 1000));
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ClientsPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(json => { setData(json); setFiltered(json); setLoading(false); });
  }, []);

  useEffect(() => {
    let result = data;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        (r['Nama Cust'] ?? '').toLowerCase().includes(q) ||
        (r['Code Lift'] ?? '').toString().toLowerCase().includes(q) ||
        (r['Jenis Lift'] ?? '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(r => r['Garansi atau Tidak'] === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, data]);

  const total = data.length;
  const aktif = data.filter(r => r['Garansi atau Tidak'] === 'Ya').length;
  const tidak = data.filter(r => r['Garansi atau Tidak'] === 'Tidak').length;

  if (loading) return (
    <div style={{ padding: '40px', color: '#B8D4F0', fontFamily: "'Sora', sans-serif" }}>
      Loading Data Garansi...
    </div>
  );

  return (
    <div style={{ padding: '32px', fontFamily: "'Sora', sans-serif", minHeight: '100vh', background: '#0a1628' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#4A7BAF', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '6px' }}>
          Client Details
        </p>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          Data Garansi
        </h1>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Clients', value: total, color: '#4EAAFF' },
          { label: 'Aktif Garansi', value: aktif, color: '#2EFA64' },
          { label: 'Tidak Garansi', value: tidak, color: '#FA4646' },
        ].map(card => (
          <div key={card.label} style={{
            background: '#0F1F3D', border: '1px solid #1E3A5F',
            borderRadius: '10px', padding: '18px 24px', minWidth: '150px',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '12px', color: '#4A7BAF', marginTop: '4px' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name, code, or type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: '8px', border: '1px solid #1E3A5F',
            background: '#0F1F3D', color: '#B8D4F0', fontSize: '13px',
            fontFamily: "'Sora', sans-serif", outline: 'none', width: '260px',
          }}
        />
        {['ALL', 'Ya', 'Tidak'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', border: '1px solid #1E3A5F', fontFamily: "'Sora', sans-serif",
            background: statusFilter === s ? 'rgba(46,144,250,.2)' : '#0F1F3D',
            color: statusFilter === s ? '#4EAAFF' : '#B8D4F0',
          }}>
            {s === 'ALL' ? 'All' : s === 'Ya' ? 'Aktif' : 'Tidak'}
          </button>
        ))}
        <span style={{ fontSize: '13px', color: '#4A7BAF', marginLeft: 'auto' }}>
          {filtered.length} results
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #1E3A5F' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1A3A5C' }}>
              {['No', 'Jenis Lift', 'Code Lift', 'Tgl BAST', 'Nama Cust', 'Masa Garansi (Days)', 'Days From BAST', 'Status', 'Free Maintenance'].map(col => (
                <th key={col} style={{
                  padding: '12px 14px', textAlign: 'left', color: '#4EAAFF',
                  fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid #1E3A5F',
                  fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase',
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} style={{
                background: i % 2 === 0 ? '#0F1F3D' : '#0d1b35',
                borderBottom: '1px solid #1E3A5F',
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#162a4a'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#0F1F3D' : '#0d1b35'}
              >
                <td style={{ padding: '10px 14px', color: '#4A7BAF' }}>{row.No}</td>
                <td style={{ padding: '10px 14px', color: '#B8D4F0' }}>{row['Jenis Lift']}</td>
                <td style={{ padding: '10px 14px', color: '#B8D4F0', fontWeight: 600 }}>{row['Code Lift']}</td>
                <td style={{ padding: '10px 14px', color: '#B8D4F0', whiteSpace: 'nowrap' }}>{excelDateToString(row['Tgl BAST'])}</td>
                <td style={{ padding: '10px 14px', color: '#FFFFFF', fontWeight: 500 }}>{row['Nama Cust']}</td>
                <td style={{ padding: '10px 14px', color: '#B8D4F0', textAlign: 'center' }}>{row['Masa Garansi ( Days )']}</td>
                <td style={{ padding: '10px 14px', color: '#B8D4F0', textAlign: 'center' }}>{row['Days From BAST']}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                    background: row['Garansi atau Tidak'] === 'Ya' ? 'rgba(46,250,100,.15)' : 'rgba(250,70,70,.15)',
                    color: row['Garansi atau Tidak'] === 'Ya' ? '#2EFA64' : '#FA4646',
                    border: `1px solid ${row['Garansi atau Tidak'] === 'Ya' ? 'rgba(46,250,100,.3)' : 'rgba(250,70,70,.3)'}`,
                  }}>
                    {row['Garansi atau Tidak'] === 'Ya' ? 'Aktif' : 'Tidak'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: '#B8D4F0', textAlign: 'center' }}>{row['Free Maintenance Sisa'] ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}