import './globals.css';
import LayoutShell from '../components/LayoutShell';

export const metadata = {
  title: 'StockVault',
  description: 'Inventory Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}