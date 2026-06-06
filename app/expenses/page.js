'use client';
import { useState, useEffect } from 'react';

const GOLD = '#c9a84c';
const BORDER = '#1e1e16';
const TEXT = '#d8d4c8';
const FAINT = '#3a3830';
const MUTED = '#6a6658';
const EMPTY_FORM = { date: '', name: '', amount: '', details: '' };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('All');

  async function fetchExpenses() {
    setLoading(true);
    const res = await fetch('/api/expenses');
    const json = await res.json();
    if (json.success) setExpenses(json.data);
    setLoading(false);
  }

  useEffect(() => { fetchExpenses(); }, []);

  function openAdd() {
    setEditExpense(null);
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setShowModal(true);
  }

  function openEdit(e) {
    setEditExpense(e);
    setForm({ date: e.date?.slice(0, 10) || '', name: e.name, amount: String(e.amount), details: e.details || '' });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.date || !form.amount) return alert('Date, name and amount are required');
    setSaving(true);
    const payload = { date: form.date, name: form.name, amount: Number(form.amount) || 0, details: form.details };

    if (editExpense) {
      const res = await fetch(`/api/expenses/${editExpense._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const json = await res.json();
      setSaving(false);
      if (json.success) { setShowModal(false); fetchExpenses(); }
      else alert('Failed: ' + json.error);
    } else {
      const res = await fetch('/api/expenses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const json = await res.json();
      setSaving(false);
      if (json.success) { setShowModal(false); fetchExpenses(); }
      else alert('Failed: ' + json.error);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this expense?')) return;
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    fetchExpenses();
  }

  const months = ['All', ...new Set(expenses.map(e => e.date?.slice(0, 7)).filter(Boolean))].sort().reverse();
  const filtered = expenses.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || (e.details || '').toLowerCase().includes(search.toLowerCase());
    const matchMonth = monthFilter === 'All' || e.date?.startsWith(monthFilter);
    return matchSearch && matchMonth;
  });
  const total = filtered.reduce((sum, e) => sum + (e.amount || 0), 0);

  function fmt(n) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n); }
  function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }); }

  return (
    <div style={{ minHeight: '100vh', color: TEXT }}>
      {/* Header */}
      <div style={{ padding: '18px 28px 14px', borderBottom: `0.5px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, color: '#000000', letterSpacing: '0.02em' }}>Expenses</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'absolute', right: 28 }}>
          <span style={{ fontSize: 11, color: MUTED }}>
            Total: <span style={{ color: '#e05050', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{fmt(total)}</span>
          </span>
          <button onClick={openAdd}
            style={{ padding: '7px 14px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', background: GOLD, color: '#0a0a07', border: 'none', borderRadius: 3, cursor: 'pointer', fontWeight: 700 }}>
            + Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '14px 28px', borderBottom: `0.5px solid ${BORDER}`, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..."
          style={{ background: '#111109', border: `0.5px solid ${BORDER}`, borderRadius: 3, padding: '7px 12px', color: TEXT, fontSize: 11, outline: 'none', width: 200 }} />
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {months.map(m => (
            <button key={m} onClick={() => setMonthFilter(m)}
              style={{ padding: '5px 10px', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 3, cursor: 'pointer',
                background: monthFilter === m ? GOLD : 'transparent', color: monthFilter === m ? '#0a0a07' : MUTED,
                border: `0.5px solid ${monthFilter === m ? GOLD : BORDER}`, fontWeight: monthFilter === m ? 600 : 400 }}>
              {m === 'All' ? 'All' : new Date(m + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 28px 32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: MUTED }}>Loading...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${BORDER}` }}>
                {['#', 'Date', 'Name', 'Amount', 'Details', ''].map((h, i) => (
                  <th key={i} style={{ padding: '12px 10px', textAlign: 'left', fontSize: 9, letterSpacing: '0.2em', color: FAINT, textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={e._id} style={{ borderBottom: '0.5px solid #16150f', background: i % 2 === 0 ? 'transparent' : '#111109' }}>
                  <td style={{ padding: '11px 10px', color: FAINT, fontFamily: 'Space Mono, monospace', fontSize: 9 }}>{i + 1}</td>
                  <td style={{ padding: '11px 10px', color: MUTED, fontFamily: 'Space Mono, monospace', fontSize: 9 }}>{fmtDate(e.date)}</td>
                  <td style={{ padding: '11px 10px', color: TEXT, fontWeight: 500 }}>{e.name}</td>
                  <td style={{ padding: '11px 10px', fontFamily: 'Space Mono, monospace', fontWeight: 700, color: '#e05050', fontSize: 9 }}>{fmt(e.amount)}</td>
                  <td style={{ padding: '11px 10px', color: MUTED, fontSize: 9, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.details || '—'}</td>
                  <td style={{ padding: '11px 10px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(e)}
                        style={{ padding: '4px 10px', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'transparent', color: GOLD, border: `0.5px solid ${GOLD}`, borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(e._id)}
                        style={{ padding: '4px 10px', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'transparent', color: '#e05050', border: '0.5px solid #4a2020', borderRadius: 3, cursor: 'pointer' }}>
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: MUTED }}>No expenses found</td></tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: `1px solid ${BORDER}` }}>
                  <td colSpan={3} style={{ padding: '12px 10px', fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Total</td>
                  <td style={{ padding: '12px 10px', fontFamily: 'Space Mono, monospace', fontWeight: 700, color: '#e05050', fontSize: 10 }}>{fmt(total)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#13120e', border: `1px solid ${BORDER}`, borderRadius: 6, width: '100%', maxWidth: 460, padding: 28 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: TEXT, marginBottom: 24 }}>
              {editExpense ? 'Edit Expense' : 'Add Expense'}
            </div>
            {[
              { label: 'Date *', key: 'date', type: 'date' },
              { label: 'Name *', key: 'name', placeholder: 'e.g. Customer Name' },
              { label: 'Amount (IDR) *', key: 'amount', placeholder: '0', type: 'number' },
              { label: 'Details', key: 'details', placeholder: 'Optional notes...' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.15em', color: MUTED, textTransform: 'uppercase', marginBottom: 5 }}>{f.label}</div>
                <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]}
                  onChange={ev => setForm(prev => ({ ...prev, [f.key]: ev.target.value }))}
                  style={{ width: '100%', background: '#0d0d0b', border: `0.5px solid ${BORDER}`, borderRadius: 3, padding: '8px 12px', color: TEXT, fontSize: 12, outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 1, padding: '9px 0', background: GOLD, color: '#0a0a07', border: 'none', borderRadius: 3, fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                {saving ? 'Saving...' : editExpense ? 'Save Changes' : 'Add Expense'}
              </button>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setEditExpense(null); }}
                style={{ padding: '9px 20px', background: 'transparent', color: MUTED, border: `0.5px solid ${BORDER}`, borderRadius: 3, fontSize: 11, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}