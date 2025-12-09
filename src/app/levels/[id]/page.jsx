// src/app/levels/[id]/page.jsx
import { API_URL } from "@/lib/env";
import PageLayout from "@/components/layout/PageLayout";
import { toUIPuzzle } from "@/components/Puzzle/puzzle-api";
import LevelGameClient from "./LevelGameClient";

export const revalidate = 60; // igual que /users/[id] (o 300 si quieres)

/**
 * Trae el puzzle público por ID desde el backend (API_URL)
 * y lo transforma al formato de UI usando toUIPuzzle.
 */
async function getPuzzleById(id) {
  const res = await fetch(`${API_URL}/puzzles/${id}`, {
    method: "GET",
    next: {
      revalidate,
      tags: [`puzzle:${id}`],
    },
  });

  if (!res.ok) return null;
  const data = await res.json();

  if (!data || !data.board_spec) return null;

  const uiPuzzle = toUIPuzzle(data.board_spec);

  return {
    id: data.id,
    title: data.title ?? `Puzzle #${id}`,
    difficulty: data.difficulty ?? null,
    size: data.size ?? data.board_spec.N,
    author:
      (data.author && data.author.display_name) ||
      data.author_name ||
      (data.author_id ? `User #${data.author_id}` : "Unknown"),
    uiPuzzle,
  };
}

/**
 * SEO dinámico para /levels/[id]
 */
export async function generateMetadata({ params }) {
  const { id: rawId } = await params;
  const id = typeof rawId === "string" ? rawId : "";

  if (!id || !/^\d+$/.test(id)) {
    return {
      title: "Level not found - Kiwi Num Slide",
      description: "Level not found or invalid id.",
    };
  }

  const puzzle = await getPuzzleById(id);

  if (!puzzle) {
    return {
      title: "Level not found - Kiwi Num Slide",
      description: "Level not found or unavailable.",
    };
  }

  const difficultyLabel =
    puzzle.difficulty != null ? ` • Difficulty ${puzzle.difficulty}` : "";

  return {
    title: `${puzzle.title}${difficultyLabel} | Kiwi Num Slide`,
    description: `Play the level "${puzzle.title}" on Kiwi Num Slide.`,
  };
}

export default async function LevelPage({ params }) {
  const { id: rawId } = await params;
  const id = typeof rawId === "string" ? rawId : "";

  if (!id || !/^\d+$/.test(id)) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Level not found</h1>
        <p>Invalid level id.</p>
      </main>
    );
  }

  const puzzle = await getPuzzleById(id);

  if (!puzzle) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Level not found</h1>
        <p>This level does not exist or is unavailable.</p>
      </main>
    );
  }

  const subtitleParts = [
    `Size ${puzzle.size}`,
    puzzle.difficulty != null ? `Difficulty ${puzzle.difficulty}` : null,
    puzzle.author ? `By ${puzzle.author}` : null,
  ].filter(Boolean);

  return (
    <PageLayout
      title={puzzle.title}
      subtitle={subtitleParts.join(" • ")}
      backHref="/levels/browse"
      titleFontSize="clamp(28px, 5vw, 64px)"
      titleFontSizeTablet="clamp(24px, 5vw, 48px)"
      titleFontSizeMobile="clamp(28px, 7vw, 40px)"
    >
      <LevelGameClient
        puzzleId={Number(id)}
        initialUiPuzzle={puzzle.uiPuzzle}
        meta={{
          title: puzzle.title,
          difficulty: puzzle.difficulty,
          size: puzzle.size,
          author: puzzle.author,
        }}
      />
    </PageLayout>
  );
}
