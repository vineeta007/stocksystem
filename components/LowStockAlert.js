'use client';

export default function LowStockAlert({ alerts = [], onOrder }) {
  if (alerts.length === 0) {
    return <div style={{ padding: '20px 0', fontSize: '14px', color: '#B8D4F0', textAlign: 'center' }}>All stock levels are healthy.</div>;
  }
  return (
    <div>
      {alerts.map((alert) => {
        const isOut = alert.status === 'out' || alert.quantity <= 0;
        return (
          <div key={alert.id} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '13px 0', borderBottom: '1px solid #1E3A5F',
            fontFamily: "'Sora', sans-serif",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{alert.name}</div>
              <div style={{ fontSize: '12px', color: '#B8D4F0', marginTop: '3px' }}>
                {isOut ? 'Depleted — restock needed' : `Qty: ${alert.quantity} remaining`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
             <span style={{
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 700,
  background: isOut ? '#FEE2E2' : '#FEF3C7',
  color: isOut ? '#991B1B' : '#92400E',
  border: isOut ? '1px solid #FCA5A5' : '1px solid #FCD34D',
}}>
                {isOut ? 'OUT' : 'LOW'}
              </span>
              <button
                onClick={() => onOrder?.(alert)}
                style={{
                  padding: '5px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
                  border: '1.5px solid #1E3A5F', background: '#0F1F3D',
                  color: '#FFFFFF', cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                  transition: 'border-color .15s',
                }}
                onMouseEnter={e => e.target.style.borderColor = '#2E90FA'}
                onMouseLeave={e => e.target.style.borderColor = '#1E3A5F'}
              >
                Order
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}