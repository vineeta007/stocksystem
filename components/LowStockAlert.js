export default function LowStockAlert({ items }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '9px 0',
          borderBottom: i < items.length - 1 ? '1px solid #222120' : 'none',
          gap: '8px',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', color: '#e8e4d9', fontWeight: 500, marginBottom: '2px' }}>
              {item.name}
            </div>
            <div style={{ fontSize: '9px', color: '#5a5850' }}>{item.sublabel}</div>
          </div>
          <StatusChip status={item.status} />
          <button style={{
            background: '#252420',
            border: '1px solid #333230',
            color: '#c9a84c',
            borderRadius: '3px',
            padding: '4px 8px',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}>ORDER</button>
        </div>
      ))}
    </div>
  );
}

function StatusChip({ status }) {
  const isOut = status === 'OUT';
  return (
    <div style={{
      background: isOut ? '#2e1a1a' : '#2e1e10',
      color: isOut ? '#e05050' : '#d97b3a',
      border: `1px solid ${isOut ? '#4a2020' : '#4a3010'}`,
      borderRadius: '3px',
      padding: '3px 6px',
      fontSize: '8px',
      fontWeight: 700,
      letterSpacing: '0.08em',
      flexShrink: 0,
    }}>{status}</div>
  );
}