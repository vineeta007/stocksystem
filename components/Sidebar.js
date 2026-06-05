'use client';

import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';

const NAV = [
  { items: [
    { label: 'Dashboard',    href: '/' },
    { label: 'Products',     href: '/products' },
    { label: 'Vendor List', href: '/transactions' },
  ]},
  { group: 'Catalogue', items: [
    { label: 'Swift Parts',    href: '/products?cat=swift-parts' },
    { label: 'Lifting',        href: '/products?cat=lifting' },
    { label: 'PPE / Health',   href: '/products?cat=ppe-health' },
    { label: 'Chain Warranty', href: '/products?cat=chain-warranty' },
  ]},
  { group: 'Maintenance', items: [
    { label: '👥 Customer List',   href: '/maintenance' },
    { label: '📦 Klaim Sparepart', href: '/klaim' },
  ]},
  { group: 'Client Details', items: [
    { label: 'Data Garansi', href: '/clients' },
  ]},
  { group: 'System', items: [
    { label: 'Reports',  href: '/reports' },
    { label: 'Settings', href: '/settings' },
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
      width: '270px', flexShrink: 0,
      background: '#1E293B',
      borderRight: '1px solid rgba(148,163,184,0.1)',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', position: 'sticky', top: 0,
      fontFamily: "'Sora', sans-serif",
    }}>

      {/* Logo */}
      <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'center' }}>
        <img
          src="/kreativlogo1.png"
          alt="Kreativ Lift"
          style={{ width: '100%', height: '120px', objectFit: 'contain', borderRadius: '8px' }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '12px' }}>
        {NAV.map((section, i) => (
          <div key={i}>
            {section.group && (
              <div style={{
                fontSize: '11px', fontWeight: 700,
                color: '#475569',
                letterSpacing: '1.2px', textTransform: 'uppercase',
                padding: '16px 24px 6px',
              }}>{section.group}</div>
            )}
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'block', padding: '11px 24px',
                  fontSize: '15px', fontWeight: active ? 600 : 400,
                  color: active ? '#34D399' : '#94A3B8',
                  textDecoration: 'none',
                  borderLeft: `3px solid ${active ? '#1D9E75' : 'transparent'}`,
                  background: active ? 'rgba(29,158,117,0.12)' : 'transparent',
                  transition: 'all .15s',
                }}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(148,163,184,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(29,158,117,0.2)',
            border: '1px solid rgba(29,158,117,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: '#34D399',
          }}>{initials}</div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '15px', fontWeight: 600, color: '#F1F5F9',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{displayName}</div>
            {role && (
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '1px' }}>{role}</div>
            )}
          </div>
        </div>

        <button onClick={logout} style={{
          width: '100%', padding: '9px 0',
          background: 'transparent',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '7px',
          color: '#FCA5A5', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', fontFamily: "'Sora', sans-serif",
        }}>
          Sign out
        </button>
      </div>
    </aside>
  );
}