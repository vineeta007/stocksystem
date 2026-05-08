import Link from 'next/link';

const STATUS_CONFIG = {
  LOW: { bg: '#2e1e10', color: '#d97b3a', border: '#4a3010', label: 'LOW' },
  OUT: { bg: '#2e1a1a', color: '#e05050', border: '#4a2020', label: 'OUT' },
};

export default function LowStockAlert({ items = [] }) {
  if (!items.length) return (
    <div style={{ fontSize: '11px', color: '#3a3830', padding: '12px 0', textAlign: 'center' }}>
      No alerts — all stock levels are healthy.
    </div>
  );

  return (
    <div>
      {items.map((item, i) => {
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.LOW;
        return (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '9px 0',
            borderBottom: i < items.length - 1 ? '1px solid #222120' : 'none',
            gap: '8px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: '#e8e4d9', fontWeight: 500 }}>{item.name}</div>
              <div style={{ fontSize: '9px', color: '#5a5850', marginTop: '1px' }}>{item.sublabel}</div>
            </div>

            {/* Status badge */}
            <div style={{
              background: cfg.bg, color: cfg.color,
              border: `1px solid ${cfg.border}`,
              borderRadius: '3px', padding: '3px 6px',
              fontSize: '8px', fontWeight: 700, letterSpacing: '0.08em',
              flexShrink: 0,
            }}>{cfg.label}</div>

            {/* Order button */}
            <Link href="/transactions?type=in" style={{
              background: 'transparent',
              border: '0.5px solid #2a2925',
              color: '#8a8678',
              borderRadius: '3px',
              padding: '3px 8px',
              fontSize: '8px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              flexShrink: 0,
            }}>ORDER</Link>
          </div>
        );
      })}
    </div>
  );
}