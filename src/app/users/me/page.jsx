// src/app/users/me/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";

export default function MeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await AuthService.status();

        if (!active) return;

        const user = res?.data?.user || null;

        if (user && user.id) {
          router.replace(`/users/${user.id}`);
        } else {
          router.replace("/auth/sign-in");
        }
      } catch (e) {
        if (!active) return;
        router.replace("/auth/sign-in");
      }
    })();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        color: "#4b5563",
      }}
    >
      Loading your profile…
    </main>
  );
}
