// src/components/users/UserCard.jsx
import Link from "next/link";

const FALLBACK_AVATAR = "/images/kiwi.png";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
  background: "#ffffff",
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
  background: "#e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
  fontWeight: 600,
  color: "#4b5563",
};

const avatarImgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const nameStyle = {
  fontSize: 16,
  fontWeight: 600,
};

const metaRow = {
  fontSize: 12,
  color: "#6b7280",
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 4,
};

const chip = {
  padding: "2px 8px",
  borderRadius: 999,
  background: "#f3f4f6",
  fontSize: 11,
};

export default function UserCard({ user }) {
  if (!user) return null;

  const id = user.id;
  const name = user.name ?? user.display_name ?? "Unknown user";

  const avatarUrl = user.avatar_url || FALLBACK_AVATAR;

  const counts = user.counts || {};
  const created = counts.created ?? counts.puzzles ?? null;
  const solved = counts.solved ?? null;
  const followers = counts.followers ?? null;

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
          <Link href={`/users/${id}`} style={nameStyle}>
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
        href={`/users/${id}`}
        style={{
          fontSize: 13,
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid #d1d5db",
          marginTop: 6,
        }}
      >
        View profile →
      </Link>
    </article>
  );
}
