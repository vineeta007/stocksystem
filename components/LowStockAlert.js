import Link from 'next/link';

const CFG = {
  LOW: { bg: '#fffbeb', color: '#92400e', border: '#fde68a', label: 'LOW'  },
  OUT: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', label: 'OUT'  },
};

export default function LowStockAlert({ items = [] }) {
  if (!items.length) return (
    <div style={{ fontSize: '13px', color: '#8a96a8', padding: '16px 0', textAlign: 'center' }}>
      All stock levels are healthy.
    </div>
  );

  return (
    <div>
      {items.map((item, i) => {
        const c = CFG[item.status] || CFG.LOW;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', padding: '11px 0',
            borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none',
            gap: '10px',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f1623' }}>{item.name}</div>
              <div style={{ fontSize: '11px', color: '#8a96a8', marginTop: '2px' }}>{item.sublabel}</div>
            </div>
            <span style={{
              background: c.bg, color: c.color, border: `1px solid ${c.border}`,
              borderRadius: '4px', padding: '3px 8px', fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.06em', flexShrink: 0,
            }}>{c.label}</span>
            <Link href="/transactions?type=in" style={{
              background: '#fff', border: '1px solid #e2e6ed', color: '#4a5568',
              borderRadius: '5px', padding: '4px 10px', fontSize: '11px', fontWeight: 500, flexShrink: 0,
            }}>Order</Link>
          </div>
        );
      })}
    </div>
  );
}