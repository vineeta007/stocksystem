'use client';

export default function LowStockAlert({ alerts = [], onOrder }) {
  if (alerts.length === 0) {
    return (
      <div
        style={{
          padding: '20px 0',
          fontSize: '14px',
          color: '#7EA8D4',
          textAlign: 'center',
        }}
      >
        All stock levels are healthy.
      </div>
    );
  }

  return (
    <div>
      {alerts.map((alert, i) => {
        const isOut = alert.status === 'out' || alert.quantity <= 0;

        return (
          <div
            key={alert.id || i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '14px 0',
              borderBottom:
                i !== alerts.length - 1
                  ? '1px solid #1E3A5F'
                  : 'none',
              fontFamily: "'Sora', sans-serif",
            }}
          >
            {/* LEFT */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                  marginBottom: '5px',
                }}
              >
                {alert.name}
              </div>

              <div
                style={{
                  fontSize: '11px',
                  color: '#7EA8D4',
                  lineHeight: 1.4,
                }}
              >
                {isOut
                  ? 'Depleted — restock needed'
                  : `Qty: ${alert.quantity} remaining`}
              </div>
            </div>

            {/* RIGHT */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
              }}
            >
              {/* STATUS BADGE */}
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  background: isOut
                    ? 'rgba(239,68,68,.18)'
                    : 'rgba(245,158,11,.18)',
                  color: isOut ? '#F87171' : '#FBBF24',
                  border: isOut
                    ? '1px solid rgba(239,68,68,.35)'
                    : '1px solid rgba(245,158,11,.35)',
                }}
              >
                {isOut ? 'OUT' : 'LOW'}
              </span>

              {/* BUTTON */}
              <button
                onClick={() => onOrder?.(alert)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid #2E4C75',
                  background: '#13294B',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontFamily: "'Sora', sans-serif",
                }}
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