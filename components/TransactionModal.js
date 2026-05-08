'use client';

import { useState } from 'react';

/**
 * TransactionModal
 * Props:
 *   type      {'in'|'out'}  – Stock In or Stock Out
 *   products  {Array}       – [{ id, name }]
 *   onSubmit  {fn}          – callback({ productId, quantity, note, type })
 *   onClose   {fn}
 */
export default function TransactionModal({ type = 'in', products = [], onSubmit, onClose }) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity]   = useState('');
  const [note, setNote]           = useState('');
  const [error, setError]         = useState('');

  const isIn = type === 'in';
  const title = isIn ? '+ Stock In' : '+ Stock Out';
  const accentColor = isIn ? 'var(--green)' : 'var(--red)';

  function handleSubmit(e) {
    e.preventDefault();
    if (!productId)       return setError('Please select a product.');
    if (!quantity || +quantity <= 0) return setError('Enter a valid quantity.');
    setError('');
    onSubmit?.({ productId, quantity: +quantity, note, type });
  }

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ ...styles.accent, background: accentColor }} />
            <h2 style={styles.title}>{title}</h2>
          </div>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Product</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Quantity</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Note <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Supplier name, reason…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.footer}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn"
              style={{ background: accentColor, color: '#fff' }}
            >
              Confirm {isIn ? 'Stock In' : 'Stock Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '20px',
  },
  modal: {
    background: 'var(--navy2)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '460px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 18px',
    borderBottom: '1px solid var(--border)',
  },
  accent: {
    width: '4px',
    height: '20px',
    borderRadius: '2px',
  },
  title: {
    fontSize: '17px',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.3px',
  },
  close: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-dim)',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: '6px',
    transition: 'color .15s',
  },
  form: {
    padding: '20px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '4px',
  },
  error: {
    fontSize: '13px',
    color: '#FCA5A5',
    background: 'rgba(239,68,68,.1)',
    border: '1px solid rgba(239,68,68,.25)',
    borderRadius: '8px',
    padding: '10px 14px',
  },
};