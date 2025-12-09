// src/app/users/[id]/UserProfileClient.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthService } from "@/services/auth.service";
import { UsersService } from "@/services/users.service";
import { useRouter } from "next/navigation";
import { emitAuthChange } from "@/lib/auth-events";

export default function UserProfileClient({
  userId: rawId,
  initialUser = null,
  initialPuzzles = [],
}) {
  const userId =
    typeof rawId === "string" && /^\d+$/.test(rawId) ? Number(rawId) : null;

  const router = useRouter();

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");     

  const [user, setUser] = useState(initialUser);
  const [authUser, setAuthUser] = useState(null);
  const [puzzles, setPuzzles] = useState(initialPuzzles ?? []);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState("");

  // estado del avatar picker
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarCatalog, setAvatarCatalog] = useState([]);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSaving, setAvatarSaving] = useState(false);

  // estado para edición de nombre
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  const [verifySending, setVerifySending] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [verifyError, setVerifyError] = useState("");

  // estado para follow / unfollow
  const [followLoading, setFollowLoading] = useState(false);
  const [followMessage, setFollowMessage] = useState("");
  const [followError, setFollowError] = useState("");

  // helper para revalidar ISR desde el cliente
  async function triggerRevalidateForUser(targetUserId) {
    try {
      await fetch("/api/revalidate-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });
    } catch {
      // en dev podemos ignorar errores silenciosamente
    }
  }

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
            : UsersService.getCreatedPuzzles(userId, { limit: 12 });

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

  // mantener nameInput sincronizado con el usuario cuando no se está editando
  useEffect(() => {
    if (user && !isEditingName) {
      setNameInput(user.display_name || "");
    }
  }, [user, isEditingName]);

  const isOwner = !!(authUser && user && authUser.id === user.id);
  const privateUser = isOwner && authUser ? authUser : null;

  // 👇 handler para enviar email de verificación
  async function handleSendVerificationEmail() {
    const email = authUser?.email || user?.email;
    if (!email) return;

    setVerifySending(true);
    setVerifyMessage("");
    setVerifyError("");

    try {
      const res = await AuthService.sendVerificationEmail({ email });
      if (!res.ok) {
        setVerifyError(res.error || "Failed to send verification email.");
        return;
      }

      const msg =
        (typeof res.data === "object" && res.data?.message) ||
        "Verification email sent. Please check your inbox.";
      setVerifyMessage(msg);
    } catch {
      setVerifyError("Failed to send verification email.");
    } finally {
      setVerifySending(false);
    }
  }

   async function handleLogout() {
    setLogoutLoading(true);
    setLogoutError("");

    try {
      const res = await AuthService.logout();

      if (!res.ok) {
        setLogoutError(res.error || "Failed to log out.");
        return;
      }

      // limpiar el usuario autenticado en el estado
      setAuthUser(null);
      emitAuthChange();

      // opcional: también podrías limpiar verifyMessage, etc.
      // setVerifyMessage("");
      // setVerifyError("");

      // redirigir a la página de login
      router.push("/auth/sign-in");
    } catch {
      setLogoutError("Failed to log out.");
    } finally {
      setLogoutLoading(false);
    }
  }

  function redirectToSignIn() {
    // opcional: preservar a dónde volver
    const next = `/users/${user?.id ?? ""}`;
    window.location.href = `/auth/sign-in?next=${encodeURIComponent(next)}`;
  }

  async function handleFollowClick() {
    if (!user) return;

    // si NO hay usuario logueado -> redirigir
    if (!authUser) {
      redirectToSignIn();
      return;
    }

    setFollowLoading(true);
    setFollowMessage("");
    setFollowError("");

    try {
      const res = await UsersService.follow(user.id);

      if (!res.ok) {
        setFollowError(res.error || "Failed to follow user.");
        return;
      }

      const changed =
        typeof res.data === "object" ? !!res.data.changed : false;

      if (changed) {
        setFollowMessage("Now following this user.");
        triggerRevalidateForUser(user.id);
        triggerRevalidateForUser(authUser.id);
        
      } else {
        setFollowMessage("You were already following this user.");
      }
    } catch {
      setFollowError("Failed to follow user.");
    } finally {
      setFollowLoading(false);

      // limpiar el mensaje después de 3s
      setTimeout(() => {
        setFollowMessage("");
        setFollowError("");
      }, 3000);
    }
  }

  async function handleUnfollowClick() {
    if (!user) return;

    if (!authUser) {
      redirectToSignIn();
      return;
    }

    setFollowLoading(true);
    setFollowMessage("");
    setFollowError("");

    try {
      const res = await UsersService.unfollow(user.id);

      if (!res.ok) {
        setFollowError(res.error || "Failed to unfollow user.");
        return;
      }

      const changed =
        typeof res.data === "object" ? !!res.data.changed : false;

      if (changed) {
        setFollowMessage("You unfollowed this user.");
        triggerRevalidateForUser(user.id);
        triggerRevalidateForUser(authUser.id);
      } else {
        setFollowMessage("You were not following this user.");
      }
    } catch {
      setFollowError("Failed to unfollow user.");
    } finally {
      setFollowLoading(false);

      setTimeout(() => {
        setFollowMessage("");
        setFollowError("");
      }, 3000);
    }
  }
  
  // abrir/cerrar picker y cargar catálogo de S3
  async function handleToggleAvatarPicker() {
    if (showAvatarPicker) {
      setShowAvatarPicker(false);
      return;
    }

    setShowAvatarPicker(true);
    setAvatarError("");

    if (avatarCatalog.length > 0) return;

    try {
      setAvatarLoading(true);
      const res = await UsersService.getAvatarCatalog();
      if (!res.ok) {
        setAvatarError(res.error || "Failed to load avatars.");
        return;
      }
      const items = Array.isArray(res.data?.items) ? res.data.items : [];
      setAvatarCatalog(items);
    } catch {
      setAvatarError("Failed to load avatars.");
    } finally {
      setAvatarLoading(false);
    }
  }

  // seleccionar un avatar y enviar PATCH /users/me (avatar_key)
  async function handleSelectAvatar(item) {
    if (!user) return;

    setAvatarSaving(true);
    setError("");

    try {
      const res = await UsersService.patchMe({ avatar_key: item.key });
      if (!res.ok) {
        setError(res.error || "Failed to update avatar.");
        return;
      }

      // 1) Actualizar el estado local para que se vea inmediato
      setUser((prev) =>
        prev
          ? {
              ...prev,
              avatar_url: item.url,
              avatar_key: item.key,
            }
          : prev
      );

      // 2) Cerrar el picker
      setShowAvatarPicker(false);

      // 3) Disparar revalidación ISR en el servidor de Next
      triggerRevalidateForUser(user.id);
    } finally {
      setAvatarSaving(false);
    }
  }

  // flujo de edición de nombre
  function handleStartEditName() {
    setNameError("");
    setIsEditingName(true);
    setNameInput(user?.display_name || "");
  }

  function handleCancelEditName() {
    setIsEditingName(false);
    setNameError("");
    setNameInput(user?.display_name || "");
  }

  async function handleSaveName() {
    if (!user) return;
    const trimmed = nameInput.trim();

    if (!trimmed) {
      setNameError("Name cannot be empty.");
      return;
    }
    if (trimmed.length > 50) {
      setNameError("Name must be at most 50 characters.");
      return;
    }

    setNameSaving(true);
    setNameError("");
    setError("");

    try {
      const res = await UsersService.patchMe({ name: trimmed });

      if (!res.ok) {
        setNameError(res.error || "Failed to update name.");
        return;
      }

      // actualizar estado local
      setUser((prev) =>
        prev
          ? {
              ...prev,
              display_name: trimmed,
            }
          : prev
      );

      setIsEditingName(false);

      // revalidar ISR en segundo plano
      triggerRevalidateForUser(user.id);
    } finally {
      setNameSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={pageBg}>
        <div style={wrapper}>
          <div style={card}>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Loading profile…</p>
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

              {isOwner && (
                <button
                  type="button"
                  style={avatarEditBtn}
                  onClick={handleToggleAvatarPicker}
                  aria-label="Change avatar"
                >
                  ✏️
                </button>
              )}
            </div>

            <div style={{ flex: 1 }}>
              {/* Bloque de nombre con botón circular */}
              <div style={nameBlock}>
                <div style={nameRow}>
                  {isOwner && isEditingName ? (
                    <div style={nameEditRow}>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        maxLength={50}
                        style={nameInputStyle}
                        placeholder="Your display name"
                        disabled={nameSaving}
                      />
                      <div style={nameButtonsRow}>
                        <button
                          type="button"
                          style={primaryBtnSmall}
                          onClick={handleSaveName}
                          disabled={nameSaving}
                        >
                          {nameSaving ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          style={ghostBtnSmall}
                          onClick={handleCancelEditName}
                          disabled={nameSaving}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <h1 style={title}>{user.display_name}</h1>
                  )}
                </div>

                {isOwner && !isEditingName && (
                  <button
                    type="button"
                    style={nameEditBtn}
                    onClick={handleStartEditName}
                    aria-label="Edit name"
                  >
                    ✏️
                  </button>
                )}
              </div>

              {nameError && (
                <p style={{ ...subtitle, color: "var(--danger)", marginTop: 4 }}>
                  {nameError}
                </p>
              )}

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
                  {privateUser?.email && (
                    <p style={ownerInfoText}>
                      <strong>Email:</strong> {privateUser.email}{" "}
                      {privateUser.is_verified ? (
                        <span style={verifiedBadge}>Verified</span>
                      ) : (
                        <span style={unverifiedBadge}>Not verified</span>
                      )}
                    </p>
                  )}

                  {/* Botón solo si NO está verificado */}
                  {privateUser?.email && !privateUser.is_verified && (
                    <button
                      type="button"
                      style={verifyBtn}
                      onClick={handleSendVerificationEmail}
                      disabled={verifySending}
                    >
                      {verifySending
                        ? "Sending verification email…"
                        : "Send verification email"}
                    </button>
                  )}

                  {verifyMessage && (
                    <p style={{ ...ownerInfoText, color: "var(--accent)" }}>{verifyMessage}</p>
                  )}
                  {verifyError && (
                    <p style={{ ...ownerInfoText, color: "var(--danger)" }}>{verifyError}</p>
                  )}
                </div>
              )}
            </div>

            <div style={actionsCol}>
              {isOwner ? (
                <>
                  <span style={ownerBadge}>Your profile</span>

                  <button
                    type="button"
                    style={ghostBtn}
                    onClick={handleLogout}
                    disabled={logoutLoading}
                  >
                    {logoutLoading ? "Logging out…" : "Log out"}
                  </button>

                  {logoutError && (
                    <p
                      style={{
                        ...ownerInfoText,
                        color: "#b91c1c",
                        marginTop: 4,
                        textAlign: "right",
                      }}
                    >
                      {logoutError}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      style={primaryBtn}
                      onClick={handleFollowClick}
                      disabled={followLoading}
                    >
                      {followLoading ? "Working..." : "Follow"}
                    </button>

                    <button
                      type="button"
                      style={ghostBtn}
                      onClick={handleUnfollowClick}
                      disabled={followLoading}
                    >
                      {followLoading ? "Working..." : "Unfollow"}
                    </button>
                  </div>

                  {followMessage && (
                    <p
                      style={{
                        ...ownerInfoText,
                        color: "#15803d",
                        marginTop: 4,
                        textAlign: "right",
                      }}
                    >
                      {followMessage}
                    </p>
                  )}

                  {followError && (
                    <p
                      style={{
                        ...ownerInfoText,
                        color: "#b91c1c",
                        marginTop: 4,
                        textAlign: "right",
                      }}
                    >
                      {followError}
                    </p>
                  )}
                </>
              )}
            </div>

          </header>

          {/* Avatar picker (solo owner) */}
          {isOwner && showAvatarPicker && (
            <section aria-label="Avatar picker" style={avatarSection}>
              <div style={avatarPickerHeader}>
                <h2 style={sectionTitle}>Choose your avatar</h2>
                <button
                  type="button"
                  style={closeBtn}
                  onClick={() => setShowAvatarPicker(false)}
                >
                  ×
                </button>
              </div>

              {avatarLoading ? (
                <p style={subtitle}>Loading avatars…</p>
              ) : avatarError ? (
                <p style={{ ...subtitle, color: "#b91c1c" }}>{avatarError}</p>
              ) : avatarCatalog.length === 0 ? (
                <p style={subtitle}>No avatars available.</p>
              ) : (
                <div style={avatarGrid}>
                  {avatarCatalog.map((item) => {
                    const isSelected = user.avatar_key === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        style={{
                          ...avatarOption,
                          ...(isSelected ? avatarOptionSelected : null),
                        }}
                        onClick={() =>
                          !avatarSaving && handleSelectAvatar(item)
                        }
                        disabled={avatarSaving}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.key}
                          style={avatarThumb}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {avatarSaving && (
                <p style={{ ...subtitle, marginTop: 8 }}>
                  Saving avatar choice…
                </p>
              )}
            </section>
          )}

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
              <ProfileStat label="Following" value={user.stats?.following ?? 0} asLink />
            </Link>
          </section>

          {/* Created levels */}
          <section aria-label="Created puzzles" style={{ marginTop: 24 }}>
            <h2 style={sectionTitle}>Created levels</h2>
            {puzzles.length === 0 ? (
              <p style={subtitle}>
                {isOwner
                  ? "You haven’t created any levels yet."
                  : "This user hasn’t created any levels yet."}
              </p>
            ) : (
              <div style={puzzlesGrid}>
                {puzzles.map((puzzle) => (
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

            {/* Botón "ver todos" centrado */}
            <div style={seeAllWrapper}>
              <Link
                href={`/levels/browse?authorId=${user.id}`}
                style={seeAllButton}
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

const pageBg = {
  minHeight: "calc(100vh - 56px)",
  background: "var(--bg-primary)",
  padding: "32px 16px",
  color: "var(--text-primary)",
};

const wrapper = {
  maxWidth: 960,
  margin: "0 auto",
};

const card = {
  background: "var(--bg-secondary)",
  borderRadius: 18,
  padding: 24,
  boxShadow: `0 18px 45px var(--shadow)`,
  border: "1px solid var(--border-color)",
};

const title = {
  fontSize: 26,
  fontWeight: 900,
  margin: 0,
  marginBottom: 6,
  color: "var(--text-primary)",
};

const subtitle = {
  margin: 0,
  marginBottom: 12,
  color: "var(--text-secondary)",
  fontSize: 14,
};

const headerRow = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  marginBottom: 16,
  flexWrap: "wrap",
};

const avatarWrapper = {
  flexShrink: 0,
  position: "relative",
};

const avatarCircle = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-on-accent)",
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
  color: "var(--text-secondary)",
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
  background: "var(--bg-tertiary)",
  border: "1px solid var(--border-color)",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-secondary)",
};

const primaryBtn = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "none",
  background: "var(--accent)",
  color: "var(--text-on-accent)",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

const ghostBtn = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid var(--border-color)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: 13,
  cursor: "pointer",
};

const primaryLink = {
  fontSize: 13,
  color: "var(--accent)",
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
  background: "var(--bg-tertiary)",
  border: "1px solid var(--border-color)",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
};

const statValue = {
  fontSize: 18,
  fontWeight: 800,
  color: "var(--text-primary)",
};

const statLabel = {
  fontSize: 12,
  color: "var(--text-secondary)",
};

const sectionTitle = {
  margin: 0,
  marginBottom: 10,
  fontSize: 16,
  fontWeight: 700,
  color: "var(--text-primary)",
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
  border: "1px solid var(--border-color)",
  background: "var(--bg-tertiary)",
  textDecoration: "none",
  color: "var(--text-primary)",
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
  color: "var(--text-secondary)",
  margin: 0,
};

const seeAllWrapper = {
  display: "flex",
  justifyContent: "center",
  marginTop: 16,
};

const seeAllButton = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "1px solid var(--border-color)",
  background: "var(--bg-secondary)",
  fontSize: 13,
  fontWeight: 500,
  textDecoration: "none",
  color: "var(--text-primary)",
};

/* nombre editable */
const nameBlock = {
  position: "relative",
  display: "inline-block",
  maxWidth: "100%",
};

const nameRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

const nameEditRow = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const nameInputStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid var(--border-color)",
  fontSize: 14,
  outline: "none",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
};

const nameButtonsRow = {
  display: "flex",
  gap: 8,
};

const primaryBtnSmall = {
  ...primaryBtn,
  padding: "6px 12px",
  fontSize: 13,
};

const ghostBtnSmall = {
  ...ghostBtn,
  padding: "6px 12px",
  fontSize: 13,
};

// iconos circulares
const editIconBase = {
  position: "absolute",
  width: 22,
  height: 22,
  borderRadius: 999,
  border: "1px solid var(--border-color)",
  background: "var(--bg-secondary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px var(--shadow-md)",
  cursor: "pointer",
  fontSize: 12,
};

const avatarEditBtn = {
  ...editIconBase,
  right: -4,
  top: -4,
};

const nameEditBtn = {
  ...editIconBase,
  right: -14,
  top: -10,
};

const avatarSection = {
  marginTop: 12,
  marginBottom: 16,
  padding: 12,
  borderRadius: 14,
  background: "var(--bg-tertiary)",
  border: "1px solid var(--border-color)",
};

const avatarPickerHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
};

const closeBtn = {
  border: "none",
  background: "transparent",
  fontSize: 18,
  lineHeight: 1,
  cursor: "pointer",
  padding: 4,
  color: "var(--text-primary)",
};

const avatarGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(64px, 1fr))",
  gap: 8,
  marginTop: 8,
};

const avatarOption = {
  borderRadius: 12,
  border: "1px solid var(--border-color)",
  padding: 4,
  background: "var(--bg-secondary)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const avatarOptionSelected = {
  borderColor: "var(--accent)",
  boxShadow: "0 0 0 2px rgba(236, 72, 153, 0.35)",
};

const avatarThumb = {
  width: 56,
  height: 56,
  borderRadius: 999,
  objectFit: "cover",
};

const verifiedBadge = {
  marginLeft: 8,
  padding: "2px 8px",
  borderRadius: 999,
  background: "#ecfdf3",
  color: "#166534",
  fontSize: 11,
  fontWeight: 600,
  border: "1px solid #bbf7d0",
};

const unverifiedBadge = {
  marginLeft: 8,
  padding: "2px 8px",
  borderRadius: 999,
  background: "var(--danger-bg)",
  color: "var(--danger)",
  fontSize: 11,
  fontWeight: 600,
  border: "1px solid var(--danger)",
};

const verifyBtn = {
  marginTop: 4,
  padding: "6px 12px",
  borderRadius: 999,
  border: "1px solid var(--accent)",
  background: "var(--accent)",
  color: "var(--text-on-accent)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  alignSelf: "flex-start",
};
