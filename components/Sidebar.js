'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/reports', label: 'Reports' },
  { href: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        height: '100vh',
        background: '#0b0b09',
        borderRight: '1px solid #232320',
        padding: 24,
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <div style={{ marginBottom: 42 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.3em',
            color: '#7f7a70',
            marginBottom: 10,
          }}
        >
          INVENTORY SYSTEM
        </div>

        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: '#f5f1e8',
          }}
           >
          StockSystem
        </div>
      </div>

      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                textDecoration: 'none',
                padding: '14px 16px',
                borderRadius: 14,
                background: active ? '#1a1a18' : 'transparent',
                color: active ? '#f5f1e8' : '#8f8877',
                border: active
                  ? '1px solid #2f2e2a'
                  : '1px solid transparent',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}