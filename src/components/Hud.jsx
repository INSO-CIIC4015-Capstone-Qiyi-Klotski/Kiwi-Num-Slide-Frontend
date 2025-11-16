"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Hud.module.css";
import { AuthService } from "@/services/auth.service";

export default function Hud() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await AuthService.status();
        // 👇 Según lo que enseñaste:
        // Logueado:  data.user = { ... }
        // No logueado: data.user = null
        const logged = !!res?.data?.user;
        setIsLoggedIn(logged);
      } catch (e) {
        console.error("Error checking auth status", e);
        setIsLoggedIn(false);
      }
    }

    checkAuth();
  }, []);

  function handleProfileClick() {
    if (isLoggedIn) {
      window.location.href = "/users/me";
    } else {
      window.location.href = "/auth/sign-up";
    }
  }

  return (
    <div className={styles.hud}>
      <button className={styles.iconBtn} aria-label="settings" title="Settings">
        ⚙️
      </button>

      <Link href="/" className={styles.iconBtn} title="Home">
        ฅ^•ﻌ•^ฅ
      </Link>

      <button
        className={styles.iconBtn}
        aria-label="profile"
        title="Profile"
        onClick={handleProfileClick}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M4 20c0-4 4-6 8-6s8 2 8 6"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </button>
    </div>
  );
}
