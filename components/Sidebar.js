'use client';

import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';

const NAV = [
  { items: [
    { label: '🏠 Dashboard',      href: '/' },
    { label: '📦 Products',        href: '/products' },
    { label: '🏪 Vendor List',     href: '/vendors' },
  ]},
  { items: [
    { label: '👥 Customer List',   href: '/maintenance' },
    { label: '📦 Klaim Sparepart', href: '/klaim' },
  ]},
  { items: [
    { label: '🛡️ Data Garansi',    href: '/clients' },
    { label: '💸 Expenses',         href: '/expenses' },
  ]},
  { items: [
    { label: '📊 Reports',         href: '/reports' },
    { label: '⚙️ Settings',        href: '/settings' },
  ]},
];

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function Sidebar() {
  const pathname = usePathname();
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const logout = auth?.logout ?? (() => {});

  const displayName = user?.name || user?.username || 'User';
  const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
  const initials = getInitials(displayName);

  return (
    <aside style={{
      width: '260px', flexShrink: 0,
      background: '#3a3a3a',
      borderRight: '1px solid rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      fontFamily: "'Sora', sans-serif",
    }}>

      {/* Logo */}
      <div style={{ padding: '0', display: 'flex', alignItems: 'center' }}>
        <img
          src="/kreativlogo1.png"
          alt="Kreativ Lift"
          style={{ width: '100%', height: '130px', objectFit: 'cover' }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '12px', marginTop: '4px', overflowY: 'auto' }}>
        {NAV.map((section, i) => (
          <div key={i}>
            {section.items.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
              return (
                <div key={item.href}>
                  <Link href={item.href} style={{
                    display: 'block', padding: '13px 20px',
                    fontSize: '22px', fontWeight: active ? 700 : 600,
                    fontFamily: "'Cormorant Garamond', serif",
                    color: active ? '#ffffff' : '#cccccc',
                    textDecoration: 'none',
                    borderLeft: `3px solid ${active ? '#CC2020' : 'transparent'}`,
                    background: active ? 'rgba(204,32,32,0.15)' : 'transparent',
                    transition: 'all .15s',
                  }}>
                    {item.label}
                  </Link>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 12px' }} />
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div style={{
        padding: '14px 18px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(204,32,32,0.2)',
            border: '1px solid rgba(204,32,32,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: '#ff6b6b',
          }}>{initials}</div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '13px', fontWeight: 600, color: '#f0f0f0',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{displayName}</div>
            {role && (
              <div style={{ fontSize: '11px', color: '#888888', marginTop: '1px' }}>{role}</div>
            )}
          </div>
        </div>

        <button onClick={logout} style={{
          width: '100%', padding: '8px 0',
          background: 'transparent',
          border: '1px solid rgba(204,32,32,0.3)',
          borderRadius: '6px',
          color: '#ff9999', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', fontFamily: "'Sora', sans-serif",
          letterSpacing: '0.5px',
        }}>
          Sign out
        </button>
      </div>
    </aside>
  );
}