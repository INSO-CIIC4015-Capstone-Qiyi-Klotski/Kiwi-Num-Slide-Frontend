"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/services/auth.service";
import "../styles.css";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};

    if (!email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Invalid email format.";

    if (!password.trim()) next.password = "Password is required.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    if (!validate()) return;

    setSubmitting(true);
    const res = await AuthService.login({ email, password });
    setSubmitting(false);

    if (!res.ok) {
      setServerError(res.error || "Invalid credentials.");
      return;
    }

    setSuccessMsg("Signed in successfully! Redirecting…");
    setTimeout(() => router.push("/users/me"), 800);
  }

  return (
    <main className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-card">
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-subtitle">
            Log in to continue playing Kiwi Num Slide.
          </p>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`auth-input ${
                  errors.email ? "auth-input-error" : ""
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={errors.email ? "true" : "false"}
                autoComplete="email"
              />
              {errors.email && (
                <p className="auth-error">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className={`auth-input ${
                  errors.password ? "auth-input-error" : ""
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={errors.password ? "true" : "false"}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="auth-error">{errors.password}</p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <p className="auth-error auth-error-global">
                {serverError}
              </p>
            )}

            {/* Success */}
            {successMsg && (
              <p className="auth-success">{successMsg}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="auth-button"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="auth-bottom-text">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
