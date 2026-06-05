'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  { items: [
    { label: 'Dashboard',    href: '/' },
    { label: 'Products',     href: '/products' },
    { label: 'Transactions', href: '/transactions' },
  ]},
  { group: 'Catalogue', items: [
    { label: 'Swift Parts',    href: '/products?cat=swift-parts' },
    { label: 'Lifting',        href: '/products?cat=lifting' },
    { label: 'PPE / Health',   href: '/products?cat=ppe-health' },
    { label: 'Chain Warranty', href: '/products?cat=chain-warranty' },
  ]},
  { group: 'Maintenance', items: [
    { label: '🔧 Data Maintenance', href: '/maintenance' },
    { label: '📦 Klaim Sparepart',  href: '/klaim' },
  ]},
  { group: 'Client Details', items: [
    { label: 'Data Garansi', href: '/clients' },
  ]},
  { group: 'System', items: [
    { label: 'Reports',  href: '/reports' },
    { label: 'Settings', href: '/settings' },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '220px', flexShrink: 0,
      background: '#1E293B',
      borderRight: '1px solid rgba(148,163,184,0.1)',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', position: 'sticky', top: 0,
      fontFamily: "'Sora', sans-serif",
    }}>

      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', fontSize: '19px', fontWeight: 700, letterSpacing: '-0.3px' }}>
        <span style={{ color: '#F1F5F9' }}>Stock</span>
        <span style={{ color: '#34D399' }}>Vault</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '12px' }}>
        {NAV.map((section, i) => (
          <div key={i}>
            {section.group && (
              <div style={{
                fontSize: '10px', fontWeight: 600,
                color: '#475569',
                letterSpacing: '1.2px', textTransform: 'uppercase',
                padding: '14px 20px 6px',
              }}>{section.group}</div>
            )}
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'block', padding: '9px 20px',
                  fontSize: '14px', fontWeight: active ? 600 : 400,
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

      {/* User */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '16px 20px',
        borderTop: '1px solid rgba(148,163,184,0.1)',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(29,158,117,0.2)',
          border: '1px solid rgba(29,158,117,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 700,
          color: '#34D399', flexShrink: 0,
        }}>SA</div>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#94A3B8' }}>Studio Admin</span>
      </div>
    </aside>
  );
}