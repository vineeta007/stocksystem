import './globals.css';
import LayoutShell from '../components/LayoutShell';
import { AuthProvider } from '../context/AuthContext';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-cormorant',
});

export const metadata = {
  title: 'StockVault',
  description: 'Inventory Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cormorant.variable}>
      <body>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}