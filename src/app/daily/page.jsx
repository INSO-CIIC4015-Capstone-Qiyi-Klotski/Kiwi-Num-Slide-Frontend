// src/app/daily/page.jsx
import { API_URL } from "@/lib/env";
import PageLayout from "@/components/layout/PageLayout";
import DailyCard from "@/components/daily/DailyCard";
import DailyDateSearchCard from "@/components/daily/DailyDateSearchCard";

export const revalidate = 86400; // 24h

function normalizeOperatorsFromBoardSpec(boardSpec) {
  const raw = boardSpec?.operators;
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const map = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
  };

  const seen = new Set();
  const result = [];

  for (const op of raw) {
    const mapped = map[op];
    if (!mapped) continue;
    if (!seen.has(mapped)) {
      seen.add(mapped);
      result.push(mapped);
    }
  }

  return result;
}

async function getDailyMeta() {
  // 1) Daily de hoy (trae date + meta básica + author)
  const resDaily = await fetch(`${API_URL}/puzzles/daily-puzzle`, {
    method: "GET",
    next: {
      revalidate: 86400,
      tags: ["daily"],
    },
  });

  if (!resDaily.ok) {
    console.error("Failed to load /puzzles/daily-puzzle", resDaily.status);
    return null;
  }

  const daily = await resDaily.json();
  const dailyPuzzle = daily.puzzle;

  if (!dailyPuzzle || !dailyPuzzle.id) {
    console.warn("No puzzle in /puzzles/daily-puzzle payload", daily);
    return null;
  }

  const id = dailyPuzzle.id;

  // 2) Detalles completos para sacar operadores, likes, solves, author enriquecido
  const resPuzzle = await fetch(`${API_URL}/puzzles/${id}`, {
    method: "GET",
    next: {
      revalidate: 86400,
      tags: ["daily"],
    },
  });

  if (!resPuzzle.ok) {
    console.error("Failed to load /puzzles/:id for daily", resPuzzle.status);
    return null;
  }

  const puzzle = await resPuzzle.json();
  const operators = normalizeOperatorsFromBoardSpec(puzzle.board_spec);

  return {
    id,
    date: daily.date, // YYYY-MM-DD
    title: dailyPuzzle.title ?? puzzle.title ?? `Puzzle #${id}`,
    difficulty: dailyPuzzle.difficulty ?? puzzle.difficulty ?? null,
    size:
      dailyPuzzle.size ??
      puzzle.size ??
      puzzle.board_spec?.N ??
      null,
    operators,
    author: puzzle.author ?? dailyPuzzle.author ?? null,
    likesCount: puzzle.likes_count ?? 0,
    solvesCount: puzzle.solves_count ?? 0,
  };
}

export default async function DailyPuzzlePage({ searchParams }) {
  const backHref = searchParams?.backTo || "/";
  
  let dailyMeta = null;

  try {
    dailyMeta = await getDailyMeta();
  } catch (e) {
    console.error("Error loading daily puzzle:", e);
  }

  if (!dailyMeta) {
    return (
      <PageLayout
        title="Daily Puzzle"
        subtitle="No daily puzzle is available right now. Please check back later."
        backHref={backHref}
      >
        <p>
          We couldn&apos;t load today&apos;s puzzle. Try again in a few minutes
          or refresh the page.
        </p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Daily Puzzle"
      subtitle="Play today's featured level and try to beat your best time."
      backHref={backHref}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 24,
            alignItems: "flex-start",
            maxWidth: 1100,
            width: "100%",
          }}
        >
          {/* Card principal del daily */}
          <div style={{ flex: 2, minWidth: 0 }}>
            <DailyCard
              id={dailyMeta.id}
              date={dailyMeta.date}
              title={dailyMeta.title}
              difficulty={dailyMeta.difficulty}
              size={dailyMeta.size}
              operators={dailyMeta.operators}
              author={dailyMeta.author}
              likesCount={dailyMeta.likesCount}
              solvesCount={dailyMeta.solvesCount}
              ctaHref={`/levels/${dailyMeta.id}`}
            />
          </div>

          {/* Mini card para buscar daily por fecha */}
          <div style={{ flex: 1, minWidth: 260, maxWidth: 360 }}>
            <DailyDateSearchCard />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
