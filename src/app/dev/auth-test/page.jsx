"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.service";

function JSONView({ data }) {
  return (
    <pre
      style={{
        background: "#0b1220",
        color: "#c9e4ff",
        padding: 12,
        borderRadius: 8,
        overflowX: "auto",
        fontSize: 12,
      }}
    >
      {data ? JSON.stringify(data, null, 2) : "Sin resultados aún..."}
    </pre>
  );
}

export default function AuthTestPage() {
  // forms
  const [name, setName] = useState("Ada Lovelace");
  const [email, setEmail] = useState("ada@example.com");
  const [password, setPassword] = useState("Str0ngP@ss");

  const [verifyEmail, setVerifyEmail] = useState("ada@example.com");
  const [verifyToken, setVerifyToken] = useState("");

  const [loginEmail, setLoginEmail] = useState("ada@example.com");
  const [loginPassword, setLoginPassword] = useState("Str0ngP@ss");

  const [refreshTokenInput, setRefreshTokenInput] = useState("");

  // estado de UI
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function run(action, fn) {
    try {
      setLoading(true);
      const res = await fn();
      setResult({ action, ...res });
    } catch (e) {
      setResult({ action, ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Auth Test</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Página de pruebas para endpoints de <code>/auth</code>.
      </p>

      {/* REGISTER */}
      <section style={card}>
        <h2 style={h2}>POST /auth/register</h2>
        <div style={row}>
          <input style={input} placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
          <input style={input} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input style={input} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button
            style={btn}
            disabled={loading}
            onClick={() =>
              run("register", () => AuthService.register({ name, email, password }))
            }
          >
            Registrar
          </button>
        </div>
      </section>

      {/* SEND VERIFICATION */}
      <section style={card}>
        <h2 style={h2}>POST /auth/verify (enviar email)</h2>
        <div style={row}>
          <input style={input} placeholder="Email" value={verifyEmail} onChange={e => setVerifyEmail(e.target.value)} />
          <button
            style={btn}
            disabled={loading}
            onClick={() =>
              run("sendVerificationEmail", () => AuthService.sendVerificationEmail({ email: verifyEmail }))
            }
          >
            Enviar verificación
          </button>
        </div>
      </section>

      {/* CONFIRM VERIFICATION */}
      <section style={card}>
        <h2 style={h2}>GET /auth/verify/confirm?token=...</h2>
        <div style={row}>
          <input style={input} placeholder="Token" value={verifyToken} onChange={e => setVerifyToken(e.target.value)} />
          <button
            style={btn}
            disabled={loading}
            onClick={() => run("confirmVerification", () => AuthService.confirmVerification(verifyToken))}
          >
            Confirmar verificación
          </button>
        </div>
      </section>

      {/* LOGIN */}
      <section style={card}>
        <h2 style={h2}>POST /auth/login</h2>
        <div style={row}>
          <input style={input} placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
          <input style={input} placeholder="Password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
          <button
            style={btn}
            disabled={loading}
            onClick={() =>
              run("login", () => AuthService.login({ email: loginEmail, password: loginPassword }))
            }
          >
            Login
          </button>
        </div>
      </section>

      {/* REFRESH */}
      <section style={card}>
        <h2 style={h2}>POST /auth/refresh</h2>
        <p style={{ margin: "6px 0 12px", color: "#666" }}>
          Si dejas vacío, usa el <code>refresh_token</code> guardado por el login.
        </p>
        <div style={row}>
          <input style={input} placeholder="Refresh token (opcional)" value={refreshTokenInput} onChange={e => setRefreshTokenInput(e.target.value)} />
          <button
            style={btn}
            disabled={loading}
            onClick={() =>
              run("refresh", () => AuthService.refresh(refreshTokenInput || undefined))
            }
          >
            Refresh
          </button>
        </div>
      </section>

      {/* ME */}
      <section style={card}>
        <h2 style={h2}>GET /auth/me (requiere Authorization)</h2>
        <div style={row}>
          <button
            style={btn}
            disabled={loading}
            onClick={() => run("me", () => AuthService.me())}
          >
            Yo
          </button>
        </div>
      </section>

      {/* STATUS */}
      <section style={card}>
        <h2 style={h2}>GET /auth/status</h2>
        <div style={row}>
          <button
            style={btn}
            disabled={loading}
            onClick={() => run("status", () => AuthService.status())}
          >
            Status
          </button>
        </div>
      </section>

      {/* LOGOUT */}
      <section style={card}>
        <h2 style={h2}>Logout (local)</h2>
        <div style={row}>
          <button
            style={btnDanger}
            disabled={loading}
            onClick={() =>
                run("logout", () => AuthService.logout()) // ← llama POST /auth/logout
            }
            >
            Logout
          </button>
        </div>
      </section>

      {/* RESULT */}
      <section style={card}>
        <h2 style={h2}>Resultado</h2>
        {loading ? <p>Cargando…</p> : <JSONView data={result} />}
      </section>
    </div>
  );
}

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 16,
  marginBottom: 16,
  background: "#fff",
};

const h2 = { fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 12 };

const row = { display: "flex", gap: 8, flexWrap: "wrap" };

const input = {
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  minWidth: 220,
};

const btn = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
};

const btnDanger = {
  ...btn,
  background: "#7f1d1d",
  border: "1px solid #7f1d1d",
};
