import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <p className="logo-small">INVENTORY MANAGEMENT</p>
        <h1 className="logo">StockVault</h1>

        <nav className="nav">
          <Link href="/">Dashboard</Link>
          <Link href="/products">Products</Link>
          <Link href="/transactions">Transactions</Link>
          <Link href="/reports">Reports</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </div>

      <div className="admin">
        <div className="avatar">SA</div>

        <div>
          <h4>Studio Admin</h4>
          <p>Supervisor</p>
        </div>
      </div>
    </aside>
  );
}