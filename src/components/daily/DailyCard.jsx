// src/components/daily/DailyCard.jsx
import Link from "next/link";

const FALLBACK_AVATAR = "/images/kiwi.png";

const wrapperStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 24,
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  maxWidth: 560,
};

const eyebrowStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const titleStyle = {
  fontSize: 26,
  fontWeight: 800,
};

const dateStyle = {
  fontSize: 12,
  color: "#6b7280",
  marginTop: 4,
};

const subtitleStyle = {
  fontSize: 13,
  color: "#6b7280",
  marginTop: 8,
};

const chipsRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  fontSize: 12,
};

const chip = {
  padding: "4px 10px",
  borderRadius: 999,
  background: "#f3f4f6",
};

const authorRow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginTop: 8,
};

const avatarWrapper = {
  width: 32,
  height: 32,
  borderRadius: "999px",
  overflow: "hidden",
  flexShrink: 0,
  background: "#e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const avatarImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const playButtonRow = {
  display: "flex",
  flexDirection: "row",
  gap: 12,
  alignItems: "center",
  marginTop: 12,
};

const playButtonStyle = {
  padding: "10px 18px",
  borderRadius: 999,
  border: "1px solid #16a34a",
  background: "#22c55e",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 600,
  textDecoration: "none",
};

const secondaryLinkStyle = {
  fontSize: 13,
  color: "#4b5563",
  textDecoration: "underline",
};

export default function DailyCard({
  id,
  date,          // YYYY-MM-DD
  title,
  difficulty,
  size,
  operators,     // array ya normalizada en símbolos "+ − × ÷"
  author,        // { id, slug, display_name, avatar_url? }
  likesCount,
  solvesCount,
  ctaHref,
}) {
  if (!id) return null;

  const titleText = title ?? `Puzzle #${id}`;
  const opsLabel =
    Array.isArray(operators) && operators.length > 0
      ? operators.join(" ")
      : null;

  const displayName =
    author?.display_name || author?.name || "KiwiNumSlide";

  const authorId = author?.id ?? null;
  const authorSlug = author?.slug ?? (authorId ? String(authorId) : null);
  const avatarUrl = author?.avatar_url || FALLBACK_AVATAR;

  const likesLabel =
    typeof likesCount === "number" ? likesCount : null;
  const solvesLabel =
    typeof solvesCount === "number" ? solvesCount : null;

  const dateLabel = date || null;

  return (
    <article style={wrapperStyle}>
      <div>
        <div style={eyebrowStyle}>Today&apos;s Daily Puzzle</div>
        <h1 style={titleStyle}>{titleText}</h1>
        {dateLabel && (
          <div style={dateStyle}>
            {dateLabel}
          </div>
        )}
        <p style={subtitleStyle}>
          Warm up your brain with today&apos;s featured level and try to beat
          your best time.
        </p>

        {/* Autor */}
        <div style={authorRow}>
          <div style={avatarWrapper}>
            <img
              src={avatarUrl}
              alt={displayName}
              style={avatarImgStyle}
            />
          </div>
          <div style={{ fontSize: 13 }}>
            <span>by </span>
            {authorId ? (
              <Link
                href={`/users/${authorId}`}
                style={{ textDecoration: "underline" }}
              >
                {displayName}
              </Link>
            ) : (
              <span>{displayName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Chips de meta */}
      <div style={chipsRow}>
        {size != null && (
          <span style={chip}>
            Size: {size}×{size}
          </span>
        )}
        {difficulty != null && (
          <span style={chip}>Difficulty: {difficulty}/5</span>
        )}
        {opsLabel && <span style={chip}>Operators: {opsLabel}</span>}
        {likesLabel !== null && (
          <span style={chip}>❤ {likesLabel}</span>
        )}
        {solvesLabel !== null && (
          <span style={chip}>✔ {solvesLabel}</span>
        )}
      </div>

      {/* CTA principal + link a explorar más levels */}
      <div style={playButtonRow}>
        <Link href={ctaHref ?? `/levels/${id}`} style={playButtonStyle}>
          Play now →
        </Link>
        <Link
          href="/levels/browse?sort=likes_desc"
          style={secondaryLinkStyle}
        >
          Browse more popular levels →
        </Link>
      </div>
    </article>
  );
}
