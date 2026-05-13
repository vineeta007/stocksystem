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
      width: '190px', flexShrink: 0,
      background: '#0F1F3D',
      borderRight: '1px solid #1E3A5F',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', position: 'sticky', top: 0,
      fontFamily: "'Sora', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.3px' }}>
        <span style={{ color: '#FFFFFF' }}>Stock</span>
        <span style={{ color: '#4EAAFF' }}>Vault</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '12px' }}>
        {NAV.map((section, i) => (
          <div key={i}>
            {section.group && (
              <div style={{
                fontSize: '10px', fontWeight: 600, color: '#4A7BAF',
                letterSpacing: '1.2px', textTransform: 'uppercase',
                padding: '14px 20px 6px',
              }}>{section.group}</div>
            )}
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '?');
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'block', padding: '10px 20px',
                  fontSize: '14px', fontWeight: active ? 600 : 500,
                  color: active ? '#4EAAFF' : '#B8D4F0',
                  textDecoration: 'none',
                  borderLeft: `3px solid ${active ? '#2E90FA' : 'transparent'}`,
                  background: active ? 'rgba(46,144,250,.14)' : 'transparent',
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
        padding: '16px 20px', borderTop: '1px solid #1E3A5F',
      }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: '#1A6DB5', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '12px', fontWeight: 700,
          color: '#FFFFFF', flexShrink: 0,
        }}>SA</div>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#B8D4F0' }}>Studio Admin</span>
      </div>
    </aside>
  );
}