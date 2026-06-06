'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const ALERT_COLOR = {
  overdue: { bg: 'rgba(204,32,32,0.08)',  color: '#CC2020', dot: '#CC2020',  border: 'rgba(204,32,32,0.2)' },
  today:   { bg: 'rgba(204,32,32,0.08)',  color: '#CC2020', dot: '#CC2020',  border: 'rgba(204,32,32,0.2)' },
  urgent:  { bg: 'rgba(217,119,6,0.08)',  color: '#d97706', dot: '#d97706',  border: 'rgba(217,119,6,0.2)' },
  warning: { bg: 'rgba(202,138,4,0.08)',  color: '#a16207', dot: '#ca8a04',  border: 'rgba(202,138,4,0.2)' },
  info:    { bg: 'rgba(59,130,246,0.08)', color: '#2563eb', dot: '#3b82f6',  border: 'rgba(59,130,246,0.2)' },
  none:    { bg: '#f5f5f5',               color: '#888888', dot: '#aaaaaa',  border: '#e0e0e0' },
};

export default function ReminderWidget() {
  const [reminders, setReminders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(false);

  useEffect(() => {
    fetch('/api/maintenance/reminders')
      .then(r => r.json())
      .then(json => { if (json.success) setReminders(json.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (reminders.length === 0) return (
    <div style={{
      background: '#ffffff', border: '1px solid #e0e0e0',
      borderRadius: '8px', padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <span style={{ fontSize: 14 }}>🔔</span>
      <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Tidak ada maintenance yang jatuh tempo dalam 14 hari
      </span>
    </div>
  );

  const shown = expanded ? reminders : reminders.slice(0, 3);

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e0e0e0',
      borderRadius: '8px', padding: '14px 16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🔔</span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Reminder Maintenance
          </span>
          <span style={{ background: '#CC2020', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
            {reminders.length}
          </span>
        </div>
        <Link href="/maintenance" style={{ fontSize: '9px', color: '#CC2020', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Lihat Semua →
        </Link>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {shown.map(r => {
          const c = ALERT_COLOR[r.alertType] || ALERT_COLOR.none;
          return (
            <div key={r._id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px', borderRadius: 6,
              background: c.bg, border: `1px solid ${c.border}`,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 12, color: '#111111' }}>{r.namaCustomer}</span>
                <span style={{ color: c.color, fontSize: 11, fontWeight: 700, marginLeft: 8 }}>{r.alertLabel}</span>
                <div style={{ fontSize: 10, color: '#888888', marginTop: 1 }}>
                  {r.kota}{r.namaUnit ? ` · ${r.namaUnit}` : ''}{r.noHP ? ` · 📱 ${r.noHP}` : ''}
                </div>
              </div>
              <Link href={`/maintenance/${r._id}`} style={{ fontSize: 10, color: '#CC2020', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Detail
              </Link>
            </div>
          );
        })}
      </div>

      {reminders.length > 3 && (
        <button
          onClick={() => setExpanded(p => !p)}
          style={{
            marginTop: 8, width: '100%', padding: '5px',
            borderRadius: 4, border: '1px solid #e0e0e0',
            background: 'transparent', color: '#888888',
            fontSize: 11, cursor: 'pointer',
          }}
        >
          {expanded ? '▲ Sembunyikan' : `▼ Lihat ${reminders.length - 3} lainnya`}
        </button>
      )}
    </div>
  );
}