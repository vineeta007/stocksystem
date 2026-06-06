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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}