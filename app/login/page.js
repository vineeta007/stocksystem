'use client';
// app/login/page.js
// The login page. On success, redirects to /dashboard.

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './login.module.css';

const QUICK_USERS = [
  { key: 'asha',     label: 'Asha',         sub: 'Admin',              initials: 'AS', color: 'red'    },
  { key: 'puji',     label: 'Puji',         sub: 'After Sales PIC 1',  initials: 'PJ', color: 'blue'   },
  { key: 'sari',     label: 'Sari',         sub: 'After Sales PIC 2',  initials: 'SR', color: 'teal'   },
  { key: 'finance',  label: 'Finance',      sub: 'Finance PIC',        initials: 'FN', color: 'amber'  },
  { key: 'cindy',    label: 'Cindy',        sub: 'Finance Admin',      initials: 'CY', color: 'purple' },
  { key: 'sunny',    label: 'Sunny',        sub: 'Director',           initials: 'SN', color: 'green'  },
  { key: 'logistic', label: 'Logistic',     sub: 'Warehouse View',     initials: 'LG', color: 'coral'  },
  { key: 'backup',   label: 'Backup Admin', sub: 'Admin Backup',       initials: 'BK', color: 'gray'   },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  function fillUser(key) {
    setUsername(key);
    setPassword('');
    setError('');
    setActiveUser(key);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (result.success) {
      router.push(from);
    } else {
      setError(result.error || 'Login failed.');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>Quick select</p>
          {QUICK_USERS.map((u) => (
            <button
              key={u.key}
              type="button"
              className={`${styles.userBtn} ${activeUser === u.key ? styles.userBtnActive : ''}`}
              onClick={() => fillUser(u.key)}
            >
              <span className={`${styles.avatar} ${styles['av_' + u.color]}`}>
                {u.initials}
              </span>
              <span className={styles.userInfo}>
                <span className={styles.userName}>{u.label}</span>
                <span className={styles.userSub}>{u.sub}</span>
              </span>
            </button>
          ))}
        </aside>

        {/* Main form */}
        <main className={styles.main}>
          <div className={styles.header}>
            <span className={styles.logo}>📦</span>
            <div>
              <h1 className={styles.appName}>StockSystem</h1>
              <p className={styles.appSub}>Sign in to continue</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
            <div className={styles.field}>
              <label htmlFor="username" className={styles.label}>Username</label>
              <input
                id="username"
                type="text"
                className={styles.input}
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter username"
                autoCapitalize="none"
                spellCheck={false}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.pwWrap}>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className={styles.input}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}