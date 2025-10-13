"use client";
import Link from "next/link";
import styles from "./Hud.module.css";

export default function Hud({ showBack = false, backHref = "/" }) {
  return (
    <>
      <div className={styles.hud}>
        <button className={styles.iconBtn} aria-label="settings">⚙️</button>
        <div className={styles.face}>ฅ^•ﻌ•^ฅ</div>
        <button className={styles.iconBtn} aria-label="profile">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </div>

      {showBack && (
        <Link href={backHref} className={styles.backFab} aria-label="Back">
          ←
        </Link>
      )}
    </>
  );
}
