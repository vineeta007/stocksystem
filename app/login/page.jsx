"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(from);
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#0f172a", fontFamily: "sans-serif"
    }}>
      <div style={{
        background: "#1e293b", border: "1px solid #334155",
        borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 400,
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)"
      }}>
        {/* Logo / Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: "#3b82f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 12px"
          }}>📦</div>
          <h1 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700, margin: 0 }}>
            StockVault
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{
              display: "block", color: "#94a3b8", fontSize: 11,
              fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6
            }}>
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8,
                background: "#0f172a", border: "1px solid #334155",
                color: "#f1f5f9", fontSize: 14, outline: "none",
                boxSizing: "border-box", transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#334155"}
            />
          </div>

          <div>
            <label style={{
              display: "block", color: "#94a3b8", fontSize: 11,
              fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6
            }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8,
                background: "#0f172a", border: "1px solid #334155",
                color: "#f1f5f9", fontSize: 14, outline: "none",
                boxSizing: "border-box", transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#334155"}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, padding: "10px 12px", color: "#f87171", fontSize: 13
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4, padding: "12px", borderRadius: 8, border: "none",
              background: loading ? "#1d4ed8" : "#3b82f6", color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s", letterSpacing: "0.02em"
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}