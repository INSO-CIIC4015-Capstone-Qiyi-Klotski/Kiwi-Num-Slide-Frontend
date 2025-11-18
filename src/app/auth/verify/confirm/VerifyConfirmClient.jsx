"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";

export default function VerifyConfirmClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    async function run() {
      try {
        const res = await AuthService.confirmVerification(token);
        if (!res.ok) {
          setStatus("error");
          setMessage(res.error || "Verification failed.");
          return;
        }

        const msg =
          (typeof res.data === "object" && res.data?.message) ||
          "Your email has been verified successfully.";
        setStatus("success");
        setMessage(msg);

        // redirigir al perfil después de unos segundos
        setTimeout(() => {
          router.push("/users/me");
        }, 2500);
      } catch {
        setStatus("error");
        setMessage("Verification failed.");
      }
    }

    run();
  }, [token, router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fdf5ff",
        padding: 16,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "#ffffff",
          borderRadius: 18,
          padding: 24,
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.09)",
          border: "1px solid #f1e4ff",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          Email verification
        </h1>

        {status === "loading" && (
          <p style={{ color: "#4b5563", fontSize: 14 }}>
            Verifying your email, please wait…
          </p>
        )}

        {status === "success" && (
          <p style={{ color: "#15803d", fontSize: 14 }}>{message}</p>
        )}

        {status === "error" && (
          <p style={{ color: "#b91c1c", fontSize: 14 }}>{message}</p>
        )}

        {(status === "success" || status === "error") && (
          <p style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
            You will be redirected to your profile shortly…
          </p>
        )}
      </div>
    </main>
  );
}
