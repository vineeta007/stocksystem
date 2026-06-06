"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className={styles.page}>

      <div className={styles.leftPanel}>
        <div className={styles.leftInner}>
          <img
            src="/kreativlogo1.png"
            alt="Kreativ Lift"
            className={styles.logo}
          />
          <p className={styles.tagline}>KREATIV LIFT</p>
          <span className={styles.divider} />
          <p className={styles.taglineSub}>ELEVATE WITH US</p>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.rightInner}>
          <p className={styles.portalLabel}>ADMIN PORTAL</p>
          <h1 className={styles.heading}>Sign In</h1>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputWrap}>
              <input
                type="text"
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                autoFocus
              />
            </div>

            <div className={styles.inputWrap}>
              <input
                type={showPassword ? "text" : "password"}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((p) => !p)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            <div className={styles.forgotRow}>
              <a href="/forgot-password" className={styles.forgotLink}>Forgot password?</a>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !username || !password}
            >
              {loading ? "SIGNING IN…" : "ENTER"}
            </button>
          </form>

          <p className={styles.footer}>© 2026 Kreativ Lift. All rights reserved.</p>
        </div>
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