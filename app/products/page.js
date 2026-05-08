'use client';
import { useState, useEffect } from 'react';
import { getAllTransactions, stockIn, stockOut } from '@/lib/stockService';
import { getAllStocks } from '@/lib/stockService';

const BORDER = '#1e1e16';
const TEXT = '#d8d4c8';
const FAINT = '#3a3830';
const MUTED = '#6a6658';
const GOLD = '#c9a84c';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type: 'in'|'out' }
  const [form, setForm] = useState({ stockId: '', quantity: 1, note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All'); // All | IN | OUT

  const load = async () => {
    setLoading(true);
    try {
      const [txs, stks] = await Promise.all([getAllTransactions(), getAllStocks()]);
      setTransactions(txs);
      setStocks(stks);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openModal = (type) => {
    setForm({ stockId: stocks[0]?.id || '', quantity: 1, note: '' });
    setError('');
    setModal(type);
  };

  const handleSubmit = async () => {
    if (!form.stockId) return setError('Select a product.');
    if (form.quantity < 1) return setError('Quantity must be at least 1.');
    setSubmitting(true);
    setError('');
    try {
      if (modal === 'in') await stockIn(form.stockId, Number(form.quantity), form.note);
      else await stockOut(form.stockId, Number(form.quantity), form.note);
      setModal(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
    setSubmitting(false);
  };

  const filtered = filter === 'All' ? transactions : transactions.filter(t => t.type === filter);

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ minHeight: '100vh', color: TEXT }}>
      {/* Header */}
      <div style={{ padding: '18px 28px 14px', borderBottom: `0.5px solid ${BORDER}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 8, letterSpacing: '0.3em', color: FAINT, textTransform: 'uppercase', marginBottom: 3 }}>History</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: TEXT }}>Transactions</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => openModal('in')} style={actionBtn('#1a2e22', '#4caf7a', '#2a4a32')}>↓ Stock In</button>
          <button onClick={() => openModal('out')} style={actionBtn('#2e1a1a', '#e05050', '#4a2020')}>↑ Stock Out</button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ padding: '12px 28px', borderBottom: `0.5px solid ${BORDER}`, display: 'flex', gap: 6 }}>
        {['All', 'IN', 'OUT'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px', fontSize: 9, letterSpacing: '0.15em',
            textTransform: 'uppercase', borderRadius: 3, cursor: 'pointer',
            background: filter === f ? '#1e1d19' : 'transparent',
            color: filter === f ? TEXT : FAINT,
            border: `0.5px solid ${filter === f ? '#333230' : BORDER}`,
          }}>{f}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 10, color: FAINT, alignSelf: 'center' }}>
          {filtered.length} records
        </span>
      </div>

      {/* Table */}
      <div style={{ padding: '0 28px 32px' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: FAINT, fontSize: 11 }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${BORDER}` }}>
                {['Type', 'Product', 'Qty', 'Note', 'Date'].map(h => (
                  <th key={h} style={{
                    padding: '12px 10px', textAlign: 'left',
                    fontSize: 8, letterSpacing: '0.2em', color: FAINT,
                    textTransform: 'uppercase', fontWeight: 600,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: FAINT, fontSize: 11 }}>No transactions yet.</td></tr>
              ) : filtered.map((tx, i) => (
                <tr key={tx.id} style={{ borderBottom: `0.5px solid #16150f`, background: i % 2 === 0 ? 'transparent' : '#111109' }}>
                  <td style={{ padding: '11px 10px' }}>
                    <span style={{
                      fontSize: 8, padding: '3px 7px', borderRadius: 2, fontWeight: 700,
                      letterSpacing: '0.1em',
                      background: tx.type === 'IN' ? '#1a2e22' : '#2e1a1a',
                      color: tx.type === 'IN' ? '#4caf7a' : '#e05050',
                      border: `0.5px solid ${tx.type === 'IN' ? '#2a4a32' : '#4a2020'}`,
                    }}>{tx.type}</span>
                  </td>
                  <td style={{ padding: '11px 10px', color: TEXT, fontWeight: 500 }}>{tx.stockName}</td>
                  <td style={{ padding: '11px 10px', fontFamily: 'Space Mono, monospace', fontWeight: 700, color: tx.type === 'IN' ? '#4caf7a' : '#e05050' }}>
                    {tx.type === 'IN' ? '+' : '−'}{tx.quantity}
                  </td>
                  <td style={{ padding: '11px 10px', color: MUTED, fontSize: 11 }}>{tx.note || '—'}</td>
                  <td style={{ padding: '11px 10px', color: FAINT, fontSize: 10, fontFamily: 'Space Mono, monospace' }}>{formatDate(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setModal(null)}>
          <div style={{
            background: '#111109', border: `0.5px solid ${BORDER}`,
            borderRadius: 4, padding: '28px 32px', width: 360,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 8, letterSpacing: '0.28em', color: FAINT, textTransform: 'uppercase', marginBottom: 6 }}>
              {modal === 'in' ? 'Stock In' : 'Stock Out'}
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: TEXT, marginBottom: 22 }}>
              {modal === 'in' ? 'Add Stock' : 'Remove Stock'}
            </div>

            <label style={labelStyle}>Product</label>
            <select
              value={form.stockId}
              onChange={e => setForm(f => ({ ...f, stockId: e.target.value }))}
              style={inputStyle}
            >
              {stocks.map(s => <option key={s.id} value={s.id}>{s.name} (stock: {s.quantity})</option>)}
            </select>

            <label style={labelStyle}>Quantity</label>
            <input
              type="number" min="1"
              value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
              style={inputStyle}
            />

            <label style={labelStyle}>Note (optional)</label>
            <input
              type="text" placeholder="Supplier / site / reason"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              style={{ ...inputStyle, marginBottom: 20 }}
            />

            {error && <div style={{ fontSize: 11, color: '#e05050', marginBottom: 14 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={cancelBtn}>Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} style={confirmBtn(modal)}>
                {submitting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const actionBtn = (bg, color, border) => ({
  padding: '7px 14px', fontSize: 10, letterSpacing: '0.12em',
  textTransform: 'uppercase', borderRadius: 3, cursor: 'pointer',
  background: bg, color, border: `0.5px solid ${border}`, fontWeight: 600,
});

const labelStyle = {
  fontSize: 9, letterSpacing: '0.2em', color: '#3a3830',
  textTransform: 'uppercase', display: 'block', marginBottom: 6,
};

const inputStyle = {
  width: '100%', background: '#0e0e0a', border: '0.5px solid #1e1e16',
  borderRadius: 2, padding: '8px 12px', color: '#d8d4c8', fontSize: 12,
  outline: 'none', marginBottom: 14, display: 'block',
};

const cancelBtn = {
  flex: 1, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
  padding: '9px', borderRadius: 2, border: '0.5px solid #1e1e16',
  background: 'transparent', color: '#6a6658', cursor: 'pointer',
};

const confirmBtn = (type) => ({
  flex: 1, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
  padding: '9px', borderRadius: 2, fontWeight: 600, cursor: 'pointer',
  border: `0.5px solid ${type === 'in' ? '#4caf7a' : '#c9a84c'}`,
  background: type === 'in' ? '#4caf7a' : '#c9a84c',
  color: '#0a0a07',
});