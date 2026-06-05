'use client';

export default function StockTable({ items = [] }) {
  return (
    <div>
      {items.map((item, i) => {
        const qty = item.qty ?? item.stock ?? 0;
        const pct = Math.min(100, (qty / ((item.minStock || 5) * 5)) * 100);
        const status =
          qty === 0 ? 'OUT OF STOCK'
          : qty <= (item.minStock || 2) ? 'LOW STOCK'
          : 'IN STOCK';
        const isIn  = status === 'IN STOCK';
        const isLow = status === 'LOW STOCK';

        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center',
            padding: '11px 0',
            borderBottom: i < items.length - 1 ? '1px solid rgba(148,163,184,0.08)' : 'none',
            gap: '12px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', marginBottom: '2px' }}>
                {item.name}
              </div>
              {item.category && (
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {item.category}
                </div>
              )}
            </div>

            <div style={{ width: '70px' }}>
              <div style={{ height: '4px', background: '#263548', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`, borderRadius: '4px',
                  background: isIn ? '#1D9E75' : isLow ? '#F59E0B' : '#EF4444',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>

            <div style={{
              fontSize: '14px', fontWeight: 700, color: '#F1F5F9',
              width: '28px', textAlign: 'right', flexShrink: 0,
            }}>{qty}</div>

            <StatusBadge status={status} />
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    'IN STOCK':    { bg: 'rgba(29,158,117,0.15)',  color: '#34D399', border: 'rgba(29,158,117,0.35)',  short: 'In Stock' },
    'LOW STOCK':   { bg: 'rgba(245,158,11,0.15)',  color: '#FCD34D', border: 'rgba(245,158,11,0.35)', short: 'Low Stock' },
    'OUT OF STOCK':{ bg: 'rgba(239,68,68,0.15)',   color: '#FCA5A5', border: 'rgba(239,68,68,0.35)',  short: 'Out of Stock' },
  };
  const c = map[status];
  return (
    <div style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: '6px', padding: '4px 10px',
      fontSize: '9px', fontWeight: 700, whiteSpace: 'nowrap',
      flexShrink: 0, minWidth: 'max-content',
    }}>{c.short}</div>
  );
}