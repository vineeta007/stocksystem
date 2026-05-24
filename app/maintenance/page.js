'use client';

// app/maintenance/page.js
// Halaman Maintenance: list customer per wilayah + reminder 14 hari

import { useEffect, useState } from 'react';
import Link from 'next/link';

const ALERT_STYLE = {
  overdue: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', label: 'Terlambat' },
  today:   { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', label: 'Hari Ini' },
  urgent:  { bg: '#ffedd5', color: '#c2410c', border: '#fdba74', label: 'Segera' },
  warning: { bg: '#fef9c3', color: '#854d0e', border: '#fde047', label: 'Akan Datang' },
  info:    { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd', label: 'Info' },
  none:    { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: '' },
};

const GARANSI_STYLE = {
  'Dalam Garansi': { bg: '#dcfce7', color: '#15803d' },
  'Garansi Habis': { bg: '#fef9c3', color: '#854d0e' },
  'Berbayar':      { bg: '#dbeafe', color: '#1d4ed8' },
};

export default function MaintenancePage() {
  const [data,       setData]       = useState([]);
  const [reminders,  setReminders]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filterKota, setFilterKota] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showKunjunganModal, setShowKunjunganModal] = useState(null); // id customer
  const [kotaList,   setKotaList]   = useState([]);

  // ── Load data ──────────────────────────────────────────────────────────────
  async function loadData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterKota)   params.set('kota',   filterKota);
      if (filterStatus) params.set('status', filterStatus);

      const [mainRes, remRes] = await Promise.all([
        fetch(`/api/maintenance?${params}`),
        fetch('/api/maintenance/reminders'),
      ]);

      const mainJson = await mainRes.json();
      const remJson  = await remRes.json();

      if (mainJson.success) {
        setData(mainJson.data);
        // Buat daftar kota unik untuk filter
        const kotaUniq = [...new Set(mainJson.data.map(d => d.kota).filter(Boolean))].sort();
        setKotaList(kotaUniq);
      }
      if (remJson.success) setReminders(remJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [filterKota, filterStatus]);

  // ── Format tanggal ─────────────────────────────────────────────────────────
  function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ── Group data by wilayah ──────────────────────────────────────────────────
  const grouped = data.reduce((acc, m) => {
    const key = m.wilayah || m.kota || 'Lainnya';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', fontFamily: 'inherit' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>🔧 Data Maintenance</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
            {data.length} customer aktif • {reminders.length} perlu perhatian
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ padding: '8px 18px', borderRadius: 8, background: '#16a34a', color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          + Tambah Customer
        </button>
      </div>

      {/* ── Reminder Banner ── */}
      {reminders.length > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '14px 18px', marginBottom: 24 }}>
          <p style={{ fontWeight: 700, color: '#c2410c', margin: '0 0 10px', fontSize: 13 }}>
            🔔 Reminder Maintenance ({reminders.length} customer)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {reminders.map(r => {
              const s = ALERT_STYLE[r.alertType] || ALERT_STYLE.none;
              return (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {r.alertLabel}
                  </span>
                  <span style={{ fontSize: 13, color: '#1e293b' }}>
                    <strong>{r.namaCustomer}</strong> — {r.kota}
                    {r.namaUnit ? ` (${r.namaUnit})` : ''}
                    {' '}· Jatuh tempo: {fmtDate(r.jatuhTempo)}
                    {r.noHP ? ` · 📱 ${r.noHP}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          value={filterKota}
          onChange={e => setFilterKota(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#f8fafc', cursor: 'pointer' }}
        >
          <option value=''>Semua Kota</option>
          {kotaList.map(k => <option key={k} value={k}>{k}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#f8fafc', cursor: 'pointer' }}
        >
          <option value=''>Semua Status</option>
          <option value='Active'>Active</option>
          <option value='Inactive'>Inactive</option>
          <option value='New'>New</option>
        </select>

        <button
          onClick={() => { setFilterKota(''); setFilterStatus(''); }}
          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#f8fafc', cursor: 'pointer', color: '#64748b' }}
        >
          Reset Filter
        </button>
      </div>

      {/* ── Data Table per Wilayah ── */}
      {loading ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Memuat data...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Belum ada data maintenance.</p>
      ) : (
        Object.entries(grouped).map(([wilayah, customers]) => (
          <div key={wilayah} style={{ marginBottom: 28 }}>
            {/* Wilayah header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>📍 {wilayah}</span>
              <span style={{ background: '#e2e8f0', color: '#475569', borderRadius: 20, padding: '1px 8px', fontSize: 11 }}>
                {customers.length} customer
              </span>
            </div>

            {/* Table */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      {['Customer', 'Kota', 'Unit', 'Garansi', 'Kunjungan', 'Kunjungan Terakhir', 'Jatuh Tempo', 'Alert', 'Aksi'].map(h => (
                        <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((m, idx) => {
                      const alertS = ALERT_STYLE[m.alertType] || ALERT_STYLE.none;
                      const garansiS = GARANSI_STYLE[m.statusGaransi] || {};
                      return (
                        <tr key={m._id} style={{ borderBottom: idx < customers.length - 1 ? '1px solid #f1f5f9' : 'none', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>
                            {m.namaCustomer}
                            {m.noHP && <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>📱 {m.noHP}</div>}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>{m.kota || '—'}</td>
                          <td style={{ padding: '10px 12px', color: '#475569' }}>
                            {m.namaUnit || '—'}
                            {m.serialNumber && <div style={{ fontSize: 11, color: '#94a3b8' }}>SN: {m.serialNumber}</div>}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: garansiS.bg, color: garansiS.color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                              {m.statusGaransi}
                            </span>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                              {m.kunjunganBerikutnyaFree ? '✅ Free' : '💳 Berbayar'}
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', color: '#1e293b', fontWeight: 600 }}>
                            {m.jumlahKunjungan}x
                          </td>
                          <td style={{ padding: '10px 12px', color: '#475569', whiteSpace: 'nowrap' }}>
                            {fmtDate(m.kunjunganTerakhir)}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#475569', whiteSpace: 'nowrap' }}>
                            {fmtDate(m.jatuhTempo)}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            {m.reminderLabel ? (
                              <span style={{ background: alertS.bg, color: alertS.color, border: `1px solid ${alertS.border}`, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                {m.reminderLabel}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                onClick={() => setShowKunjunganModal(m._id)}
                                style={{ padding: '4px 10px', borderRadius: 6, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                              >
                                + Kunjungan
                              </button>
                              <Link
                                href={`/maintenance/${m._id}`}
                                style={{ padding: '4px 10px', borderRadius: 6, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}
                              >
                                Detail
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}

      {/* ── Modal Tambah Customer ── */}
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); loadData(); }}
        />
      )}

      {/* ── Modal Tambah Kunjungan ── */}
      {showKunjunganModal && (
        <TambahKunjunganModal
          customerId={showKunjunganModal}
          onClose={() => setShowKunjunganModal(null)}
          onSaved={() => { setShowKunjunganModal(null); loadData(); }}
        />
      )}
    </div>
  );
}

// ── Modal: Tambah Customer Baru ───────────────────────────────────────────────
function AddCustomerModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    namaCustomer: '', noHP: '', alamat: '',
    kota: '', wilayah: '', provinsi: '',
    namaUnit: '', serialNumber: '',
    tanggalBAST: '', kunjunganTerakhir: '',
    intervalMaintenance: 90,
    totalKunjunganFree: 2,
    catatan: '',
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) onSaved();
      else alert('Gagal menyimpan: ' + json.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalWrapper title="Tambah Customer Maintenance" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Nama Customer *" name="namaCustomer" value={form.namaCustomer} onChange={handleChange} required />
          <FormField label="No. HP" name="noHP" value={form.noHP} onChange={handleChange} />
          <FormField label="Kota *" name="kota" value={form.kota} onChange={handleChange} required />
          <FormField label="Wilayah / Area" name="wilayah" value={form.wilayah} onChange={handleChange} placeholder="e.g. Jabodetabek" />
          <FormField label="Provinsi" name="provinsi" value={form.provinsi} onChange={handleChange} />
          <FormField label="Nama Unit / Produk" name="namaUnit" value={form.namaUnit} onChange={handleChange} />
          <FormField label="Serial Number" name="serialNumber" value={form.serialNumber} onChange={handleChange} />
          <FormField label="Tanggal BAST" name="tanggalBAST" type="date" value={form.tanggalBAST} onChange={handleChange} />
          <FormField label="Kunjungan Terakhir" name="kunjunganTerakhir" type="date" value={form.kunjunganTerakhir} onChange={handleChange} />
          <FormField label="Interval Maintenance (hari)" name="intervalMaintenance" type="number" value={form.intervalMaintenance} onChange={handleChange} />
          <FormField label="Kunjungan Free (setelah BAST)" name="totalKunjunganFree" type="number" value={form.totalKunjunganFree} onChange={handleChange} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Alamat</label>
          <textarea name="alamat" value={form.alamat} onChange={handleChange} rows={2}
            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 7, padding: '6px 10px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Catatan</label>
          <textarea name="catatan" value={form.catatan} onChange={handleChange} rows={2}
            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 7, padding: '6px 10px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button type="button" onClick={onClose} style={btnSecondary}>Batal</button>
          <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ── Modal: Tambah Kunjungan ───────────────────────────────────────────────────
function TambahKunjunganModal({ customerId, onClose, onSaved }) {
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    teknisi: '', catatan: '', status: 'Selesai',
    isFree: false, berbayar: false, biaya: 0,
  });
  const [spareparts, setSpareparts] = useState([]);
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function addSparepart() {
    setSpareparts(prev => [...prev, { nama: '', qty: 1, klaim: false }]);
  }

  function updateSparepart(idx, field, value) {
    setSpareparts(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        kunjunganBaru: {
          ...form,
          biaya: Number(form.biaya),
          spareparts: spareparts.filter(s => s.nama),
        }
      };
      const res = await fetch(`/api/maintenance/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) onSaved();
      else alert('Gagal: ' + json.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalWrapper title="Tambah Kunjungan Maintenance" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Tanggal Kunjungan *" name="tanggal" type="date" value={form.tanggal} onChange={handleChange} required />
          <FormField label="Teknisi" name="teknisi" value={form.teknisi} onChange={handleChange} />
          <div>
            <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 7, padding: '6px 10px', fontSize: 13 }}>
              <option>Selesai</option>
              <option>Pending</option>
              <option>Dibatalkan</option>
            </select>
          </div>
          <FormField label="Biaya (Rp)" name="biaya" type="number" value={form.biaya} onChange={handleChange} />
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" name="isFree" checked={form.isFree} onChange={handleChange} /> Kunjungan Gratis (Garansi)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" name="berbayar" checked={form.berbayar} onChange={handleChange} /> Sudah Berbayar
          </label>
        </div>

        {/* Sparepart yang digunakan */}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Sparepart Digunakan</label>
            <button type="button" onClick={addSparepart}
              style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid #c8a97e', background: 'rgba(200,169,126,0.1)', color: '#92400e', cursor: 'pointer' }}>
              + Tambah
            </button>
          </div>
          {spareparts.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
              <input placeholder="Nama sparepart" value={s.nama} onChange={e => updateSparepart(idx, 'nama', e.target.value)}
                style={{ flex: 2, border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 8px', fontSize: 12 }} />
              <input type="number" placeholder="Qty" value={s.qty} onChange={e => updateSparepart(idx, 'qty', Number(e.target.value))}
                style={{ width: 60, border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 8px', fontSize: 12 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={s.klaim} onChange={e => updateSparepart(idx, 'klaim', e.target.checked)} /> Klaim
              </label>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>Catatan Kunjungan</label>
          <textarea name="catatan" value={form.catatan} onChange={handleChange} rows={2}
            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 7, padding: '6px 10px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button type="button" onClick={onClose} style={btnSecondary}>Batal</button>
          <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Menyimpan...' : 'Simpan Kunjungan'}</button>
        </div>
      </form>
    </ModalWrapper>
  );
}

// ── Shared UI helpers ─────────────────────────────────────────────────────────
function ModalWrapper({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        required={required} placeholder={placeholder}
        style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 7, padding: '6px 10px', fontSize: 13, boxSizing: 'border-box' }}
      />
    </div>
  );
}

const btnPrimary = { padding: '8px 20px', borderRadius: 8, background: '#16a34a', color: '#fff', border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
const btnSecondary = { padding: '8px 16px', borderRadius: 8, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 500, fontSize: 13, cursor: 'pointer' };