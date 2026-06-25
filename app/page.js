'use client';
import { useState, useEffect } from 'react';
import StockTable from '@/components/StockTable';
import LowStockAlert from '@/components/LowStockAlert';
import ReminderWidget from '@/components/ReminderWidget';
import Link from 'next/link';

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

const stockItems = [
  { name: 'D-Shackle',       category: null,             qty: 42, maxQty: 50, status: 'IN STOCK' },
  { name: 'Modular E. 300',  category: null,             qty: 3,  maxQty: 50, status: 'LOW STOCK' },
  { name: 'Flexa Par 100',   category: 'PPE / Health',   qty: 18, maxQty: 50, status: 'IN STOCK' },
  { name: 'Emergency Key',   category: 'Swift Parts',    qty: 2,  maxQty: 50, status: 'LOW STOCK' },
  { name: 'Solarcraft Coil', category: 'Chain Warranty', qty: 0,  maxQty: 50, status: 'OUT OF STOCK' },
];

const lowStockAlerts = [
  { id: 1, name: 'Swift S-Hook',   quantity: 3, status: 'low' },
  { id: 2, name: 'Modular Elbow',  quantity: 3, status: 'low' },
  { id: 3, name: 'D-Shackle 8mm', quantity: 2, status: 'low' },
  { id: 4, name: 'Chain Warranty', quantity: 0, status: 'out' },
  { id: 5, name: 'Flexa Par 130',  quantity: 1, status: 'low' },
];

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

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Mini list card used for the 4 top cards ───────────────────────────────────
function MiniCard({ title, color, dotColor, href, children, actionLabel = 'View All' }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* colour top bar */}
      <div style={{ height: '3px', background: color }} />
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: C.dim, fontWeight: 700 }}>
              {title}
            </span>
          </div>
          {href && (
            <Link href={href} style={{ fontSize: '10px', color: C.red, textDecoration: 'none', fontWeight: 600 }}>
              {actionLabel} →
            </Link>
          )}
        </div>
        {/* content */}
        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '160px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Row inside a mini card ────────────────────────────────────────────────────
