import './globals.css';

import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'StockSystem',
  description: 'Luxury Inventory Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />

        <main className="main-layout">
          {children}
        </main>
      </body>
    </html>
  );
}