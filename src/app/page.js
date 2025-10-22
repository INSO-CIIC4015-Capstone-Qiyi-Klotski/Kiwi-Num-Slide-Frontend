"use client";

import { useState } from "react";
import Hud from "../components/Hud";
import MenuButton from "../components/MenuButton";
import styles from "./page.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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
    <section className={styles.wrapper}>
      <Hud />
      <h1 className="brand" style={{ textAlign: "center", marginTop: 8 }}>
        Kiwi Num Slide
      </h1>

      <div style={{ display: "grid", gap: 16, justifyContent: "center", marginTop: 24 }}>
        <MenuButton href="/daily" data-testid="btn-daily">Daily</MenuButton>
        <MenuButton href="/levels/pae2">Level Select</MenuButton>
      </div>
    </section>
  );
}
