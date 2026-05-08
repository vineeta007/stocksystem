'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/',             label: 'Dashboard'   },
  { href: '/products',     label: 'Products'    },
  { href: '/transactions', label: 'Transactions'},
];

const CATALOGUE = [
  { href: '/products?cat=Swift',     label: 'Swift Parts'    },
  { href: '/products?cat=Lifting',   label: 'Lifting'        },
  { href: '/products?cat=PPE',       label: 'PPE / Health'   },
  { href: '/products?cat=Chain',     label: 'Chain Warranty' },
];

const SYSTEM = [
  { href: '/reports',  label: 'Reports'  },
  { href: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const linkStyle = (href) => ({
    display: 'block',
    padding: '7px 14px',
    fontSize: '11px',
    fontWeight: pathname === href ? 500 : 400,
    color: pathname === href ? '#e8e4d9' : '#5a5850',
    background: pathname === href ? '#1e1d19' : 'transparent',
    borderLeft: pathname === href ? '2px solid #c9a84c' : '2px solid transparent',
    textDecoration: 'none',
    letterSpacing: '0.02em',
    transition: 'color 0.15s',
  });

  const subLinkStyle = (href) => ({
    display: 'block',
    padding: '6px 14px',
    fontSize: '10px',
    color: pathname === href ? '#c9a84c' : '#5a5850',
    textDecoration: 'none',
    letterSpacing: '0.02em',
  });

  const sectionLabel = (text) => (
    <div style={{
      padding: '14px 14px 4px',
      fontSize: '7px',
      color: '#3a3830',
      letterSpacing: '0.25em',
      textTransform: 'uppercase',
    }}>{text}</div>
  );

  return (
    <aside style={{
      width: '140px',
      minHeight: '100vh',
      background: '#0d0c0a',
      borderRight: '0.5px solid #1a1915',
      position: 'fixed',
      top: 0, left: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 14px 14px', borderBottom: '0.5px solid #1a1915' }}>
        <div style={{ fontSize: '7px', color: '#3a3830', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '3px' }}>
          Inventory Management
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: 600, letterSpacing: '0.02em' }}>
          <span style={{ color: '#c9a84c' }}>Stock</span>
          <span style={{ color: '#e8e4d9' }}>Vault</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: '12px', overflowY: 'auto' }}>
        {NAV.map(({ href, label }) => (
          <Link key={href} href={href} style={linkStyle(href)}>{label}</Link>
        ))}

        {sectionLabel('Catalogue')}
        {CATALOGUE.map(({ href, label }) => (
          <Link key={href} href={href} style={subLinkStyle(href)}>{label}</Link>
        ))}

        {sectionLabel('System')}
        {SYSTEM.map(({ href, label }) => (
          <Link key={href} href={href} style={linkStyle(href)}>{label}</Link>
        ))}
      </nav>

      {/* User */}
      <div style={{
        padding: '12px 14px',
        borderTop: '0.5px solid #1a1915',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <div style={{
          width: '22px', height: '22px', borderRadius: '50%',
          background: '#2a2925',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '8px', color: '#8a8678', flexShrink: 0,
        }}>SA</div>
        <div style={{ fontSize: '9px', color: '#5a5850' }}>Studio Admin</div>
      </div>
    </aside>
  );
}