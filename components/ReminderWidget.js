'use client';

// components/ReminderWidget.js
// Widget reminder maintenance untuk ditempel di dashboard
// Usage: <ReminderWidget />

import { useEffect, useState } from 'react';
import Link from 'next/link';

const ALERT_COLOR = {
  overdue: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  today:   { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
  urgent:  { bg: '#ffedd5', color: '#c2410c', dot: '#f97316' },
  warning: { bg: '#fef9c3', color: '#854d0e', dot: '#eab308' },
  info:    { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  none:    { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
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
    <div style={widgetStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>🔔</span>
        <span style={{ fontWeight: 700, fontSize: 13 }}>Reminder Maintenance</span>
      </div>
      <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>✅ Tidak ada maintenance yang akan jatuh tempo dalam 14 hari.</p>
    </div>
  );

  const shown = expanded ? reminders : reminders.slice(0, 4);

  return (
    <div style={widgetStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔔</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Reminder Maintenance</span>
          <span style={{
            background: '#ef4444', color: '#fff',
            borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700,
          }}>{reminders.length}</span>
        </div>
        <Link href="/maintenance" style={{ fontSize: 11, color: '#2563eb', textDecoration: 'none' }}>
          Lihat Semua →
        </Link>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {shown.map(r => {
          const c = ALERT_COLOR[r.alertType] || ALERT_COLOR.none;
          return (
            <div key={r._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 8, background: c.bg }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, flexShrink: 0, marginTop: 4 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{r.namaCustomer}</span>
                  <span style={{ color: c.color, fontSize: 11, fontWeight: 700 }}>{r.alertLabel}</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  {r.kota}{r.namaUnit ? ` · ${r.namaUnit}` : ''}
                  {r.noHP ? ` · 📱 ${r.noHP}` : ''}
                </div>
              </div>
              <Link href={`/maintenance/${r._id}`}
                style={{ fontSize: 11, color: '#2563eb', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2 }}>
                Detail
              </Link>
            </div>
          );
        })}
      </div>

      {reminders.length > 4 && (
        <button
          onClick={() => setExpanded(p => !p)}
          style={{ marginTop: 10, width: '100%', padding: '6px', borderRadius: 7, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 12, cursor: 'pointer' }}
        >
          {expanded ? '▲ Sembunyikan' : `▼ Lihat ${reminders.length - 4} lainnya`}
        </button>
      )}
    </div>
  );
}

const widgetStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: '16px 18px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
};