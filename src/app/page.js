import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <section className={styles.wrapper}>
      {/* HUD superior */}
      <div className={styles.hud}>
        <button className={styles.iconBtn} aria-label="settings">⚙️</button>
        <div className={styles.face}>ฅ^•ﻌ•^ฅ</div>
        <button className={styles.iconBtn} aria-label="profile">
          {/* círculo usuario simple */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </button>
      </div>

      <h1 className={`${styles.title} brand`}>Kiwi Num Slide</h1>

      <div className={styles.stack}>
        <Link href="/daily" className={styles.btn}>
          <span className={styles.dashesTop} />
          <span className={styles.label}>Daily</span>
          <span className={styles.dashesBottom} />
        </Link>

        <Link href="/levels/pae2" className={styles.btn}>
          <span className={styles.dashesTop} />
          <span className={styles.label}>Level Select</span>
          <span className={styles.dashesBottom} />
        </Link>
      </div>
    </section>
  );
}
