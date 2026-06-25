'use client';
import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import LowStockAlert from '@/components/LowStockAlert';
import ReminderWidget from '@/components/ReminderWidget';
import Link from 'next/link';

const lowStockAlertsFallback = [
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
  red:       '#CC2020',
  redDim:    'rgba(204,32,32,0.08)',
  teal:      '#1D9E75',
  tealDim:   'rgba(29,158,117,0.1)',
  text:      '#111111',
  muted:     '#555555',
  dim:       '#888888',
  amber:     '#d97706',
  amberDim:  'rgba(217,119,6,0.1)',
  blue:      '#3b82f6',
  blueDim:   'rgba(59,130,246,0.1)',
};

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Content card shell ────────────────────────────────────────────────────────
function ContentCard({ title, color, href, actionLabel = 'View All', children }) {
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
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: color, display: 'inline-block', flexShrink: 0,
            }} />
            <span style={{
              fontSize: '10px', textTransform: 'uppercase',
              letterSpacing: '0.12em', color: C.dim, fontWeight: 700,
            }}>{title}</span>
          </div>
          {href && (
            <Link href={href} style={{
              fontSize: '11px', color: C.red, textDecoration: 'none', fontWeight: 600,
            }}>{actionLabel} →</Link>
          )}
        </div>
        {/* scrollable list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Generic list row ──────────────────────────────────────────────────────────
function ListRow({ primary, secondary, right, dot, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '9px 0',
      borderBottom: last ? 'none' : `1px solid ${C.border}`,
      gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
        {dot && (
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: dot, flexShrink: 0,
          }} />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: '12px', fontWeight: 600, color: C.text,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{primary}</div>
          {secondary && (
            <div style={{ fontSize: '10px', color: C.dim, marginTop: '1px' }}>{secondary}</div>
          )}
        </div>
      </div>
      {right && (
        <div style={{ fontSize: '10px', color: C.dim, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {right}
        </div>
      )}
    </div>
  );
}

// ── Low stock row ─────────────────────────────────────────────────────────────
function LowRow({ name, qty, status, last }) {
  const isOut = status === 'out' || qty === 0;
  const color = isOut ? C.red : C.amber;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '9px 0',
      borderBottom: last ? 'none' : `1px solid ${C.border}`,
    }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{name}</div>
        <div style={{ fontSize: '10px', color: C.dim, marginTop: '1px' }}>Qty: {qty} remaining</div>
      </div>
      <span style={{
        fontSize: '9px', fontWeight: 700, padding: '3px 8px',
        borderRadius: '20px', letterSpacing: '0.08em',
        background: isOut ? C.redDim : C.amberDim,
        color,
        border: `1px solid ${isOut ? 'rgba(204,32,32,0.25)' : 'rgba(217,119,6,0.3)'}`,
      }}>{isOut ? 'OUT' : 'LOW'}</span>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ fontSize: '11px', color: C.dim, padding: '12px 0', textAlign: 'center' }}>
      {text}
    </div>
  );
}

export default function Dashboard() {
  const [products,   setProducts]   = useState([]);
  const [customers,  setCustomers]  = useState([]);
  const [vendors,    setVendors]    = useState([]);
  const [lowStock,   setLowStock]   = useState(lowStockAlertsFallback);
  const [stats,      setStats]      = useState({ total: 0, lowStock: 0, outOfStock: 0, transactions: 0 });
  const [loading,    setLoading]    = useState(true);

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
        const custs = cJson.data || cJson.customers || (Array.isArray(cJson) ? cJson : []);

        // stats
        const low  = prods.filter(p => {
          const q = p.quantity ?? p.stock ?? 0;
          const t = p.minStock ?? p.lowStockThreshold ?? 5;
          return q > 0 && q <= t;
        });
        const out  = prods.filter(p => (p.quantity ?? p.stock ?? 0) === 0);
        setStats({ total: prods.length, lowStock: low.length, outOfStock: out.length, transactions: 47 });

        // sort newest first
        const sorted = [...prods].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(sorted.slice(0, 7));

        const custSorted = [...custs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCustomers(custSorted.slice(0, 7));

        // low stock list
        const lowProds = [...low, ...out];
        if (lowProds.length > 0) {
          setLowStock(lowProds.slice(0, 6).map((p, i) => ({
            id: p._id || i,
            name: p.name,
            quantity: p.quantity ?? p.stock ?? 0,
            status: (p.quantity ?? p.stock ?? 0) === 0 ? 'out' : 'low',
          })));
        }

        // vendors
        if (vRes && vRes.ok) {
          const vJson = await vRes.json();
          const vends = vJson.data || vJson.vendors || (Array.isArray(vJson) ? vJson : []);
          setVendors(vends.slice(0, 7));
        } else {
          // static fallback
          setVendors([
            { _id: '1', name: 'Paleo Enclosures',    type: 'Supplier' },
            { _id: '2', name: 'Forty Cities Pvt Ltd', type: 'Distributor' },
            { _id: '3', name: 'Online Minimum',       type: 'Online' },
          ]);
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
          }}>↓ STOCK IN</Link>
          <Link href="/transactions?type=out" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: C.redDim, border: `1px solid rgba(204,32,32,0.3)`,
            color: C.red, padding: '8px 16px', borderRadius: '8px',
            fontSize: '12px', fontWeight: 600, textDecoration: 'none',
          }}>↑ STOCK OUT</Link>
        </div>
      </div>

      {/* ── Stat Cards (unchanged) ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <StatCard label="Total Products" value={String(stats.total || 18)} sublabel="Active lines"   dotColor="green"  />
        <StatCard label="Low Stock"      value={String(stats.lowStock || 5)}  sublabel="Need attention" dotColor="orange" />
        <StatCard label="Out of Stock"   value={String(stats.outOfStock || 2)} sublabel="Depleted items" dotColor="red"    />
        <StatCard label="Transactions"   value={String(stats.transactions)}    sublabel="This month"     dotColor="blue"   />
      </div>

      {/* ── Reminder Widget (unchanged) ── */}
      <div style={{ marginBottom: '16px' }}>
        <ReminderWidget />
      </div>

      {/* ── 4 Content Cards (replacing the old bottom panels) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>

        {/* 1 — Products */}
        <ContentCard title="Products" color={C.teal} href="/products">
          {loading ? <Empty text="Loading..." /> :
           products.length === 0 ? <Empty text="No products found." /> :
           products.map((p, i) => (
            <ListRow
              key={p._id || i}
              primary={p.name}
              secondary={p.category || p.tipeItem || '—'}
              right={fmt(p.createdAt)}
              last={i === products.length - 1}
            />
          ))}
        </ContentCard>

        {/* 2 — Recent Customers */}
        <ContentCard title="Recent Customers" color={C.blue} href="/maintenance">
          {loading ? <Empty text="Loading..." /> :
           customers.length === 0 ? <Empty text="No customers found." /> :
           customers.map((c, i) => (
            <ListRow
              key={c._id || i}
              primary={c.customerName || c.name || '—'}
              secondary={c.kota || c.address || '—'}
              right={fmt(c.createdAt)}
              dot={C.blue}
              last={i === customers.length - 1}
            />
          ))}
        </ContentCard>

        {/* 3 — Vendors */}
        <ContentCard title="Vendors" color={C.amber} href="/vendors">
          {loading ? <Empty text="Loading..." /> :
           vendors.map((v, i) => (
            <ListRow
              key={v._id || i}
              primary={v.name || v.vendorName || '—'}
              secondary={v.type || v.category || '—'}
              dot={C.amber}
              last={i === vendors.length - 1}
            />
          ))}
        </ContentCard>

        {/* 4 — Low Stock Alerts */}
        <ContentCard title="Low Stock Alerts" color={C.red} href="/products" actionLabel="Manage">
          {lowStock.length === 0
            ? <Empty text="All stock levels OK." />
            : lowStock.map((a, i) => (
              <LowRow
                key={a.id}
                name={a.name}
                qty={a.quantity}
                status={a.status}
                last={i === lowStock.length - 1}
              />
            ))}
        </ContentCard>

      </div>
    </div>
  );
}