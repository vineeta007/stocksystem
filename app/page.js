'use client';
import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import ReminderWidget from '@/components/ReminderWidget';
import Link from 'next/link';

// ── Module-level cache — survives tab switches, cleared on page refresh ────────
const _cache = {
  products:  null,
  customers: null,
  vendors:   null,
  lowStock:  null,
  stats:     null,
};

const vendorFallback = [
  { _id: '1', name: 'Paleo Enclosures',     type: 'Supplier' },
  { _id: '2', name: 'Forty Cities Pvt Ltd', type: 'Distributor' },
  { _id: '3', name: 'Online Minimum',       type: 'Online' },
];

const C = {
  base:    '#f5f5f5',
  card:    '#ffffff',
  border:  '#e0e0e0',
  red:     '#CC2020',
  redDim:  'rgba(204,32,32,0.08)',
  teal:    '#1D9E75',
  tealDim: 'rgba(29,158,117,0.1)',
  text:    '#111111',
  dim:     '#888888',
  amber:   '#d97706',
  amberDim:'rgba(217,119,6,0.1)',
  blue:    '#3b82f6',
};

function fmt(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ContentCard({ title, color, href, actionLabel = 'View All', children }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: '12px', overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ height: '3px', background: color }} />
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: C.dim, fontWeight: 700 }}>
              {title}
            </span>
          </div>
          {href && (
            <Link href={href} style={{ fontSize: '11px', color: C.red, textDecoration: 'none', fontWeight: 600 }}>
              {actionLabel} →
            </Link>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

function ListRow({ primary, secondary, right, dot, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '9px 0',
      borderBottom: last ? 'none' : `1px solid ${C.border}`,
      gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
        {dot && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot, flexShrink: 0 }} />}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {primary}
          </div>
          {secondary && <div style={{ fontSize: '10px', color: C.dim, marginTop: '1px' }}>{secondary}</div>}
        </div>
      </div>
      {right && <div style={{ fontSize: '10px', color: C.dim, flexShrink: 0, whiteSpace: 'nowrap' }}>{right}</div>}
    </div>
  );
}

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
        fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
        letterSpacing: '0.08em',
        background: isOut ? C.redDim : C.amberDim,
        color,
        border: `1px solid ${isOut ? 'rgba(204,32,32,0.25)' : 'rgba(217,119,6,0.3)'}`,
      }}>{isOut ? 'OUT' : 'LOW'}</span>
    </div>
  );
}

export default function Dashboard() {
  // Initialise from cache immediately — no loading flash on re-mount
  const [products,  setProducts]  = useState(_cache.products  ?? []);
  const [customers, setCustomers] = useState(_cache.customers ?? []);
  const [vendors,   setVendors]   = useState(_cache.vendors   ?? vendorFallback);
  const [lowStock,  setLowStock]  = useState(_cache.lowStock  ?? []);
  const [stats,     setStats]     = useState(_cache.stats ?? null);
  const [loading,   setLoading]   = useState(_cache.products === null); // only show loading on first ever mount

  useEffect(() => {
    // Already have cached data — skip fetch entirely
    if (_cache.products !== null) return;

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
        const lowProds = prods.filter(p => {
          const q = p.quantity ?? p.stock ?? 0;
          const t = p.minStock ?? p.lowStockThreshold ?? 5;
          return q > 0 && q <= t;
        });
        const outProds = prods.filter(p => (p.quantity ?? p.stock ?? 0) === 0);

        const newStats = {
          total: prods.length,
          lowStock: lowProds.length,
          outOfStock: outProds.length,
          transactions: 47,
        };

        const sortedProds = [...prods].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7);
        const sortedCusts = [...custs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7);

        const lowList = [...lowProds, ...outProds].slice(0, 6).map((p, i) => ({
          id: p._id || i,
          name: p.name,
          quantity: p.quantity ?? p.stock ?? 0,
          status: (p.quantity ?? p.stock ?? 0) === 0 ? 'out' : 'low',
        }));

        let vends = vendorFallback;
        if (vRes && vRes.ok) {
          const vJson = await vRes.json();
          const raw = vJson.data || vJson.vendors || (Array.isArray(vJson) ? vJson : []);
          if (raw.length > 0) vends = raw.slice(0, 7);
        }

        // Save to cache
        _cache.products  = sortedProds;
        _cache.customers = sortedCusts;
        _cache.vendors   = vends;
        _cache.lowStock  = lowList.length > 0 ? lowList : lowStockFallback;
        _cache.stats     = newStats;

        // Update state
        setProducts(sortedProds);
        setCustomers(sortedCusts);
        setVendors(vends);
        setLowStock(_cache.lowStock);
        setStats(newStats);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []); // runs once ever (cache prevents re-fetch)

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
        }}>Dashboard</h1>
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

      {/* ── Stat Cards ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <StatCard label="Total Products" value={stats ? String(stats.total) : "—"}        sublabel="Active lines"   dotColor="green"  />
        <StatCard label="Low Stock"      value={stats ? String(stats.lowStock) : "—"}      sublabel="Need attention" dotColor="orange" />
        <StatCard label="Out of Stock"   value={stats ? String(stats.outOfStock) : "—"}    sublabel="Depleted items" dotColor="red"    />
        <StatCard label="Transactions"   value={stats ? String(stats.transactions) : "—"}  sublabel="This month"     dotColor="blue"   />
      </div>

      {/* ── Reminder Widget ── */}
      <div style={{ marginBottom: '16px' }}>
        <ReminderWidget />
      </div>

      {/* ── 4 Content Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>

        {/* Products */}
        <ContentCard title="Products" color={C.teal} href="/products">
          {loading
            ? <div style={{ fontSize: '11px', color: C.dim, padding: '12px 0' }}>Loading...</div>
            : products.length === 0
              ? <div style={{ fontSize: '11px', color: C.dim, padding: '12px 0' }}>No products found.</div>
              : products.map((p, i) => (
                <ListRow
                  key={p._id || i}
                  primary={p.name}
                  secondary={p.category || p.tipeItem || '—'}
                  right={fmt(p.createdAt)}
                  last={i === products.length - 1}
                />
              ))
          }
        </ContentCard>

        {/* Recent Customers */}
        <ContentCard title="Recent Customers" color={C.blue} href="/maintenance">
          {loading
            ? <div style={{ fontSize: '11px', color: C.dim, padding: '12px 0' }}>Loading...</div>
            : customers.length === 0
              ? <div style={{ fontSize: '11px', color: C.dim, padding: '12px 0' }}>No customers found.</div>
              : customers.map((c, i) => (
                <ListRow
                  key={c._id || i}
                  primary={c.customerName || c.name || '—'}
                  secondary={c.kota || c.address || '—'}
                  right={fmt(c.createdAt)}
                  dot={C.blue}
                  last={i === customers.length - 1}
                />
              ))
          }
        </ContentCard>

        {/* Vendors */}
        <ContentCard title="Vendors" color={C.amber} href="/vendors">
          {vendors.map((v, i) => (
            <ListRow
              key={v._id || i}
              primary={v.name || v.vendorName || '—'}
              secondary={v.type || v.category || '—'}
              dot={C.amber}
              last={i === vendors.length - 1}
            />
          ))}
        </ContentCard>

        {/* Low Stock Alerts */}
        <ContentCard title="Low Stock Alerts" color={C.red} href="/products" actionLabel="Manage">
          {lowStock.map((a, i) => (
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