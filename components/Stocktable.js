export default function StockTable({ items = [] }) {
  return (
    <div>
      {items.map((item, i) => {
        const qty = item.qty ?? item.stock ?? 0;
        const pct = Math.min(100, (qty / ((item.minStock || 5) * 5)) * 100);
        const status =
  qty === 0
    ? 'OUT OF STOCK'
    : qty <= (item.minStock || 2)
    ? 'LOW STOCK'
    : 'IN STOCK';

const isIn = status === 'IN STOCK';
const isLow = status === 'LOW STOCK';

        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', padding: '11px 0',
            borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none',
            gap: '12px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f1623', marginBottom: '1px' }}>{item.name}</div>
              {item.category && <div style={{ fontSize: '11px', color: '#8a96a8' }}>{item.category}</div>}
            </div>

            <div style={{ width: '70px' }}>
              <div style={{ height: '4px', background: '#e2e6ed', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`, borderRadius: '2px',
                  background: isIn ? '#16a34a' : isLow ? '#d97706' : '#dc2626',
                }} />
              </div>
            </div>

            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f1623', width: '28px', textAlign: 'right', flexShrink: 0 }}>
              {qty}
            </div>

            <StatusBadge status={status} />
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    'IN STOCK':     { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0', short: 'In Stock'     },
    'LOW STOCK':    { bg: '#fffbeb', color: '#92400e', border: '#fde68a', short: 'Low Stock'    },
    'OUT OF STOCK': { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', short: 'Out of Stock' },
  };
  const c = map[status] || map['IN STOCK'];
  return (
    <div style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: '5px', padding: '3px 8px', fontSize: '10px', fontWeight: 600,
      letterSpacing: '0.03em', whiteSpace: 'nowrap', flexShrink: 0,
    }}>{c.short}</div>
  );
}