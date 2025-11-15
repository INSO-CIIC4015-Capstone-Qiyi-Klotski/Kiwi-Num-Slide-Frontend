// src/components/levels/LevelCard.jsx
import Link from "next/link";

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

  // Default author name when the level is algorithm-generated
  const authorName = isGenerated
    ? "KiwiNumSlide"
    : authorObj.display_name ?? "Unknown author";

  const authorId = isGenerated ? null : authorObj.id;

  // Avatar selection with fallback handling
  const avatarUrl =
    isGenerated
      ? FALLBACK_AVATAR
      : authorObj.avatar_url ?? FALLBACK_AVATAR;

  // Extract initials for potential fallback presentation
  let authorInitials = "";
  if (!isGenerated && authorName !== "Unknown author") {
    const parts = authorName.split(/\s+/).filter(Boolean);
    authorInitials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  }

  // Extract difficulty, size, likes and solves fields
  const difficulty = level.difficulty ?? null;
  const size = level.size ?? null;

  const likes = level.likes ?? level.likes_count ?? null;
  const solves = level.solves ?? level.solves_count ?? null;

  // Origin of the puzzle (user-generated vs algorithm)
  const generatedBy =
    level.generatedBy ??
    level.generated_by ??
    (isGenerated ? "algorithm" : "user");

  return (
    <article style={cardStyle}>
      {/* Title and link to level page */}
      <Link href={`/levels/${id}`} style={titleStyle}>
        {title}
      </Link>

      {/* Author section with avatar */}
      <div style={headerRow}>
        <div style={avatarWrapper}>
          <img
            src={avatarUrl}
            alt={authorName}
            style={avatarImgStyle}
          />
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

          {/* Difficulty and size metadata row */}
          <div style={metaRow}>
            {difficulty != null && <span>Difficulty: {difficulty}/5</span>}
            {size != null && <span>• Size: {size}×{size}</span>}
          </div>
        </div>
      </div>

      {/* Stats row: likes, solves, generation type */}
      <div style={metaRow}>
        {likes != null && <span style={chip}>❤ {likes}</span>}
        {solves != null && <span style={chip}>✔ {solves}</span>}
        {generatedBy && (
          <span style={chip}>
            {generatedBy === "algorithm" ? "Algorithm" : "User"}
          </span>
        )}

        {/* Operators */}
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

      {/* Call-to-action button */}
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
