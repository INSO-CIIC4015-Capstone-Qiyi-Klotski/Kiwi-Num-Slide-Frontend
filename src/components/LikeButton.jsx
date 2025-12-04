// src/components/LikeButton.jsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PuzzlesService } from "@/services/puzzles.service";

export default function LikeButton({
  puzzleId,
  initialLiked = false,
  initialCount = 0,
  size = "md",
}) {
  const [liked, setLiked] = useState(!!initialLiked);
  const [count, setCount] = useState(
    Number.isFinite(initialCount) ? initialCount : 0
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();

  // 🔁 Sincronizar con cambios en initialLiked
  useEffect(() => {
    setLiked(!!initialLiked);
  }, [initialLiked]);

  const onClick = useCallback(async () => {
    setErr("");
    if (liked) return; // evita doble click
    if (!puzzleId && puzzleId !== 0) return;

    try {
      setLoading(true);

      const res = await PuzzlesService.like(puzzleId);

      if (!res?.ok) {
        const status = res?.status ?? res?.data?.status ?? res?.code;
        if (status === 401 || status === 403) {
          const next =
            typeof window !== "undefined"
              ? window.location.pathname
              : "/levels";
          router.push(`/auth/sign-in?next=${encodeURIComponent(next)}`);
          return;
        }
        setErr(res?.error || "Failed to like puzzle.");
        return;
      }

      const changed = !!res?.data?.changed;
      if (changed) {
        setLiked(true);
        setCount((c) => c + 1);
      }
    } catch {
      setErr("Failed to like puzzle.");
    } finally {
      setLoading(false);
      if (err) setTimeout(() => setErr(""), 2500);
    }
  }, [liked, puzzleId, err, router]);

  const sizePx = size === "sm" ? 26 : 32;
  const fontSize = size === "sm" ? 12 : 14;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || liked}
      aria-pressed={liked}
      aria-label={liked ? "Liked" : "Like this puzzle"}
      title={liked ? "You like this puzzle" : "Like"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: "1px solid #d1d5db",
        borderRadius: 999,
        background: liked ? "#fee2e2" : "#ffffff",
        color: liked ? "#b91c1c" : "#111111",
        padding: "4px 10px",
        boxShadow: "0 2px 0 rgba(17,17,17,.15)",
        cursor: loading || liked ? "default" : "pointer",
        opacity: loading ? 0.7 : 1,
        userSelect: "none",
      }}
    >
      <span
        aria-hidden
        style={{
          width: sizePx,
          height: sizePx,
          display: "inline-grid",
          placeItems: "center",
          borderRadius: "999px",
          background: liked ? "#fecaca" : "#f3f4f6",
          border: "1px solid #e5e7eb",
          fontSize,
          lineHeight: 1,
        }}
      >
        {liked ? "❤" : "♡"}
      </span>
      <span style={{ fontSize, fontWeight: 600 }}>{count}</span>
      {loading && (
        <span style={{ fontSize: 11, color: "#6b7280" }}>saving…</span>
      )}
      {err && <span style={{ fontSize: 11, color: "#b91c1c" }}>{err}</span>}
    </button>
  );
}
