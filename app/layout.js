import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "StockVault",
  description: "Inventory Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="layout">
          <Sidebar />

          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}