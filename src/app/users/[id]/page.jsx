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
    limit: "12",
    sort: "created_at_desc",
  });

  const res = await fetch(`${API_URL}/puzzles?${qs.toString()}`, {
    method: "GET",
    next: {
      revalidate,
      tags: [`user:${id}:puzzles`], // nombre que quieras para las tags
    },
  });

  if (!res.ok) return [];
  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];
  return items;
}

export default async function UserProfilePage({ params }) {
  const rawId = params?.id;
  const id = typeof rawId === "string" ? rawId : "";

  if (!id || !/^\d+$/.test(id)) {
    // podrías usar notFound() si quieres un 404 real
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

  // si quieres, puedes hacer un early 404 si no hay usuario
  // if (!initialUser) notFound();

  return (
    <UserProfileClient
      userId={id}
      initialUser={initialUser}
      initialPuzzles={initialPuzzles}
    />
  );
}
