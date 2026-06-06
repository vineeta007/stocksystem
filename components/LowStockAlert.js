'use client';

export default function LowStockAlert({ alerts = [], onOrder }) {
  if (alerts.length === 0) {
    return (
      <div style={{ padding: '20px 0', fontSize: '14px', color: '#888888', textAlign: 'center' }}>
        All stock levels are healthy.
      </div>
    );
  }

  return (
    <div>
      {alerts.map((alert, i) => {
        const isOut = alert.status === 'out' || alert.quantity <= 0;
        return (
          <div key={alert.id || i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '10px', padding: '13px 0',
            borderBottom: i !== alerts.length - 1 ? '1px solid #eeeeee' : 'none',
            fontFamily: "'Sora', sans-serif",
          }}>
            {/* Left */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111111', marginBottom: '4px' }}>
                {alert.name}
              </div>
              <div style={{ fontSize: '11px', color: isOut ? '#CC2020' : '#888888' }}>
                {isOut ? 'Depleted — restock needed' : `Qty: ${alert.quantity} remaining`}
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{
                padding: '3px 10px', borderRadius: '999px',
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em',
                background: isOut ? 'rgba(204,32,32,0.08)' : 'rgba(217,119,6,0.1)',
                color: isOut ? '#CC2020' : '#d97706',
                border: isOut ? '1px solid rgba(204,32,32,0.25)' : '1px solid rgba(217,119,6,0.3)',
              }}>
                {isOut ? 'OUT' : 'LOW'}
              </span>

              <button onClick={() => onOrder?.(alert)} style={{
                padding: '6px 14px', borderRadius: '7px',
                fontSize: '12px', fontWeight: 600,
                border: '1px solid #000000',
                background: '#000000',
                color: '#ffffff', cursor: 'pointer',
                fontFamily: "'Sora', sans-serif",
                transition: 'background 0.15s',
              }}>
                Order
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}