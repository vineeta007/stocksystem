import './globals.css';
import LayoutShell from '../components/LayoutShell';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'StockVault',
  description: 'Inventory Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}