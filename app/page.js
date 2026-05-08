'use client';
import StatCard from '@/components/StatCard';
import StockTable from '@/components/StockTable';
import LowStockAlert from '@/components/LowStockAlert';
import Link from 'next/link';

const stockItems = [
  { name: 'D-Shackle', category: null, qty: 42, maxQty: 50, status: 'IN STOCK' },
  { name: 'Modular E. 300', category: null, qty: 3, maxQty: 50, status: 'LOW STOCK' },
  { name: 'Flexa Par 100', category: 'PPE / Health', qty: 18, maxQty: 50, status: 'IN STOCK' },
  { name: 'Emergency Key', category: 'Swift Parts', qty: 2, maxQty: 50, status: 'LOW STOCK' },
  { name: 'Solarcraft Coil', category: 'Chain Warranty', qty: 0, maxQty: 50, status: 'OUT OF STOCK' },
];

const recentTransactions = [
  { type: 'in', label: 'Swift S-Hook — Paleo Enclosures', delta: '+15', time: '6 hours ago' },
  { type: 'out', label: 'Modular E. stock in', delta: '-3', time: '5 hours ago' },
  { type: 'in', label: 'D-Shackle — Forty Cities Pvt Ltd', delta: '+20', time: 'Yesterday' },
  { type: 'out', label: 'Solarcraft Coil stock in', delta: '-8', time: 'Yesterday' },
  { type: 'in', label: 'Flexa Par 180 — Online Minimum', delta: '+10', time: '2 days ago' },
];

const categoryStock = [
  { name: 'Swift Parts', qty: 0, max: 30 },
  { name: 'Lifting (Purchased)', qty: 0, max: 30 },
  { name: 'Lifting (ODM)', qty: 12, max: 30 },
  { name: 'PPE / Health', qty: 20, max: 30 },
  { name: 'Station Buttons', qty: 24, max: 30 },
];

const lowStockAlerts = [
  {
    id: 1,
    name: 'Swift S-Hook',
    quantity: 3,
    status: 'low',
  },
  {
    id: 2,
    name: 'Modular Elbow',
    quantity: 3,
    status: 'low',
  },
  {
    id: 3,
    name: 'D-Shackle 8mm',
    quantity: 2,
    status: 'low',
  },
  {
    id: 4,
    name: 'Chain Warranty',
    quantity: 0,
    status: 'out',
  },
  {
    id: 5,
    name: 'Flexa Par 130',
    quantity: 1,
    status: 'low',
  },
];

export default function Dashboard() {
  return (
    <div style={{ padding: '0 24px 32px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 0 20px',
        borderBottom: '1px solid #2a2925',
        marginBottom: '20px',
      }}>
        <div>
          <div style={{ fontSize: '9px', color: '#5a5850', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2px' }}>Overview</div>
          <h1 style={{ fontSize: '24px', fontFamily: 'Space Mono, monospace', fontWeight: 700, color: '#e8e4d9', letterSpacing: '-0.5px' }}>Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/transactions?type=in" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#1e1d19', border: '1px solid #333230',
            color: '#e8e4d9', padding: '8px 14px', borderRadius: '5px',
            fontSize: '12px', fontWeight: 600, textDecoration: 'none',
            cursor: 'pointer',
          }}>
            <span style={{ fontSize: '10px' }}>↓</span> STOCK IN
          </Link>
          <Link href="/transactions?type=out" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#1e1d19', border: '1px solid #333230',
            color: '#e8e4d9', padding: '8px 14px', borderRadius: '5px',
            fontSize: '12px', fontWeight: 600, textDecoration: 'none',
          }}>
            <span style={{ fontSize: '10px' }}>↑</span> STOCK OUT
          </Link>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <StatCard label="Total Products" value="18" sublabel="Active lines" dotColor="green" />
        <StatCard label="Low Stock" value="5" sublabel="Need attention" dotColor="orange" />
        <StatCard label="Out of Stock" value="2" sublabel="Depleted items" dotColor="red" />
        <StatCard label="Transactions" value="47" sublabel="This month" dotColor="blue" />
      </div>

      {/* Middle Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        {/* Current Stock Levels */}
        <Card title="Current Stock Levels" actionLabel="View All →" actionHref="/products">
          <StockTable items={stockItems} />
        </Card>

        {/* Recent Transactions */}
        <Card title="Recent Transactions" actionLabel="View All" actionHref="/transactions">
          <div>
            {recentTransactions.map((tx, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '9px 0',
                borderBottom: i < recentTransactions.length - 1 ? '1px solid #222120' : 'none',
                gap: '8px',
              }}>
                <span style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: tx.type === 'in' ? '#4caf7a' : '#e05050',
                  marginTop: '4px',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, fontSize: '11px', color: '#a8a498', lineHeight: 1.4 }}>
                  <span style={{ color: '#8a8678', fontWeight: 500, fontSize: '10px' }}>
                    {tx.type === 'in' ? 'In: ' : 'Out: '}
                  </span>
                  {tx.label}
                  <div style={{ fontSize: '9px', color: '#4a4840', marginTop: '1px' }}>{tx.time}</div>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontFamily: 'Space Mono, monospace',
                  fontWeight: 700,
                  color: tx.type === 'in' ? '#4caf7a' : '#e05050',
                  flexShrink: 0,
                }}>{tx.delta}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Stock By Category */}
        <Card title="Stock By Category">
          <div>
            {categoryStock.map((cat, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '9px 0',
                borderBottom: i < categoryStock.length - 1 ? '1px solid #222120' : 'none',
                gap: '10px',
              }}>
                <div style={{ width: '120px', fontSize: '12px', color: '#a8a498' }}>{cat.name}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    height: '3px', background: '#2a2925', borderRadius: '2px', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(cat.qty / cat.max) * 100}%`,
                      background: '#c9a84c',
                      borderRadius: '2px',
                    }} />
                  </div>
                </div>
                <div style={{
                  fontSize: '13px',
                  fontFamily: 'Space Mono, monospace',
                  color: '#e8e4d9',
                  width: '20px',
                  textAlign: 'right',
                }}>{cat.qty}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card title="Low Stock Alerts" actionLabel="Manage" actionHref="/products">
          <LowStockAlert alerts={lowStockAlerts} />
        </Card>
      </div>
    </div>
  );
}

function Card({ title, actionLabel, actionHref, children }) {
  return (
    <div style={{
      background: '#1e1d19',
      border: '1px solid #2a2925',
      borderRadius: '6px',
      padding: '16px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <span style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#8a8678',
          fontWeight: 600,
        }}>{title}</span>
        {actionLabel && (
          <Link href={actionHref || '#'} style={{
            fontSize: '9px',
            color: '#c9a84c',
            textDecoration: 'none',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>{actionLabel}</Link>
        )}
      </div>
      {children}
    </div>
  );
}