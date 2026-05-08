export default function StockTable({ items }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: i < items.length - 1 ? '1px solid #222120' : 'none',
          gap: '10px',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', color: '#e8e4d9', fontWeight: 500, marginBottom: '2px' }}>
              {item.name}
            </div>
            {item.category && (
              <div style={{ fontSize: '9px', color: '#5a5850' }}>{item.category}</div>
            )}
          </div>

          {/* Bar */}
          <div style={{ width: '60px', position: 'relative' }}>
            <div style={{
              height: '3px',
              background: '#2a2925',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (item.qty / (item.maxQty || 50)) * 100)}%`,
                background: item.status === 'IN STOCK' ? '#4caf7a' :
                             item.status === 'LOW STOCK' ? '#d97b3a' : '#e05050',
                borderRadius: '2px',
              }} />
            </div>
          </div>

          <div style={{
            fontSize: '13px',
            fontFamily: 'Space Mono, monospace',
            color: '#e8e4d9',
            width: '24px',
            textAlign: 'right',
          }}>{item.qty}</div>

          <StatusBadge status={item.status} />
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    'IN STOCK': { bg: '#1a2e22', color: '#4caf7a', border: '#2a4a32' },
    'LOW STOCK': { bg: '#2e1e10', color: '#d97b3a', border: '#4a3010' },
    'OUT OF STOCK': { bg: '#2e1a1a', color: '#e05050', border: '#4a2020' },
  };
  const c = configs[status] || configs['IN STOCK'];
  const short = status === 'OUT OF STOCK' ? 'OUT OF\nSTOCK' : status === 'IN STOCK' ? 'IN\nSTOCK' : 'LOW\nSTOCK';

  return (
    <div style={{
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      borderRadius: '3px',
      padding: '3px 5px',
      fontSize: '7.5px',
      fontWeight: 700,
      letterSpacing: '0.05em',
      textAlign: 'center',
      whiteSpace: 'pre-line',
      lineHeight: 1.2,
      width: '40px',
      flexShrink: 0,
    }}>{short}</div>
  );
}