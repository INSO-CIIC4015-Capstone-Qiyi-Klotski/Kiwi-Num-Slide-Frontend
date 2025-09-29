"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL 

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function pingApi() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await fetch(`${API_BASE}/db-ping`, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setResult(data);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <ol>
          <li>
            Get started by editing <code>src/app/page.js</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        {/* 🟢 Banner de despliegue automático */}
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #333",
            background: "rgba(100, 255, 218, 0.06)",
            lineHeight: 1.5,
            maxWidth: 680,
          }}
        >
          <p style={{ margin: 0 }}>
            🚀 <strong>Despliegue automático</strong>: este cambio se hizo desde
            <strong> GitHub</strong> y se publicó en
            <strong> AWS Elastic Beanstalk</strong> mediante
            <strong> GitHub Actions</strong>.
          </p>
        </div>

        {/* 🔗 Probar API */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 12,
            border: "1px solid #333",
            maxWidth: 680,
            width: "100%",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Probar conexión con el backend</h3>
          <p style={{ margin: "8px 0" }}>
            Endpoint: <code>{API_BASE}/db-ping</code>
          </p>
          <button
            onClick={pingApi}
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #444",
              background: "#111",
              cursor: "pointer",
            }}
          >
            {loading ? "Llamando..." : "Ping DB"}
          </button>

          <pre
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              background: "#0b0b0b",
              border: "1px solid #222",
              overflowX: "auto",
            }}
          >
            {error
              ? `Error: ${error}`
              : result
              ? JSON.stringify(result, null, 2)
              : "Sin datos aún"}
          </pre>
        </div>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
