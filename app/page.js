'use client';
import StatCard from '@/components/StatCard';
import StockTable from '@/components/StockTable';
import LowStockAlert from '@/components/LowStockAlert';
import ReminderWidget from '@/components/ReminderWidget';
import Link from 'next/link';

const stockItems = [
  { name: 'D-Shackle', category: null, qty: 42, maxQty: 50, status: 'IN STOCK' },
  { name: 'Modular E. 300', category: null, qty: 3, maxQty: 50, status: 'LOW STOCK' },
  { name: 'Flexa Par 100', category: 'PPE / Health', qty: 18, maxQty: 50, status: 'IN STOCK' },
  { name: 'Emergency Key', category: 'Swift Parts', qty: 2, maxQty: 50, status: 'LOW STOCK' },
  { name: 'Solarcraft Coil', category: 'Chain Warranty', qty: 0, maxQty: 50, status: 'OUT OF STOCK' },
];

const recentTransactions = [
  { type: 'in',  label: 'Swift S-Hook — Paleo Enclosures',   delta: '+15', time: '6 hours ago' },
  { type: 'out', label: 'Modular E. stock in',               delta: '-3',  time: '5 hours ago' },
  { type: 'in',  label: 'D-Shackle — Forty Cities Pvt Ltd',  delta: '+20', time: 'Yesterday' },
  { type: 'out', label: 'Solarcraft Coil stock in',          delta: '-8',  time: 'Yesterday' },
  { type: 'in',  label: 'Flexa Par 180 — Online Minimum',    delta: '+10', time: '2 days ago' },
];

const categoryStock = [
  { name: 'Swift Parts',         qty: 0,  max: 30 },
  { name: 'Lifting (Purchased)', qty: 0,  max: 30 },
  { name: 'Lifting (ODM)',       qty: 12, max: 30 },
  { name: 'PPE / Health',        qty: 20, max: 30 },
  { name: 'Station Buttons',     qty: 24, max: 30 },
];

const lowStockAlerts = [
  { id: 1, name: 'Swift S-Hook',   quantity: 3, status: 'low' },
  { id: 2, name: 'Modular Elbow',  quantity: 3, status: 'low' },
  { id: 3, name: 'D-Shackle 8mm', quantity: 2, status: 'low' },
  { id: 4, name: 'Chain Warranty', quantity: 0, status: 'out' },
  { id: 5, name: 'Flexa Par 130',  quantity: 1, status: 'low' },
];

// ── Light theme colour tokens ──────────────────────────────────────────────
const C = {
  base:      '#f5f5f5',
  card:      '#ffffff',
  hover:     '#f0f0f0',
  border:    '#e0e0e0',
  borderSoft:'rgba(0,0,0,0.06)',
  red:       '#CC2020',
  redLight:  '#e53535',
  redDim:    'rgba(204,32,32,0.08)',
  teal:      '#1D9E75',
  tealLight: '#16a34a',
  tealDim:   'rgba(29,158,117,0.1)',
  text:      '#111111',
  muted:     '#555555',
  dim:       '#888888',
  green:     '#16a34a',
  greenDim:  'rgba(22,163,74,0.1)',
  amber:     '#d97706',
  amberDim:  'rgba(217,119,6,0.1)',
};

export default function Dashboard() {
  return (
    <div style={{ padding: '0 24px 32px', background: C.base, minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 0 20px',
        borderBottom: `1px solid ${C.border}`,
        marginBottom: '20px',
      }}>
        <div>
          <div style={{ fontSize: '10px', color: C.dim, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Overview
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: C.text, letterSpacing: '-0.3px', margin: 0 }}>
            Dashboard
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/transactions?type=in" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: C.tealDim, border: `1px solid ${C.teal}`,
            color: C.teal, padding: '8px 16px', borderRadius: '8px',
            fontSize: '12px', fontWeight: 600, textDecoration: 'none',
          }}>
            ↓ STOCK IN
          </Link>
          <Link href="/transactions?type=out" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: C.redDim, border: `1px solid rgba(204,32,32,0.3)`,
            color: C.red, padding: '8px 16px', borderRadius: '8px',
            fontSize: '12px', fontWeight: 600, textDecoration: 'none',
          }}>
            ↑ STOCK OUT
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <StatCard label="Total Products" value="18" sublabel="Active lines"   dotColor="green"  />
        <StatCard label="Low Stock"      value="5"  sublabel="Need attention" dotColor="orange" />
        <StatCard label="Out of Stock"   value="2"  sublabel="Depleted items" dotColor="red"    />
        <StatCard label="Transactions"   value="47" sublabel="This month"     dotColor="blue"   />
      </div>

      {/* ── Reminder Widget ── */}
      <div style={{ marginBottom: '12px' }}>
        <ReminderWidget />
      </div>

      {/* ── Middle Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

        <Card title="Current Stock Levels" actionLabel="View All →" actionHref="/products">
          <StockTable items={stockItems} />
        </Card>

        <Card title="Recent Transactions" actionLabel="View All" actionHref="/transactions">
          {recentTransactions.map((tx, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start',
              padding: '10px 0',
              borderBottom: i < recentTransactions.length - 1 ? `1px solid ${C.border}` : 'none',
              gap: '10px',
            }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                marginTop: '4px',
                background: tx.type === 'in' ? C.teal : C.red,
              }} />
              <div style={{ flex: 1, fontSize: '12px', color: C.muted, lineHeight: 1.5 }}>
                <span style={{ color: C.dim, fontWeight: 500, fontSize: '11px' }}>
                  {tx.type === 'in' ? 'In: ' : 'Out: '}
                </span>
                {tx.label}
                <div style={{ fontSize: '10px', color: C.dim, marginTop: '2px' }}>{tx.time}</div>
              </div>
              <span style={{
                fontSize: '13px', fontWeight: 700,
                color: tx.type === 'in' ? C.teal : C.red, flexShrink: 0,
              }}>{tx.delta}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

        <Card title="Stock By Category">
          {categoryStock.map((cat, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < categoryStock.length - 1 ? `1px solid ${C.border}` : 'none',
              gap: '12px',
            }}>
              <div style={{ width: '130px', fontSize: '12px', color: C.muted, flexShrink: 0 }}>{cat.name}</div>
              <div style={{ flex: 1 }}>
                <div style={{ height: '4px', background: C.hover, borderRadius: '4px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
                  <div style={{
                    height: '100%',
                    width: `${(cat.qty / cat.max) * 100}%`,
                    background: cat.qty === 0 ? C.red : C.teal,
                    borderRadius: '4px',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
              <div style={{
                fontSize: '13px', fontWeight: 600,
                color: cat.qty === 0 ? C.red : C.text,
                width: '24px', textAlign: 'right',
              }}>{cat.qty}</div>
            </div>
          ))}
        </Card>

        <Card title="Low Stock Alerts" actionLabel="Manage" actionHref="/products">
          <LowStockAlert alerts={lowStockAlerts} />
        </Card>
      </div>
    </div>
  );
}

// ── Card component ─────────────────────────────────────────────────────────
function Card({ title, actionLabel, actionHref, children }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: '12px',
      padding: '18px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '14px',
      }}>
        <span style={{
          fontSize: '10px', textTransform: 'uppercase',
          letterSpacing: '0.12em', color: C.dim, fontWeight: 600,
        }}>{title}</span>
        {actionLabel && (
          <Link href={actionHref || '#'} style={{
            fontSize: '11px', color: C.red, textDecoration: 'none', fontWeight: 600,
          }}>{actionLabel}</Link>
        )}
      </div>
      {children}
    </div>
  );
}