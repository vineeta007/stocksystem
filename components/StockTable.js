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
            borderBottom: i < items.length - 1 ? '1px solid #eeeeee' : 'none',
            gap: '12px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111111', marginBottom: '2px' }}>
                {item.name}
              </div>
              {item.category && (
                <div style={{ fontSize: '11px', color: '#888888' }}>
                  {item.category}
                </div>
              )}
            </div>

            <div style={{ width: '70px' }}>
              <div style={{ height: '4px', background: '#e8e8e8', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`, borderRadius: '4px',
                  background: isIn ? '#1D9E75' : isLow ? '#d97706' : '#CC2020',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>

            <div style={{
              fontSize: '14px', fontWeight: 700, color: '#111111',
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
    'IN STOCK':    { bg: 'rgba(22,163,74,0.1)',   color: '#16a34a', border: 'rgba(22,163,74,0.3)',   short: 'In Stock' },
    'LOW STOCK':   { bg: 'rgba(217,119,6,0.1)',   color: '#d97706', border: 'rgba(217,119,6,0.3)',   short: 'Low Stock' },
    'OUT OF STOCK':{ bg: 'rgba(204,32,32,0.08)',  color: '#CC2020', border: 'rgba(204,32,32,0.25)',  short: 'Out of Stock' },
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