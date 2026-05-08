'use client';

/**
 * LowStockAlert
 * Props:
 *   alerts  {Array}  – [{ id, name, quantity, status: 'low'|'out' }]
 *   onOrder {fn}     – callback(alert) when Order is clicked
 */
export default function LowStockAlert({ alerts = [], onOrder }) {
  if (alerts.length === 0) {
    return (
      <div style={styles.empty}>All stock levels are healthy.</div>
    );
  }

  return (
    <div style={styles.list}>
      {alerts.map((alert) => {
        const isOut = alert.status === 'out' || alert.quantity <= 0;
        return (
          <div key={alert.id} style={styles.row}>
            <div style={styles.info}>
              <div style={styles.name}>{alert.name}</div>
              <div style={styles.qty}>
                {isOut ? 'Depleted — restock needed' : `Qty: ${alert.quantity} remaining`}
              </div>
            </div>
            <div style={styles.actions}>
              <span className={isOut ? 'tag tag-out' : 'tag tag-low'}>
                {isOut ? 'OUT' : 'LOW'}
              </span>
              <button
                style={styles.orderBtn}
                onClick={() => onOrder?.(alert)}
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

const styles = {
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 0',
    borderBottom: '1px solid var(--border)',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: '13.5px',
    fontWeight: 600,
    color: 'var(--text)',
  },
  qty: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  actions: {
    display: 'flex',
    gap: '7px',
    alignItems: 'center',
    flexShrink: 0,
  },
  orderBtn: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    border: '1.5px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontFamily: 'var(--font)',
    transition: 'border-color .15s, color .15s',
  },
  empty: {
    padding: '20px 0',
    fontSize: '13.5px',
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
};