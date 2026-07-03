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
  title: 'Kreativ Lift',
  description: 'Kreativ Lift Inventory & Maintenance Management System',
  icons: {
    icon: '/kreativlogo.png',
    shortcut: '/kreativlogo.png',
    apple: '/kreativlogo.png',
  },
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