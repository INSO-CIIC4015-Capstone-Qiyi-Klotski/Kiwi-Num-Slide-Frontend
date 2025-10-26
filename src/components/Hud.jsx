"use client";
import Link from "next/link";
import styles from "./Hud.module.css";

export default function Hud() {
  return (
    <>
      <div className={styles.hud}>
        <button className={styles.iconBtn} aria-label="settings" title="Settings">⚙️</button>
        <Link href="/" className={styles.iconBtn} title="Home">ฅ^•ﻌ•^ฅ</Link>
        <button className={styles.iconBtn} aria-label="profile" title="Profile">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>  
    </>
  );
}
