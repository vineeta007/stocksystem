'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/', icon: '▦' },
  { label: 'Products', href: '/products', icon: '◫' },
  { label: 'Transactions', href: '/transactions', icon: '⇅' },
];

const catalogueItems = [
  { label: 'Swift Parts', href: '/products?cat=swift', icon: '◈' },
  { label: 'Lifting', href: '/products?cat=lifting', icon: '↑' },
  { label: 'PPE / Health', href: '/products?cat=ppe', icon: '+' },
  { label: 'Chain Warranty', href: '/products?cat=chain', icon: '⌀' },
];

const systemItems = [
  { label: 'Reports', href: '/reports', icon: '≡' },
  { label: 'Settings', href: '/settings', icon: '⚙' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '140px',
      minHeight: '100vh',
      background: '#141310',
      borderRight: '1px solid #2a2925',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 24px', borderBottom: '1px solid #2a2925' }}>
        <div style={{ fontSize: '8px', letterSpacing: '0.2em', color: '#5a5850', textTransform: 'uppercase', marginBottom: '2px' }}>
          Inventory<br />Management
        </div>
        <div style={{ fontSize: '18px', fontFamily: 'Space Mono, monospace', fontWeight: 700, color: '#e8e4d9', letterSpacing: '-0.5px' }}>
          Stock<span style={{ color: '#c9a84c' }}>Vault</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        <NavSection items={navItems} pathname={pathname} />

        <SectionLabel label="Catalogue" />
        <NavSection items={catalogueItems} pathname={pathname} />

        <SectionLabel label="System" />
        <NavSection items={systemItems} pathname={pathname} />
      </nav>

      {/* User */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #2a2925',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{
          width: '28px', height: '28px',
          borderRadius: '50%',
          background: '#c9a84c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 700, color: '#0f0e0c',
          flexShrink: 0,
        }}>SA</div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#e8e4d9' }}>Studio Admin</div>
          <div style={{ fontSize: '9px', color: '#5a5850', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Supervisor</div>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ label }) {
  return (
    <div style={{
      padding: '14px 16px 4px',
      fontSize: '8px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      color: '#5a5850',
    }}>{label}</div>
  );
}

function NavSection({ items, pathname }) {
  return (
    <div>
      {items.map(item => {
        const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href.split('?')[0]));
        return (
          <Link key={item.href} href={item.href} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            color: active ? '#e8e4d9' : '#6a6860',
            background: active ? '#252420' : 'transparent',
            textDecoration: 'none',
            fontSize: '12px',
            borderLeft: active ? '2px solid #c9a84c' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: '10px', width: '14px', textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}