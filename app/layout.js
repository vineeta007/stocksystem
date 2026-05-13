import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = {
  title: 'StockVault',
  description: 'Inventory Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}