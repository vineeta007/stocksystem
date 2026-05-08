'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/',             label: 'Dashboard'    },
  { href: '/products',     label: 'Products'     },
  { href: '/transactions', label: 'Transactions' },
];
const CATALOGUE = [
  { href: '/products?cat=Swift',   label: 'Swift Parts'    },
  { href: '/products?cat=Lifting', label: 'Lifting'        },
  { href: '/products?cat=PPE',     label: 'PPE / Health'   },
  { href: '/products?cat=Chain',   label: 'Chain Warranty' },
];
const SYSTEM = [
  { href: '/reports',  label: 'Reports'  },
  { href: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const active = (href) => pathname === href;

  return (
    <aside style={{
      width: '200px', minHeight: '100vh',
      background: '#1a2332',
      position: 'fixed', top: 0, left: 0,
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '5px' }}>
          Inventory Management
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px' }}>
          <span style={{ color: '#fff' }}>Stock</span>
          <span style={{ color: '#60a5fa' }}>Vault</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        {NAV.map(({ href, label }) => (
          <Link key={href} href={href} style={{
            display: 'block', padding: '9px 12px', borderRadius: '6px',
            marginBottom: '2px', fontSize: '13px', fontWeight: active(href) ? 600 : 400,
            color: active(href) ? '#fff' : 'rgba(255,255,255,0.45)',
            background: active(href) ? 'rgba(96,165,250,0.15)' : 'transparent',
            borderLeft: active(href) ? '2px solid #60a5fa' : '2px solid transparent',
          }}>{label}</Link>
        ))}

        <div style={{ padding: '14px 12px 5px', fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Catalogue
        </div>
        {CATALOGUE.map(({ href, label }) => (
          <Link key={href} href={href} style={{
            display: 'block', padding: '7px 12px', borderRadius: '6px',
            marginBottom: '1px', fontSize: '12px',
            color: 'rgba(255,255,255,0.38)',
          }}>{label}</Link>
        ))}

        <div style={{ padding: '14px 12px 5px', fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          System
        </div>
        {SYSTEM.map(({ href, label }) => (
          <Link key={href} href={href} style={{
            display: 'block', padding: '9px 12px', borderRadius: '6px',
            marginBottom: '2px', fontSize: '13px', fontWeight: active(href) ? 600 : 400,
            color: active(href) ? '#fff' : 'rgba(255,255,255,0.45)',
            background: active(href) ? 'rgba(96,165,250,0.15)' : 'transparent',
            borderLeft: active(href) ? '2px solid #60a5fa' : '2px solid transparent',
          }}>{label}</Link>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#2d4a6b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#93c5fd', fontWeight: 600, flexShrink: 0 }}>SA</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>Studio Admin</div>
      </div>
    </aside>
  );
}