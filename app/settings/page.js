'use client';

import { useState, useEffect } from 'react';

const BORDER = '#1e1e16';
const TEXT = '#d8d4c8';
const FAINT = '#3a3830';
const ACCENT = '#c9a14a';

function roleLabel(role) {
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function SettingsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);

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
    <div style={{ minHeight: '100vh' }}>
      <div style={{ padding: '18px 24px 14px', borderBottom: `0.5px solid ${BORDER}` }}>
        <div style={{ fontSize: 8, letterSpacing: '0.3em', color: FAINT, textTransform: 'uppercase', marginBottom: 3 }}>
          Configuration
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: TEXT }}>
          Settings
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: FAINT, textTransform: 'uppercase', marginBottom: 16 }}>
          User Accounts
        </div>

        {loading && <div style={{ color: FAINT, fontSize: 13 }}>Loading users...</div>}
        {error && <div style={{ color: '#c66', fontSize: 13 }}>{error}</div>}

        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {users.map((u) => (
              <div
                key={u._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderBottom: `0.5px solid ${BORDER}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: `1px solid ${ACCENT}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      color: ACCENT,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {u.initials || u.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: TEXT }}>{u.displayName}</div>
                    <div style={{ fontSize: 10, color: FAINT, marginTop: 2 }}>
                      @{u.username} · {roleLabel(u.role)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setEditingUser(u)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${BORDER}`,
                    color: TEXT,
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '6px 14px',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
              </div>
            ))}
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
    </div>
  );
}

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
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#161410',
          border: `1px solid ${BORDER}`,
          padding: 28,
          width: 360,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: TEXT, marginBottom: 4 }}>
          {user.displayName}
        </div>
        <div style={{ fontSize: 9, color: FAINT, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 20 }}>
          Edit Account
        </div>

        <label style={{ fontSize: 9, color: FAINT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Username
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: '100%',
            background: 'transparent',
            border: `1px solid ${BORDER}`,
            color: TEXT,
            fontSize: 13,
            padding: '8px 10px',
            margin: '6px 0 16px',
          }}
        />

        <label style={{ fontSize: 9, color: FAINT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          New Password (leave blank to keep current)
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            background: 'transparent',
            border: `1px solid ${BORDER}`,
            color: TEXT,
            fontSize: 13,
            padding: '8px 10px',
            margin: '6px 0 16px',
          }}
        />

        {password && (
          <>
            <label style={{ fontSize: 9, color: FAINT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: `1px solid ${BORDER}`,
                color: TEXT,
                fontSize: 13,
                padding: '8px 10px',
                margin: '6px 0 16px',
              }}
            />
          </>
        )}

        {error && <div style={{ color: '#c66', fontSize: 11, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1,
              background: ACCENT,
              border: 'none',
              color: '#1e1e16',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '10px',
              cursor: 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              color: TEXT,
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '10px',
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