function MiniRow({ left, right, sub, dot, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 0',
      borderBottom: last ? 'none' : `1px solid ${C.border}`,
      gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
        {dot && (
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '11.5px', fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {left}
          </div>
          {sub && <div style={{ fontSize: '9.5px', color: C.dim, marginTop: '1px' }}>{sub}</div>}
        </div>
      </div>
      <div style={{ fontSize: '10px', color: C.dim, flexShrink: 0, whiteSpace: 'nowrap' }}>{right}</div>
    </div>
  );
}

// ── Low stock badge row ───────────────────────────────────────────────────────
function LowRow({ name, qty, status, last }) {
  const isOut  = status === 'out' || qty === 0;
  const color  = isOut ? C.red : C.amber;
  const label  = isOut ? 'OUT' : 'LOW';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '7px 0',
      borderBottom: last ? 'none' : `1px solid ${C.border}`,
    }}>
      <div>
        <div style={{ fontSize: '11.5px', fontWeight: 600, color: C.text }}>{name}</div>
        <div style={{ fontSize: '9.5px', color: C.dim, marginTop: '1px' }}>Qty: {qty} remaining</div>
      </div>
      <span style={{
        fontSize: '9px', fontWeight: 700, padding: '3px 7px',
        borderRadius: '20px', letterSpacing: '0.08em',
        background: isOut ? C.redDim : C.amberDim,
        color,
        border: `1px solid ${isOut ? 'rgba(204,32,32,0.2)' : 'rgba(217,119,6,0.25)'}`,
      }}>{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const [products,  setProducts]  = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors,   setVendors]   = useState([]);
  const [lowStock,  setLowStock]  = useState(lowStockAlerts);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, cRes, vRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/maintenance'),
          fetch('/api/vendors').catch(() => null),
        ]);

        const pJson = await pRes.json();
        const cJson = await cRes.json();

        const prods = pJson.data || pJson.products || [];
        const custs = cJson.data || cJson.customers || cJson || [];

        setProducts(Array.isArray(prods) ? prods.slice(0, 6) : []);
        setCustomers(Array.isArray(custs) ? custs.slice(0, 6) : []);

        // vendors — optional endpoint
        if (vRes && vRes.ok) {
          const vJson = await vRes.json();
          const vends = vJson.data || vJson.vendors || vJson || [];
          setVendors(Array.isArray(vends) ? vends.slice(0, 6) : []);
        }

        // low stock from products
        const lowProds = prods.filter(p => (p.quantity ?? p.stock ?? 0) <= (p.minStock ?? p.lowStockThreshold ?? 5));
        if (lowProds.length > 0) {
          setLowStock(lowProds.slice(0, 5).map((p, i) => ({
            id: p._id || i,
            name: p.name,
            quantity: p.quantity ?? p.stock ?? 0,
            status: (p.quantity ?? p.stock ?? 0) === 0 ? 'out' : 'low',
          })));
        }
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: '0 24px 32px', background: C.base, minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '32px 0 20px',
        borderBottom: `1px solid ${C.border}`,
        marginBottom: '20px',
        position: 'relative',
      }}>
        <h1 style={{
          fontSize: '40px', fontWeight: 700, color: C.text,
          letterSpacing: '-0.5px', margin: 0,
          fontFamily: "var(--font-cormorant), serif",
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        }}>
          Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
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

      {/* ── 4 Content Cards (replacing stat cards) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>

        {/* 1 — Products */}
        <MiniCard title="Products" color={C.teal} href="/products" actionLabel="View All">
          {loading ? (
            <div style={{ fontSize: '11px', color: C.dim, padding: '8px 0' }}>Loading...</div>
          ) : products.length === 0 ? (
            <div style={{ fontSize: '11px', color: C.dim, padding: '8px 0' }}>No products found.</div>
          ) : products.map((p, i) => (
            <MiniRow
              key={p._id || i}
              left={p.name}
              sub={p.category || p.tipeItem || '—'}
              right={fmt(p.createdAt)}
              last={i === products.length - 1}
            />
          ))}
        </MiniCard>

        {/* 2 — Recent Customers */}
        <MiniCard title="Recent Customers" color="#3b82f6" href="/maintenance" actionLabel="View All">
          {loading ? (
            <div style={{ fontSize: '11px', color: C.dim, padding: '8px 0' }}>Loading...</div>
          ) : customers.length === 0 ? (
            <div style={{ fontSize: '11px', color: C.dim, padding: '8px 0' }}>No customers found.</div>
          ) : customers.map((c, i) => (
            <MiniRow
              key={c._id || i}
              left={c.customerName || c.name || '—'}
              sub={c.kota || c.address || '—'}
              right={fmt(c.createdAt)}
              dot="#3b82f6"
              last={i === customers.length - 1}
            />
          ))}
        </MiniCard>

        {/* 3 — Vendors */}
        <MiniCard title="Vendors" color={C.amber} href="/vendors" actionLabel="View All">
          {loading ? (
            <div style={{ fontSize: '11px', color: C.dim, padding: '8px 0' }}>Loading...</div>
          ) : vendors.length === 0 ? (
            /* fallback static list if no /api/vendors endpoint */
            [
              { name: 'Paleo Enclosures',   type: 'Supplier' },
              { name: 'Forty Cities Pvt Ltd', type: 'Distributor' },
              { name: 'Online Minimum',      type: 'Online' },
            ].map((v, i, arr) => (
              <MiniRow
                key={i}
                left={v.name}
                sub={v.type}
                dot={C.amber}
                last={i === arr.length - 1}
              />
            ))
          ) : vendors.map((v, i) => (
            <MiniRow
              key={v._id || i}
              left={v.name || v.vendorName || '—'}
              sub={v.type || v.category || '—'}
              dot={C.amber}
              last={i === vendors.length - 1}
            />
          ))}
        </MiniCard>

        {/* 4 — Low Stock Alerts */}
        <MiniCard title="Low Stock Alerts" color={C.red} href="/products" actionLabel="Manage">
          {lowStock.length === 0 ? (
            <div style={{ fontSize: '11px', color: C.dim, padding: '8px 0' }}>All stock levels OK.</div>
          ) : lowStock.map((a, i) => (
            <LowRow
              key={a.id}
              name={a.name}
              qty={a.quantity}
              status={a.status}
              last={i === lowStock.length - 1}
            />
          ))}
        </MiniCard>

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