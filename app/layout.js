import './globals.css';
import Sidebar from '../components/Sidebar';
import { headers } from 'next/headers';

export const metadata = {
  title: 'StockVault',
  description: 'Inventory Management System',
};

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isLoginPage = pathname.startsWith('/login');

  return (
    <html lang="en">
      <body>
        {isLoginPage ? (
          <>{children}</>
        ) : (
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
              flex: 1,
              minWidth: 0,
              background: 'var(--navy)',
            }}>
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}