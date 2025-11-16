"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/services/auth.service";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const next = {};

    if (!name.trim()) next.name = "Name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Invalid email format.";
    if (!password.trim()) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Must be at least 8 characters.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    if (!validate()) return;

    setLoading(true);
    const res = await AuthService.register({ name, email, password });
    setLoading(false);

    if (!res.ok) {
      setServerError(res.error || "Registration failed.");
      return;
    }

    setSuccess("Account created successfully! Redirecting to sign in…");
    setTimeout(() => router.push("/auth/sign-in"), 1000);
  }

  return (
    <main style={pageBg}>
      <div style={wrapper}>
        <div style={card}>
          <h1 style={title}>Create account</h1>
          <p style={subtitle}>Sign up to start playing Kiwi Num Slide.</p>

          <form onSubmit={handleSubmit} style={form}>
            {/* Name */}
            <div style={field}>
              <label htmlFor="name" style={label}>
                Name
              </label>
              <input
                id="name"
                type="text"
                style={{
                  ...input,
                  ...(errors.name ? inputErrorBorder : null),
                }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <p style={errorText}>{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div style={field}>
              <label htmlFor="email" style={label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                style={{
                  ...input,
                  ...(errors.email ? inputErrorBorder : null),
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p style={errorText}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div style={field}>
              <label htmlFor="password" style={label}>
                Password
              </label>
              <input
                id="password"
                type="password"
                style={{
                  ...input,
                  ...(errors.password ? inputErrorBorder : null),
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p style={helperText}>At least 8 characters.</p>
              {errors.password && (
                <p style={errorText}>{errors.password}</p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <p style={{ ...errorText, marginTop: 4 }}>{serverError}</p>
            )}

            {/* Success */}
            {success && (
              <p style={successText}>{success}</p>
            )}

            <button type="submit" disabled={loading} style={button}>
              {loading ? "Creating account…" : "Sign up"}
            </button>
          </form>

          <p style={bottomText}>
            Already have an account?{" "}
            <Link href="/auth/sign-in" style={link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

/* --- estilos inline reutilizables --- */

const pageBg = {
  minHeight: "calc(100vh - 56px)", // deja espacio para tu header rosa
  background: "#fdf5ff",
  padding: "32px 16px",
};

const wrapper = {
  maxWidth: 480,
  margin: "0 auto",
};

const card = {
  background: "#ffffff",
  borderRadius: 18,
  padding: 24,
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.09)",
  border: "1px solid #f1e4ff",
};

const title = {
  fontSize: 28,
  fontWeight: 900,
  margin: 0,
  marginBottom: 8,
};

const subtitle = {
  margin: 0,
  marginBottom: 20,
  color: "#4b5563",
  fontSize: 14,
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const field = {
  display: "flex",
  flexDirection: "column",
};

const label = {
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
};

const input = {
  padding: "8px 11px",
  borderRadius: 999,
  border: "1px solid #d1d5db",
  fontSize: 14,
  outline: "none",
  backgroundColor: "#f9fafb",
};

const inputErrorBorder = {
  borderColor: "#f97373",
};

const helperText = {
  fontSize: 11,
  color: "#6b7280",
  marginTop: 4,
};

const errorText = {
  fontSize: 12,
  color: "#b91c1c",
  marginTop: 4,
};

const successText = {
  fontSize: 12,
  color: "#15803d",
  marginTop: 8,
  fontWeight: 600,
};

const button = {
  marginTop: 8,
  padding: "10px 14px",
  borderRadius: 999,
  border: "none",
  background: "#111827",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
};

const bottomText = {
  marginTop: 18,
  fontSize: 13,
  textAlign: "center",
  color: "#4b5563",
};

const link = {
  color: "#1d4ed8",
  textDecoration: "underline",
  fontWeight: 600,
};
