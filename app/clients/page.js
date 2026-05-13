'use client';

import { useEffect, useState } from 'react';

export default function ClientsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ padding: '40px', color: '#B8D4F0', fontFamily: "'Sora', sans-serif" }}>
      Loading Data Garansi...
    </div>
  );

  if (error) return (
    <div style={{ padding: '40px', color: '#ff6b6b', fontFamily: "'Sora', sans-serif" }}>
      Error: {error}
    </div>
  );

  return (
    <div style={{ padding: '32px', fontFamily: "'Sora', sans-serif" }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#FFFFFF', marginBottom: '24px' }}>
        Client Details — Data Garansi
      </h1>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#1A3A5C' }}>
              {['No','Jenis Lift','Code Lift','Tgl BAST','Nama Cust','Masa Garansi (Days)','Days From BAST','Garansi atau Tidak','Free Maintenance Sisa'].map(col => (
                <th key={col} style={{ padding: '10px 14px', textAlign: 'left', color: '#4EAAFF', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid #1E3A5F' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#0F1F3D' : '#0d1b35', borderBottom: '1px solid #1E3A5F' }}>
                <td style={{ padding: '9px 14px', color: '#B8D4F0' }}>{row.No}</td>
                <td style={{ padding: '9px 14px', color: '#B8D4F0' }}>{row['Jenis Lift']}</td>
                <td style={{ padding: '9px 14px', color: '#B8D4F0' }}>{row['Code Lift']}</td>
                <td style={{ padding: '9px 14px', color: '#B8D4F0', whiteSpace: 'nowrap' }}>{row['Tgl BAST']}</td>
                <td style={{ padding: '9px 14px', color: '#B8D4F0' }}>{row['Nama Cust']}</td>
                <td style={{ padding: '9px 14px', color: '#B8D4F0', textAlign: 'center' }}>{row['Masa Garansi ( Days )']}</td>
                <td style={{ padding: '9px 14px', color: '#B8D4F0', textAlign: 'center' }}>{row['Days From BAST']}</td>
                <td style={{ padding: '9px 14px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                    background: row['Garansi atau Tidak'] === 'Ya' ? 'rgba(46,250,100,.15)' : 'rgba(250,46,46,.15)',
                    color: row['Garansi atau Tidak'] === 'Ya' ? '#2EFA64' : '#FA4646',
                  }}>
                    {row['Garansi atau Tidak']}
                  </span>
                </td>
                <td style={{ padding: '9px 14px', color: '#B8D4F0', textAlign: 'center' }}>{row['Free Maintenance Sisa'] ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}