"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const data = await res.json();
      setError(data.message || "Invalid credentials");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#0f172a"
    }}>
      <div style={{
        background: "#1e293b", border: "1px solid #334155",
        borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 400
      }}>
        <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          StockVault
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 28 }}>
          Sign in to your account
        </p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em" }}>
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 8,
                background: "#0f172a", border: "1px solid #334155", color: "#f1f5f9",
                fontSize: 14, outline: "none", boxSizing: "border-box"
              }}
            />
          </div>

          <div>
            <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em" }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 8,
                background: "#0f172a", border: "1px solid #334155", color: "#f1f5f9",
                fontSize: 14, outline: "none", boxSizing: "border-box"
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8, padding: "12px", borderRadius: 8, border: "none",
              background: "#3b82f6", color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}