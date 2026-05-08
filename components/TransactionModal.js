'use client';

const G      = '#c8a96e';
const BORDER = '#1e1e16';
const TEXT   = '#d8d4c8';
const MUTED  = '#6a6658';
const FAINT  = '#3a3830';

export default function TransactionModal({ product, type, onClose }) {
  if (!product) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#111109', border: `0.5px solid ${BORDER}`,
        borderRadius: 4, padding: '28px 32px', width: 360,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 8, letterSpacing: '0.28em', color: FAINT, textTransform: 'uppercase', marginBottom: 6 }}>
          {type === 'in' ? 'Stock In' : 'Stock Out'}
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: TEXT, marginBottom: 20 }}>
          {product.name}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 9, letterSpacing: '0.2em', color: FAINT, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Quantity</label>
          <input type="number" min="1" defaultValue="1" style={{
            width: '100%', background: '#0e0e0a', border: `0.5px solid ${BORDER}`,
            borderRadius: 2, padding: '8px 12px', color: TEXT, fontSize: 13,
            outline: 'none',
          }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 9, letterSpacing: '0.2em', color: FAINT, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Note (optional)</label>
          <input type="text" placeholder="Site / supplier / reason" style={{
            width: '100%', background: '#0e0e0a', border: `0.5px solid ${BORDER}`,
            borderRadius: 2, padding: '8px 12px', color: TEXT, fontSize: 12,
            outline: 'none',
          }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.18em',
            textTransform: 'uppercase', padding: '9px', borderRadius: 2,
            border: `0.5px solid ${BORDER}`, background: 'transparent', color: MUTED,
          }}>Cancel</button>
          <button style={{
            flex: 1, fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.18em',
            textTransform: 'uppercase', padding: '9px', borderRadius: 2,
            border: `0.5px solid ${G}`, background: G, color: '#0a0a07', fontWeight: 500,
          }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}