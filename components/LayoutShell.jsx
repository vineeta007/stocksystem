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
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f5f5f5" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        minWidth: 0,
        overflowY: "auto",
        background: "#f5f5f5",
      }}>
        {children}
      </main>
    </div>
  );
}