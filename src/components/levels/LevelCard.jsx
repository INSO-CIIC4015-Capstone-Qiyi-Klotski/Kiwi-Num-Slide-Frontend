// src/components/levels/LevelCard.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LikeButton from "../LikeButton";
import { UsersService } from "@/services/users.service";

const FALLBACK_AVATAR = "/images/kiwi.png";

/* 
  Base layout and styling definitions for the compact level card.
  All styling is inline to keep the component fully self-contained.
*/

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const titleStyle = {
  fontSize: 16,
  fontWeight: 600,
};

const metaRow = {
  fontSize: 12,
  color: "#6b7280",
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const chip = {
  padding: "2px 8px",
  borderRadius: 999,
  background: "#f3f4f6",
  fontSize: 11,
};

const headerRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const avatarWrapper = {
  width: 28,
  height: 28,
  borderRadius: "999px",
  overflow: "hidden",
  flexShrink: 0,
  background: "#e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  fontWeight: 600,
  color: "#4b5563",
};

const avatarImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

export default function LevelCard({ level }) {
  if (!level) return null;

  // Extracting basic level fields
  const id = level.id ?? level.slug;
  const title = level.title ?? `Puzzle #${id}`;

  // Author block
  const authorObj = level.author;
  const isGenerated = !authorObj;

  const authorName = isGenerated
    ? "KiwiNumSlide"
    : authorObj.display_name ?? "Unknown author";

  const authorId = isGenerated ? null : authorObj.id;

  const avatarUrl = isGenerated
    ? FALLBACK_AVATAR
    : authorObj.avatar_url ?? FALLBACK_AVATAR;

  const difficulty = level.difficulty ?? null;
  const size = level.size ?? null;

  const likes = level.likes ?? level.likes_count ?? null;
  const solves = level.solves ?? level.solves_count ?? null;
  const likesCount = likes ?? 0;

  const generatedBy =
    level.generatedBy ??
    level.generated_by ??
    (isGenerated ? "algorithm" : "user");

  // Estado de like para ESTE usuario en ESTE puzzle
  const [likedByUser, setLikedByUser] = useState(
    !!(level.liked ?? level.is_liked ?? false)
  );
  const puzzleId = level.id; // aquí usa el id numérico del puzzle

  useEffect(() => {
    let cancelled = false;

    async function fetchLikedPuzzles() {
      // TODO: remplaza por tu user.id real desde auth/context
      const userId = 61;
      if (!userId || !puzzleId) return;

      try {
        const res = await UsersService.getPuzzleLikedByUser(userId);

        // apiFetch puede devolver:
        //  a) { ok, data: {...} }
        //  b) el JSON directo { items: [...] }
        const payload = res?.data ?? res;

        if (!payload) return;

        const items = Array.isArray(payload.items) ? payload.items : [];

        // Chequea si el id de este puzzle está en la lista de puzzles likeados
        const likedFlag = items.some((p) => p.id === puzzleId);

        if (!cancelled) {
          setLikedByUser(likedFlag);
        }
      } catch (error) {
        console.error("Error fetching liked puzzles for user:", error);
      }
    }

    fetchLikedPuzzles();

    return () => {
      cancelled = true;
    };
  }, [puzzleId]);

  return (
    <article style={cardStyle}>
      {/* Title and link to level page */}
      <Link href={`/levels/${id}`} style={titleStyle}>
        {title}
      </Link>

      {/* Author section with avatar */}
      <div style={headerRow}>
        <div style={avatarWrapper}>
          <img src={avatarUrl} alt={authorName} style={avatarImgStyle} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 12 }}>
            by{" "}
            {authorId ? (
              <Link
                href={`/users/${authorId}`}
                style={{ textDecoration: "underline" }}
              >
                {authorName}
              </Link>
            ) : (
              authorName
            )}
          </span>

          <div style={metaRow}>
            {difficulty != null && <span>Difficulty: {difficulty}/5</span>}
            {size != null && (
              <span>
                • Size: {size}×{size}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row: likes, solves, generation type */}
      <div style={metaRow}>
        <LikeButton
          puzzleId={id}
          initialLiked={likedByUser}
          initialCount={likesCount}
          size="sm"
        />

        {solves != null && <span style={chip}>✔ {solves}</span>}
        {generatedBy && (
          <span style={chip}>
            {generatedBy === "algorithm" ? "Algorithm" : "User"}
          </span>
        )}

        {Array.isArray(level.operators) && level.operators.length > 0 && (
          <span style={chip}>
            {level.operators
              .map((op) => {
                switch (op) {
                  case "add":
                    return "+";
                  case "sub":
                    return "−";
                  case "mul":
                    return "×";
                  case "div":
                    return "÷";
                  default:
                    return op;
                }
              })
              .join(" ")}
          </span>
        )}
      </div>

      <Link
        href={`/levels/${id}`}
        style={{
          fontSize: 13,
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid #d1d5db",
          marginTop: 4,
        }}
      >
        View / Play →
      </Link>
    </article>
  );
}
