'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const ALERT_COLOR = {
  overdue: { bg: '#3b1212', color: '#f87171', dot: '#ef4444' },
  today:   { bg: '#3b1212', color: '#f87171', dot: '#ef4444' },
  urgent:  { bg: '#2d1a0e', color: '#fb923c', dot: '#f97316' },
  warning: { bg: '#2a2306', color: '#fbbf24', dot: '#eab308' },
  info:    { bg: '#0e1f35', color: '#60a5fa', dot: '#3b82f6' },
  none:    { bg: '#2a2925', color: '#a8a498', dot: '#64748b' },
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
    <div style={{ background: '#1e1d19', border: '1px solid #2a2925', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 14 }}>🔔</span>
      <span style={{ fontSize: '11px', color: '#4caf7a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Tidak ada maintenance yang jatuh tempo dalam 14 hari
      </span>
    </div>
  );

  const shown = expanded ? reminders : reminders.slice(0, 3);

  return (
    <div style={{ background: '#1e1d19', border: '1px solid #2a2925', borderRadius: '6px', padding: '14px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>🔔</span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#8a8678', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Reminder Maintenance
          </span>
          <span style={{ background: '#e05050', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
            {reminders.length}
          </span>
        </div>
        <Link href="/maintenance" style={{ fontSize: '9px', color: '#c9a84c', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Lihat Semua →
        </Link>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {shown.map(r => {
          const c = ALERT_COLOR[r.alertType] || ALERT_COLOR.none;
          return (
            <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 5, background: c.bg }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 12, color: '#e8e4d9' }}>{r.namaCustomer}</span>
                <span style={{ color: c.color, fontSize: 11, fontWeight: 700, marginLeft: 8 }}>{r.alertLabel}</span>
                <div style={{ fontSize: 10, color: '#5a5850', marginTop: 1 }}>
                  {r.kota}{r.namaUnit ? ` · ${r.namaUnit}` : ''}{r.noHP ? ` · 📱 ${r.noHP}` : ''}
                </div>
              </div>
              <Link href={`/maintenance/${r._id}`} style={{ fontSize: 10, color: '#c9a84c', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Detail
              </Link>
            </div>
          );
        })}
      </div>

      {reminders.length > 3 && (
        <button
          onClick={() => setExpanded(p => !p)}
          style={{ marginTop: 8, width: '100%', padding: '5px', borderRadius: 4, border: '1px solid #2a2925', background: 'transparent', color: '#5a5850', fontSize: 11, cursor: 'pointer' }}
        >
          {expanded ? '▲ Sembunyikan' : `▼ Lihat ${reminders.length - 3} lainnya`}
        </button>
      )}
    </div>
  );
}