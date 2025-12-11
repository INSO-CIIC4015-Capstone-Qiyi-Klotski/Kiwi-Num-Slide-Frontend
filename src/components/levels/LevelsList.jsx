// src/components/levels/LevelsList.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PuzzlesService } from "@/services/puzzles.service";
import { AuthService } from "@/services/auth.service";
import { UsersService } from "@/services/users.service";
import LevelCard from "./LevelCard";

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const skeletonCard = {
  border: "1px solid var(--border-color)",
  borderRadius: 12,
  padding: 16,
  background: "var(--bg-secondary)",
  height: 120,
  animation: "pulse 1.5s ease-in-out infinite",
};

export default function LevelsList({ backTo }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Full query string (including cursor). Used as a dependency for data loading.
  const queryKey = useMemo(() => searchParams.toString(), [searchParams]);

  // Filters-only key (query string without "cursor"). When this changes,
  // pagination history must be reset.
  const filtersKey = useMemo(() => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("cursor");
    return sp.toString();
  }, [searchParams]);

  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);

  // Cursor history stack used to implement "Previous" pagination
  // independently from the backend.
  const [cursorStack, setCursorStack] = useState([null]);

  const [reloadId, setReloadId] = useState(0);

  // 👉 ids de puzzles que el usuario actual ha dado like (como strings)
  const [likedPuzzleIds, setLikedPuzzleIds] = useState([]);

  // When filters change (not just the cursor), reset cursor history.
  useEffect(() => {
    setCursorStack([null]);
  }, [filtersKey]);

  const currentCursor = searchParams.get("cursor") || null;

  // Keeps cursorStack in sync when the user navigates with browser back/forward
  // and the cursor query param changes outside of button handlers.
  useEffect(() => {
    setCursorStack((prev) => {
      const top = prev[prev.length - 1] ?? null;
      if (top === currentCursor) return prev;

      const idx = prev.indexOf(currentCursor);
      if (idx !== -1) {
        return prev.slice(0, idx + 1);
      }
      return [...prev, currentCursor];
    });
  }, [currentCursor]);

  // Maps UI sort values to backend sort keys.
  function mapSort(sortUi) {
    switch (sortUi) {
      case "likes":
        return "likes_desc";
      case "difficulty":
        return "difficulty_desc";
      case "difficulty-asc":
        return "difficulty_asc";
      case "size":
        return "size_desc";
      default:
        return "created_at_desc";
    }
  }

  // Loads levels whenever the query string (or manual reloadId) changes.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setLikedPuzzleIds([]); // resetea likes al recargar la lista

      try {
        const q = searchParams.get("q") || null;
        const generatedBy = searchParams.get("generatedBy") || null;
        const authorId = searchParams.get("authorId") || null;
        const minLikesStr = searchParams.get("minLikes") || null;
        const sortUi = searchParams.get("sort") || "recent";
        const limitStr = searchParams.get("limit") || "20";
        const cursor = searchParams.get("cursor") || null;
        const operatorsStr = searchParams.get("operators") || "";

        const limit = Number(limitStr) || 20;
        const minLikes = minLikesStr ? Number(minLikesStr) : null;
        const operators =
          operatorsStr && operatorsStr.trim().length
            ? operatorsStr.split(",")
            : null;

        const sort = mapSort(sortUi);

        // 1) Cargamos los niveles
        const res = await PuzzlesService.browse({
          q,
          sort,
          limit,
          cursor,
          authorId,
          generatedBy,
          minLikes,
          operators,
        });

        if (cancelled) return;

        // Normalizes different possible response shapes:
        // - plain object with { items, next_cursor }
        // - wrapped as { data: { ... } }
        let container = res;
        if (
          res &&
          typeof res === "object" &&
          "data" in res &&
          res.data &&
          typeof res.data === "object"
        ) {
          container = res.data;
        }

        let items = [];
        let next = null;

        if (Array.isArray(container)) {
          items = container;
        } else if (container && typeof container === "object") {
          const raw =
            container.items !== undefined
              ? container.items
              : container.data !== undefined
              ? container.data
              : container.puzzles !== undefined
              ? container.puzzles
              : [];

          items = Array.isArray(raw) ? raw : [];
          next = container.next_cursor ?? container.nextCursor ?? null;
        }

        setLevels(items);
        setNextCursor(next);

        // 2) Si hay usuario logueado, cargamos TODOS sus likes (paginando en el servicio)
        try {
          const statusRes = await AuthService.status();
          if (!cancelled && statusRes.ok && statusRes.data?.user?.id) {
            const userId = statusRes.data.user.id;

            const ids = await UsersService.getAllPuzzleLikedIds(userId, {
              maxPages: 5,
              limit: 100,
            });

            if (!cancelled) {
              setLikedPuzzleIds(ids); // ya son strings
            }
          }
        } catch (e) {
          if (!cancelled) {
            console.error("Error fetching liked puzzles for user:", e);
            setLikedPuzzleIds([]);
          }
        }
      } catch (e) {
        if (cancelled) return;
        setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [queryKey, reloadId, searchParams]);

  // Updates the "cursor" query parameter while preserving the rest of filters.
  function updateCursor(newCursor) {
    const sp = new URLSearchParams(searchParams.toString());
    if (!newCursor) sp.delete("cursor");
    else sp.set("cursor", newCursor);
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const canGoPrev = cursorStack.length > 1;

  // Moves forward in pagination using nextCursor and pushes it into the stack.
  function goNext() {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
    updateCursor(nextCursor);
  }

  // Moves backward in pagination by popping the stack and restoring
  // the previous cursor (or null for the first page).
  function goPrev() {
    setCursorStack((prev) => {
      if (prev.length <= 1) {
        updateCursor(null);
        return [null];
      }
      const newStack = prev.slice(0, -1);
      const newCursor = newStack[newStack.length - 1] ?? null;
      updateCursor(newCursor);
      return newStack;
    });
  }

  // Loading state (only skeletons if there are no loaded levels yet).
  if (loading && (!Array.isArray(levels) || levels.length === 0)) {
    return (
      <section aria-busy="true" aria-label="Loading levels">
        <div style={gridStyle}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={skeletonCard} />
          ))}
        </div>
      </section>
    );
  }

  // Error state with retry action.
  if (error) {
    return (
      <section aria-label="Error loading levels" style={{ textAlign: "center" }}>
        <p style={{ color: "var(--danger)", marginBottom: 8 }}>
          An error occurred while loading levels.
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 12,
            wordBreak: "break-word",
          }}
        >
          {String(error)}
        </p>
        <button
          type="button"
          onClick={() => setReloadId((x) => x + 1)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Retry
        </button>
      </section>
    );
  }

  const safeLevels = Array.isArray(levels) ? levels : [];
  const hasLevels = safeLevels.length > 0;

  // Set con los ids de puzzles que el user ha likeado (todo en string)
  const likedSet = new Set(
    (likedPuzzleIds || []).map((id) => String(id))
  );

  // Empty state when there are no levels and no loading in progress.
  if (!loading && !hasLevels) {
    return (
      <section aria-label="No levels found" style={{ textAlign: "center", color: "var(--text-primary)" }}>
        <p style={{ marginBottom: 8 }}>
          No levels were found with the current filters.
        </p>
        <Link
          href="/levels/browse"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border-color)",
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            fontSize: 13,
          }}
        >
          Clear filters
        </Link>
      </section>
    );
  }

  // Common pagination controls used both above and below the grid.
  const renderPagination = () => (
    <div
      style={{
        marginTop: 16,
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <button
        type="button"
        disabled={!canGoPrev}
        onClick={goPrev}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid var(--border-color)",
          background: canGoPrev ? "var(--bg-secondary)" : "var(--bg-tertiary)",
          color: "var(--text-primary)",
          cursor: canGoPrev ? "pointer" : "default",
          fontSize: 13,
          opacity: canGoPrev ? 1 : 0.6,
        }}
      >
        ← Previous
      </button>

      <button
        type="button"
        disabled={!nextCursor}
        onClick={goNext}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid var(--border-color)",
          background: nextCursor ? "var(--bg-secondary)" : "var(--bg-tertiary)",
          color: "var(--text-primary)",
          cursor: nextCursor ? "pointer" : "default",
          fontSize: 13,
          opacity: nextCursor ? 1 : 0.6,
        }}
      >
        Next →
      </button>
    </div>
  );

  return (
    <section aria-label="Levels list">
      {/* Top pagination controls (only rendered when there are results) */}
      {hasLevels && renderPagination()}

      <div style={gridStyle}>
        {safeLevels.map((lvl) => {
          const rawPuzzleId = lvl.id ?? lvl.slug;
          const puzzleKey =
            rawPuzzleId !== null && rawPuzzleId !== undefined
              ? String(rawPuzzleId)
              : null;

          // priorizamos flags que ya vengan del backend,
          // y si no, usamos el set de likes del usuario
          const liked =
            lvl.liked ??
            lvl.is_liked ??
            (puzzleKey != null && likedSet.has(puzzleKey));

          return (
            <LevelCard
              key={puzzleKey ?? Math.random()}
              level={{ ...lvl, liked }}
              backTo={backTo}
            />
          );
        })}
      </div>

      {/* Bottom pagination controls (only rendered when there are results) */}
      {hasLevels && renderPagination()}
    </section>
  );
}
