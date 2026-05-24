'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function MaintenanceReminderWidget() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetch('/api/maintenance?reminder=true')
      .then(r => r.json())
      .then(d => {
        setReminders(d.data || [])
        setLoading(false)
      })
  }, [])

  if (loading) return null
  if (reminders.length === 0) return null

  return (
    <div className="reminder-widget">
      <div className="reminder-title">
        🔔 Reminder Maintenance
        <Link href="/maintenance?reminder=true" className="see-all">Lihat semua →</Link>
      </div>
      <div className="reminder-list">
        {reminders.slice(0, 5).map((c) => (
          <div key={c._id} className={`reminder-item ${c.daysUntilNextVisit < 0 ? 'overdue' : 'soon'}`}>
            <div className="reminder-customer">{c.customerName}</div>
            <div className="reminder-meta">{c.kota} · {c.unitType}</div>
            <div className={`reminder-days ${c.daysUntilNextVisit < 0 ? 'text-danger' : 'text-warning'}`}>
              {c.daysUntilNextVisit < 0
                ? `Terlambat ${Math.abs(c.daysUntilNextVisit)} hari`
                : `${c.daysUntilNextVisit} hari lagi`}
            </div>
          </div>
        ))}
      </div>
      {reminders.length > 5 && (
        <Link href="/maintenance?reminder=true" className="more-link">
          +{reminders.length - 5} customer lainnya
        </Link>
      )}

      <style jsx>{`
        .reminder-widget {
          background: #fffbea;
          border: 1px solid #fcd34d;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 1.5rem;
        }
        .reminder-title {
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .see-all { font-size: 0.8rem; color: #b45309; text-decoration: none; }
        .reminder-list { display: flex; flex-direction: column; gap: 6px; }
        .reminder-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          border-radius: 6px;
          padding: 7px 10px;
          border: 1px solid #fde68a;
          font-size: 0.82rem;
          flex-wrap: wrap;
          gap: 4px;
        }
        .reminder-item.overdue { border-color: #fca5a5; background: #fff5f5; }
        .reminder-customer { font-weight: 500; }
        .reminder-meta { color: #888; font-size: 0.75rem; }
        .reminder-days { font-weight: 600; font-size: 0.78rem; }
        .text-warning { color: #92400e; }
        .text-danger  { color: #b91c1c; }
        .more-link { display: block; text-align: center; margin-top: 8px; font-size: 0.8rem; color: #b45309; text-decoration: none; }
      `}</style>
    </div>
  )
}