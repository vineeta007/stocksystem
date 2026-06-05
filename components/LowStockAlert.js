'use client';

export default function LowStockAlert({ alerts = [], onOrder }) {
  if (alerts.length === 0) {
    return (
      <div style={{ padding: '20px 0', fontSize: '14px', color: '#64748B', textAlign: 'center' }}>
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
            borderBottom: i !== alerts.length - 1 ? '1px solid rgba(148,163,184,0.08)' : 'none',
            fontFamily: "'Sora', sans-serif",
          }}>
            {/* Left */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', marginBottom: '4px' }}>
                {alert.name}
              </div>
              <div style={{ fontSize: '11px', color: isOut ? '#FCA5A5' : '#94A3B8' }}>
                {isOut ? 'Depleted — restock needed' : `Qty: ${alert.quantity} remaining`}
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <span style={{
                padding: '3px 10px', borderRadius: '999px',
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em',
                background: isOut ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                color: isOut ? '#FCA5A5' : '#FCD34D',
                border: isOut ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(245,158,11,0.35)',
              }}>
                {isOut ? 'OUT' : 'LOW'}
              </span>

              <button onClick={() => onOrder?.(alert)} style={{
                padding: '6px 14px', borderRadius: '7px',
                fontSize: '12px', fontWeight: 600,
                border: '1px solid rgba(29,158,117,0.4)',
                background: 'rgba(29,158,117,0.12)',
                color: '#34D399', cursor: 'pointer',
                fontFamily: "'Sora', sans-serif",
                transition: 'all 0.15s',
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