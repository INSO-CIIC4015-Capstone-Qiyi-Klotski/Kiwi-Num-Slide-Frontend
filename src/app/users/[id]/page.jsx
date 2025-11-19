// src/app/users/[id]/page.jsx
import UserProfileClient from "./UserProfileClient";
import { API_URL } from "../../../lib/env";

// ISR para datos públicos del perfil
export const revalidate = 60; // o 300, como prefieras

async function getPublicUser(id) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "GET",
    next: {
      revalidate,
      tags: [`user:${id}`],
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data ?? null;
}

async function getCreatedPuzzles(id) {
  const qs = new URLSearchParams({
    authorId: String(id),
    limit: "2", // 👈 solo queremos 2 para el preview
    sort: "created_at_desc",
  });

  const res = await fetch(`${API_URL}/puzzles?${qs.toString()}`, {
    method: "GET",
    next: {
      revalidate,
      tags: [`user:${id}:puzzles`],
    },
  });

  if (!res.ok) return [];
  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];
  return items;
}

/**
 * SEO dinámico para /users/[id]
 * El título queda algo como:
 *   "Janiel Núñez - Profile | KiwiNumSlide"
 */
export async function generateMetadata({ params }) {
  const rawId = params?.id;
  const id = typeof rawId === "string" ? rawId : "";

  // Si el id es inválido, título genérico de error
  if (!id || !/^\d+$/.test(id)) {
    return {
      title: "User not found - KiwiNumSlide",
      description: "User profile not found.",
    };
  }

  const user = await getPublicUser(id);

  if (!user) {
    return {
      title: "User not found - KiwiNumSlide",
      description: "User profile not found.",
    };
  }

  const displayName = user.display_name || "User";

  return {
    title: `${displayName} - Profile | KiwiNumSlide`,
    description: `View ${displayName}'s public profile on KiwiNumSlide.`,
  };
}

export default async function UserProfilePage({ params }) {
  const rawId = params?.id;
  const id = typeof rawId === "string" ? rawId : "";

  if (!id || !/^\d+$/.test(id)) {
    return (
      <main style={{ padding: 32 }}>
        <h1>User not found</h1>
        <p>Invalid user id.</p>
      </main>
    );
  }

  const [initialUser, initialPuzzles] = await Promise.all([
    getPublicUser(id),
    getCreatedPuzzles(id),
  ]);

  return (
    <UserProfileClient
      userId={id}
      initialUser={initialUser}
      initialPuzzles={initialPuzzles}
    />
  );
}
