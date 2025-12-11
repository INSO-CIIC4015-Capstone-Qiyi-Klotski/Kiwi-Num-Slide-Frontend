// src/components/levels/LevelCard.jsx
"use client";

import Link from "next/link";
import LikeButton from "../LikeButton";

const FALLBACK_AVATAR = "/images/kiwi.png";

/* 
  Base layout and styling definitions for the compact level card.
  All styling is inline to keep the component fully self-contained.
*/

const cardStyle = {
  border: "1px solid var(--border-color)",
  borderRadius: 12,
  padding: 14,
  background: "var(--bg-secondary)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const titleStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: "var(--text-primary)",
};

const metaRow = {
  fontSize: 12,
  color: "var(--text-secondary)",
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const chip = {
  padding: "2px 8px",
  borderRadius: 999,
  background: "var(--bg-tertiary)",
  color: "var(--text-primary)",
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
  background: "var(--bg-tertiary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-secondary)",
};

const avatarImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

export default function LevelCard({ level, backTo }) {
  if (!level) return null;

  // Extracting basic level fields
  const id = level.id ?? level.slug;
  const title = level.title ?? `Puzzle #${id}`;
  
  // Build the level link with optional backTo param
  const levelHref = backTo 
    ? `/levels/${id}?backTo=${encodeURIComponent(backTo)}`
    : `/levels/${id}`;

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

  // ✅ ya viene marcado desde LevelsList
  const likedByUser = !!(level.liked ?? level.is_liked ?? false);

  return (
    <article style={cardStyle}>
      {/* Title and link to level page */}
      <Link href={levelHref} style={titleStyle}>
        {title}
      </Link>

      {/* Author section with avatar */}
      <div style={headerRow}>
        <div style={avatarWrapper}>
          <img src={avatarUrl} alt={authorName} style={avatarImgStyle} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 12, color: "var(--text-primary)" }}>
            by{" "}
            {authorId ? (
              <Link
                href={backTo ? `/users/${authorId}?backTo=${encodeURIComponent(backTo)}` : `/users/${authorId}`}
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
        href={levelHref}
        style={{
          fontSize: 13,
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid var(--border-color)",
          background: "var(--bg-tertiary)",
          color: "var(--text-primary)",
          marginTop: 4,
        }}
      >
        View / Play →
      </Link>
    </article>
  );
}
