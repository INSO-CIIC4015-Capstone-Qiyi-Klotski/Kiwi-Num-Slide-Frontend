// src/app/users/[id]/UserProfileClient.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthService } from "@/services/auth.service";
import { UsersService } from "@/services/users.service";

export default function UserProfileClient({
  userId: rawId,
  initialUser = null,
  initialPuzzles = [],
}) {
  const userId =
    typeof rawId === "string" && /^\d+$/.test(rawId) ? Number(rawId) : null;

  const [user, setUser] = useState(initialUser);
  const [authUser, setAuthUser] = useState(null);
  const [puzzles, setPuzzles] = useState(initialPuzzles ?? []);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setError("Invalid user id.");
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      try {
        setError("");

        // Solo vuelvo a pedir el perfil si NO vino del servidor
        const userPromise = initialUser
          ? Promise.resolve({ ok: true, data: initialUser })
          : UsersService.getPublicProfile(userId);

        // Solo vuelvo a pedir puzzles si no vinieron del servidor
        const puzzlesPromise =
          initialPuzzles && initialPuzzles.length > 0
            ? Promise.resolve({ ok: true, data: { items: initialPuzzles } })
            : UsersService.getCreatedPuzzles(userId, { limit: 2 });

        // Auth siempre se resuelve en cliente
        const [userRes, statusRes, puzzlesRes] = await Promise.all([
          userPromise,
          AuthService.status(),
          puzzlesPromise,
        ]);

        if (!active) return;

        if (!userRes.ok) {
          setError(userRes.error || "User not found.");
          setUser(null);
          setPuzzles([]);
          setLoading(false);
          return;
        }

        setUser(userRes.data || null);
        setPuzzles(puzzlesRes.ok ? puzzlesRes.data?.items ?? [] : []);

        const loggedUser = statusRes.ok ? statusRes.data?.user || null : null;
        setAuthUser(loggedUser);
      } catch {
        if (!active) return;
        setError("Failed to load profile.");
      } finally {
        if (active && !initialUser) {
          // si ya venía del server, nunca mostramos el skeleton
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [userId, initialUser, initialPuzzles]);

  const isOwner = !!(authUser && user && authUser.id === user.id);

  if (loading) {
    return (
      <main style={pageBg}>
        <div style={wrapper}>
          <div style={card}>
            <p style={{ fontSize: 14, color: "#4b5563" }}>Loading profile…</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main style={pageBg}>
        <div style={wrapper}>
          <div style={card}>
            <h1 style={title}>User not found</h1>
            <p style={subtitle}>{error || "This profile does not exist."}</p>
            <Link href="/users/browse" style={primaryLink}>
              ← Back to users
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const createdAt = user.created_at ? new Date(user.created_at) : null;
  const hasPuzzles = puzzles && puzzles.length > 0;

  return (
    <main style={pageBg}>
      <div style={wrapper}>
        <div style={card}>
          {/* Header */}
          <header style={headerRow}>
            <div style={avatarWrapper}>
              <div style={avatarCircle}>
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 26 }}>
                    {user.display_name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={title}>{user.display_name}</h1>
              <p style={subtitle}>
                Joined{" "}
                {createdAt
                  ? createdAt.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                    })
                  : "recently"}
              </p>

              {isOwner && (
                <div style={ownerInfoRow}>
                  {user.email && (
                    <p style={ownerInfoText}>
                      <strong>Email:</strong> {user.email}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div style={actionsCol}>
              {isOwner ? (
                <>
                  <span style={ownerBadge}>Your profile</span>
                  <button type="button" style={ghostBtn}>
                    Settings
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  style={primaryBtn}
                  disabled
                  title="Follow/unfollow coming soon"
                >
                  Follow
                </button>
              )}
            </div>
          </header>

          {/* Stats */}
          <section aria-label="User stats" style={statsRow}>
            <ProfileStat label="Puzzles" value={user.stats?.puzzles ?? 0} />
            <ProfileStat
              label="Likes received"
              value={user.stats?.likes_received ?? 0}
            />
            <Link
              href={`/users/browse?followersOf=${user.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ProfileStat
                label="Followers"
                value={user.stats?.followers ?? 0}
                asLink
              />
            </Link>
            <Link
              href={`/users/browse?followingOf=${user.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ProfileStat label="Following" value="—" asLink />
            </Link>
          </section>

          {/* Created levels */}
          <section aria-label="Created puzzles" style={{ marginTop: 24 }}>
            <h2 style={sectionTitle}>Created levels</h2>
            {!hasPuzzles ? (
              <p style={subtitle}>
                {isOwner
                  ? "You haven’t created any levels yet."
                  : "This user hasn’t created any levels yet."}
              </p>
            ) : (
              <div style={puzzlesGrid}>
                {puzzles.slice(0, 2).map((puzzle) => (
                  <Link
                    key={puzzle.id}
                    href={`/levels/${puzzle.id}`}
                    style={puzzleCard}
                  >
                    <div style={puzzleTitleRow}>
                      <span style={puzzleTitle}>{puzzle.title}</span>
                    </div>
                    <p style={puzzleMeta}>
                      Size {puzzle.size} ·{" "}
                      {puzzle.difficulty != null
                        ? `Difficulty ${puzzle.difficulty}`
                        : "No difficulty"}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            {/* Botón para ver todos los niveles creados (siempre visible) */}
            <div style={sectionFooter}>
              <Link
                href={`/levels/browse?authorId=${user.id}`}
                style={seeAllLinkBtn}
              >
                See all created levels →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ProfileStat({ label, value, asLink = false }) {
  return (
    <div style={statBox}>
      <span style={statValue}>{value}</span>
      <span
        style={{
          ...statLabel,
          ...(asLink ? { textDecoration: "underline" } : null),
        }}
      >
        {label}
      </span>
    </div>
  );
}

// estilos inline igual que antes...
const pageBg = {
  minHeight: "calc(100vh - 56px)",
  background: "#fdf5ff",
  padding: "32px 16px",
};

const wrapper = {
  maxWidth: 960,
  margin: "0 auto",
};

const card = {
  background: "#ffffff",
  borderRadius: 18,
  padding: 24,
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.09)",
  border: "1px solid #f1e4ff",
};

const title = {
  fontSize: 26,
  fontWeight: 900,
  margin: 0,
  marginBottom: 6,
};

const subtitle = {
  margin: 0,
  marginBottom: 12,
  color: "#4b5563",
  fontSize: 14,
};

const headerRow = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  marginBottom: 16,
  flexWrap: "wrap",
};

const avatarWrapper = { flexShrink: 0 };

const avatarCircle = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #f472b6, #8b5cf6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontWeight: 700,
};

const ownerInfoRow = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  marginTop: 6,
};

const ownerInfoText = {
  fontSize: 13,
  color: "#4b5563",
};

const actionsCol = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  alignItems: "flex-end",
  minWidth: 140,
};

const ownerBadge = {
  padding: "4px 10px",
  borderRadius: 999,
  background: "#ecfeff",
  border: "1px solid #22c1c3",
  fontSize: 12,
  fontWeight: 600,
  color: "#0369a1",
};

const primaryBtn = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "none",
  background: "#111827",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

const ghostBtn = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#374151",
  fontSize: 13,
  cursor: "pointer",
};

const primaryLink = {
  fontSize: 13,
  color: "#1d4ed8",
  textDecoration: "underline",
};

const statsRow = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: 10,
  marginTop: 12,
};

const statBox = {
  padding: "10px 12px",
  borderRadius: 14,
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
};

const statValue = {
  fontSize: 18,
  fontWeight: 800,
};

const statLabel = {
  fontSize: 12,
  color: "#6b7280",
};

const sectionTitle = {
  margin: 0,
  marginBottom: 10,
  fontSize: 16,
  fontWeight: 700,
};

const puzzlesGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 10,
};

const puzzleCard = {
  display: "block",
  padding: 12,
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  textDecoration: "none",
  color: "#111827",
};

const puzzleTitleRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
};

const puzzleTitle = {
  fontSize: 14,
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const puzzleMeta = {
  fontSize: 12,
  color: "#6b7280",
  margin: 0,
};

const sectionFooter = {
  marginTop: 12,
  display: "flex",
  justifyContent: "center",
};

const seeAllLinkBtn = {
  fontSize: 13,
  fontWeight: 600,
  padding: "8px 16px",
  borderRadius: 999,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  textDecoration: "none",
};
