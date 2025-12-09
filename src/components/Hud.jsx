"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Hud.module.css";
import { AuthService } from "@/services/auth.service";
import { UsersService } from "@/services/users.service";
import { onAuthChange } from "@/lib/auth-events";

export default function Hud() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [profileUser, setProfileUser] = useState(null); // datos para avatar

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      if (!active) return;
      setIsChecking(true);

      try {
        const statusRes = await AuthService.status();

        if (statusRes.ok && statusRes.data?.user) {
          const authUser = statusRes.data.user;
          setIsLoggedIn(true);

          try {
            const profileRes = await UsersService.getPublicProfile(authUser.id);
            if (profileRes.ok && active) {
              setProfileUser(profileRes.data);
            } else if (active) {
              setProfileUser(null);
            }
          } catch {
            if (active) setProfileUser(null);
          }
        } else {
          if (active) {
            setIsLoggedIn(false);
            setProfileUser(null);
          }
        }
      } catch (e) {
        console.error("Error checking auth status", e);
        if (active) {
          setIsLoggedIn(false);
          setProfileUser(null);
        }
      } finally {
        if (active) setIsChecking(false);
      }
    }

    // 1) Chequeo inicial al montar
    checkAuth();

    // 2) Suscribirse a cambios de auth
    const unsubscribe = onAuthChange(() => {
      checkAuth();
    });

    // cleanup
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  function handleProfileClick() {
    if (isChecking) return;

    if (isLoggedIn) {
      window.location.href = "/users/me";
    } else {
      window.location.href = "/auth/sign-in";
    }
  }

  // Estilos del avatar del HUD
  const avatarCircleStyle = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f472b6, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    overflow: "hidden",
  };

  const avatarImgStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  };

  const initial =
    profileUser?.display_name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className={styles.hud}>
      <Link href="/settings" className={styles.iconBtn} aria-label="settings" title="Settings">
        ⚙️
      </Link>

      <Link href="/" className={styles.iconBtn} title="Home">
        ฅ^•ﻌ•^ฅ
      </Link>

      <button
        className={styles.iconBtn}
        aria-label="profile"
        title={isLoggedIn ? "Profile" : "Sign up"}
        onClick={handleProfileClick}
        disabled={isChecking}
      >
        {isLoggedIn ? (
          <div style={avatarCircleStyle}>
            {profileUser?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileUser.avatar_url}
                alt={profileUser.display_name}
                style={avatarImgStyle}
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
        ) : (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
            <path
              d="M4 20c0-4 4-6 8-6s8 2 8 6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
