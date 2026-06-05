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
    <div style={{ display: "flex", minHeight: "100vh", background: "#0F172A" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        minWidth: 0,
        background: "#0F172A",
      }}>
        {children}
      </main>
    </div>
  );
}