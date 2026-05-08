export default function StockTable({ items = [] }) {
  return (
    <div>
      {items.map((item, i) => {
        const qty = item.qty ?? item.stock ?? 0;

        const pct = Math.min(
          100,
          (qty / ((item.minStock || 5) * 5)) * 100
        );

        const status =
          qty === 0
            ? 'OUT OF STOCK'
            : qty <= (item.minStock || 2)
            ? 'LOW STOCK'
            : 'IN STOCK';

        const isIn = status === 'IN STOCK';
        const isLow = status === 'LOW STOCK';

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '11px 0',
              borderBottom:
                i < items.length - 1
                  ? '1px solid #f1f5f9'
                  : 'none',
              gap: '12px',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  marginBottom: '1px',
                }}
              >
                {item.name}
              </div>

              {item.category && (
                <div
                  style={{
                    fontSize: '11px',
                    color: '#B8D4F0',
                  }}
                >
                  {item.category}
                </div>
              )}
            </div>

            <div style={{ width: '70px' }}>
              <div
                style={{
                  height: '4px',
                  background: '#e2e6ed',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: '2px',
                    background: isIn
                      ? '#16a34a'
                      : isLow
                      ? '#d97706'
                      : '#dc2626',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#FFFFFF',
                width: '28px',
                textAlign: 'right',
                flexShrink: 0,
              }}
            >
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
    'IN STOCK': {
      bg: '#DCFCE7',
      color: '#166534',
      border: '#86EFAC',
      short: 'In Stock',
    },

    'LOW STOCK': {
      bg: '#FEF3C7',
      color: '#92400E',
      border: '#FCD34D',
      short: 'Low Stock',
    },

    'OUT OF STOCK': {
      bg: '#FEE2E2',
      color: '#991B1B',
      border: '#FCA5A5',
      short: 'Out of Stock',
    },
  };

  const c = map[status];

  return (
    <div
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        borderRadius: '6px',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {c.short}
    </div>
  );
}