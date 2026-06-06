"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function LayoutShell({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname.startsWith("/login");

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        minWidth: 0,
        background: "#f5f5f5",
      }}>
        {children}
      </main>
    </div>
  );
}