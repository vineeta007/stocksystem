import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'StockVault — Inventory Management',
  description: 'Inventory management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{
            marginLeft: '200px',
            flex: 1,
            minHeight: '100vh',
            background: '#0f0e0c',
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}