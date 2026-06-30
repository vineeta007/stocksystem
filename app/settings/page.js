'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const BORDER = '#e0e0e0';
const TEXT = '#1a1a1a';
const FAINT = '#888888';
const ACCENT = '#c9a14a';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'after_sales_1', label: 'After Sales 1' },
  { value: 'after_sales_2', label: 'After Sales 2' },
  { value: 'finance', label: 'Finance' },
  { value: 'finance_admin', label: 'Finance Admin' },
  { value: 'director', label: 'Director' },
  { value: 'logistic', label: 'Logistic' },
  { value: 'admin_backup', label: 'Admin Backup' },
];

function roleLabel(role) {
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function SettingsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ padding: '24px', borderBottom: `1px solid ${BORDER}`, textAlign: 'center' }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            fontWeight: 700,
            color: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28 }}>⚙️</span>
          Settings
        </div>
      </div>

      <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', color: FAINT, textTransform: 'uppercase', fontWeight: 600 }}>
            User Accounts
          </div>
          <button
            onClick={() => setAddingUser(true)}
            style={{
              background: ACCENT,
              border: 'none',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '8px 18px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            + Add Member
          </button>
        </div>

        {loading && <div style={{ color: FAINT, fontSize: 14 }}>Loading users...</div>}
        {error && <div style={{ color: '#c0392b', fontSize: 14 }}>{error}</div>}

        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
            {users.map((u, idx) => {
              const isSelf = currentUser?.id === u._id;
              return (
                <div
                  key={u._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: idx === users.length - 1 ? 'none' : `1px solid ${BORDER}`,
                    background: isSelf ? '#fbf7ee' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        border: `1.5px solid ${ACCENT}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                        color: ACCENT,
                        letterSpacing: '0.05em',
                        flexShrink: 0,
                      }}
                    >
                      {u.initials || u.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, color: TEXT, fontWeight: 600 }}>
                        {u.displayName}
                        {isSelf && (
                          <span
                            style={{
                              fontSize: 10,
                              color: '#ffffff',
                              background: ACCENT,
                              marginLeft: 10,
                              padding: '2px 7px',
                              borderRadius: 4,
                              letterSpacing: '0.08em',
                              fontWeight: 700,
                            }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: FAINT, marginTop: 3 }}>
                        @{u.username} · {roleLabel(u.role)}
                      </div>
                    </div>
                  </div>

                  {isSelf && (
                    <button
                      onClick={() => setEditingUser(u)}
                      style={{
                        background: ACCENT,
                        border: 'none',
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '8px 18px',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}

      {addingUser && (
        <AddUserModal
          onClose={() => setAddingUser(false)}
          onSaved={() => {
            setAddingUser(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

function AddUserModal({ onClose, onSaved }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState(ROLE_OPTIONS[0].value);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    setError('');

    if (!username.trim() || !displayName.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, displayName, role, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 10,
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          padding: 32,
          width: 380,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: '#000000', marginBottom: 4 }}>
          New Member
        </div>
        <div style={{ fontSize: 10, color: '#888888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 22, fontWeight: 600 }}>
          Add Account
        </div>

        <label style={labelStyle}>Display Name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Wahyu"
          style={inputStyle}
        />

        <label style={labelStyle}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. wahyu"
          style={inputStyle}
        />

        <label style={labelStyle}>Designation</label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Admin"
          list="role-suggestions"
          style={inputStyle}
        />
        <datalist id="role-suggestions">
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value} />
          ))}
        </datalist>

        <label style={labelStyle}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={inputStyle}
        />

        {error && <div style={{ color: '#c0392b', fontSize: 12, marginBottom: 14 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            onClick={handleCreate}
            disabled={saving}
            style={{
              flex: 1,
              background: ACCENT,
              border: 'none',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '11px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {saving ? 'Creating...' : 'Create'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: '#f0f0f0',
              border: '1px solid #dddddd',
              color: '#333333',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '11px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 11,
  color: '#555555',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  fontWeight: 600,
  display: 'block',
};

const inputStyle = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid #cccccc',
  borderRadius: 6,
  color: '#000000',
  fontSize: 14,
  padding: '10px 12px',
  margin: '6px 0 18px',
  boxSizing: 'border-box',
};

function EditUserModal({ user, onClose, onSaved }) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setError('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const body = {};
    if (username.trim().toLowerCase() !== user.username) body.username = username;
    if (password) body.password = password;

    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 10,
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          padding: 32,
          width: 380,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: '#000000', marginBottom: 4 }}>
          {user.displayName}
        </div>
        <div style={{ fontSize: 10, color: '#888888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 22, fontWeight: 600 }}>
          Edit Your Account
        </div>

        <label style={labelStyle}>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>New Password (leave blank to keep current)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {password && (
          <>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />
          </>
        )}

        {error && <div style={{ color: '#c0392b', fontSize: 12, marginBottom: 14 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              background: ACCENT,
              border: 'none',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '11px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: '#f0f0f0',
              border: '1px solid #dddddd',
              color: '#333333',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '11px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}