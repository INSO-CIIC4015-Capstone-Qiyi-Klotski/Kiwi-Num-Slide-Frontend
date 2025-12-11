// src/components/users/UserCard.jsx
import Link from "next/link";

const FALLBACK_AVATAR = "/images/kiwi.png";

const cardStyle = {
  border: "1px solid var(--border-color)",
  borderRadius: 12,
  padding: 14,
  background: "var(--bg-secondary)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const headerRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const avatarWrapper = {
  width: 32,
  height: 32,
  borderRadius: "999px",
  overflow: "hidden",
  flexShrink: 0,
  background: "var(--bg-tertiary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-secondary)",
};

const avatarImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const nameStyle = {
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
  marginTop: 4,
};

const chip = {
  padding: "2px 8px",
  borderRadius: 999,
  background: "var(--bg-tertiary)",
  color: "var(--text-primary)",
  fontSize: 11,
};

export default function UserCard({ user, backTo }) {
  if (!user) return null;

  const id = user.id;
  const name = user.name ?? user.display_name ?? "Unknown user";

  const avatarUrl = user.avatar_url || FALLBACK_AVATAR;

  const counts = user.counts || {};
  const created = counts.created ?? counts.puzzles ?? null;
  const solved = counts.solved ?? null;
  const followers = counts.followers ?? null;

  // Build the profile link with optional backTo param
  const profileHref = backTo 
    ? `/users/${id}?backTo=${encodeURIComponent(backTo)}`
    : `/users/${id}`;

  return (
    <article style={cardStyle}>
      <div style={headerRow}>
        <div style={avatarWrapper}>
          <img
            src={avatarUrl}
            alt={name}
            style={avatarImgStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Link href={profileHref} style={nameStyle}>
            {name}
          </Link>

          <div style={metaRow}>
            {created != null && <span style={chip}>Created: {created}</span>}
            {solved != null && <span style={chip}>Solved: {solved}</span>}
            {followers != null && (
              <span style={chip}>Followers: {followers}</span>
            )}
          </div>
        </div>
      </div>

      <Link
        href={profileHref}
        style={{
          fontSize: 13,
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid var(--border-color)",
          background: "var(--bg-tertiary)",
          color: "var(--text-primary)",
          marginTop: 6,
        }}
      >
        View profile →
      </Link>
    </article>
  );
}
