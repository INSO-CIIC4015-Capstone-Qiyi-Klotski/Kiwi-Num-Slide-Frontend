// src/components/users/UsersList.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UsersService } from "@/services/users.service";
import UserCard from "./UserCard";

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const skeletonCard = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  background: "#f9fafb",
  height: 100,
  animation: "pulse 1.5s ease-in-out infinite",
};

export default function UsersList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Query completa (incluye cursor)
  const queryKey = useMemo(() => searchParams.toString(), [searchParams]);

  // Key solo de filtros (sin cursor) para resetear historial
  const filtersKey = useMemo(() => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("cursor");
    return sp.toString();
  }, [searchParams]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);

  // Historial de cursores
  const [cursorStack, setCursorStack] = useState([null]);
  const [reloadId, setReloadId] = useState(0);

  // Reset del stack cuando cambian los filtros
  useEffect(() => {
    setCursorStack([null]);
  }, [filtersKey]);

  const currentCursor = searchParams.get("cursor") || null;

  // Sincroniza cursorStack con navegación del browser
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

  // Mapea valores de sort del UI a sort del backend
  function mapSort(sortUi) {
    switch (sortUi) {
      case "followers":
        return "followers_desc";
      case "created":
        return "created_desc";
      case "solved":
        return "solved_desc";
      default:
        return "created_at_desc";
    }
  }

  // Carga de usuarios
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const q = searchParams.get("q") || null;
        const followersOf = searchParams.get("followersOf") || null;
        const followingOf = searchParams.get("followingOf") || null;
        const sortUi = searchParams.get("sort") || "recent";
        const limitStr = searchParams.get("limit") || "20";
        const cursor = searchParams.get("cursor") || null;

        const limit = Number(limitStr) || 20;
        const sort = mapSort(sortUi);

        const res = await UsersService.browse({
          q,
          followersOf,
          followingOf,
          sort,
          limit,
          cursor,
        });

        if (cancelled) return;

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
              : container.users !== undefined
              ? container.users
              : [];

          items = Array.isArray(raw) ? raw : [];
          next = container.next_cursor ?? container.nextCursor ?? null;
        }

        setUsers(items);
        setNextCursor(next);
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

  function updateCursor(newCursor) {
    const sp = new URLSearchParams(searchParams.toString());
    if (!newCursor) sp.delete("cursor");
    else sp.set("cursor", newCursor);
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const canGoPrev = cursorStack.length > 1;

  function goNext() {
    if (!nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
    updateCursor(nextCursor);
  }

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

  // Loading inicial
  if (loading && (!Array.isArray(users) || users.length === 0)) {
    return (
      <section aria-busy="true" aria-label="Loading users">
        <div style={gridStyle}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={skeletonCard} />
          ))}
        </div>
      </section>
    );
  }

  // Error
  if (error) {
    return (
      <section aria-label="Error loading users" style={{ textAlign: "center" }}>
        <p style={{ color: "#b91c1c", marginBottom: 8 }}>
          An error occurred while loading users.
        </p>
        <p
          style={{
            fontSize: 12,
            color: "#6b7280",
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
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Retry
        </button>
      </section>
    );
  }

  const safeUsers = Array.isArray(users) ? users : [];
  const hasUsers = safeUsers.length > 0;

  // Empty
  if (!loading && !hasUsers) {
    return (
      <section aria-label="No users found" style={{ textAlign: "center" }}>
        <p style={{ marginBottom: 8 }}>
          No users were found with the current filters.
        </p>
        <Link
          href="/users/browse"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#fff",
            fontSize: 13,
          }}
        >
          Clear filters
        </Link>
      </section>
    );
  }

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
          border: "1px solid #d1d5db",
          background: canGoPrev ? "#fff" : "#f3f4f6",
          cursor: canGoPrev ? "pointer" : "default",
          fontSize: 13,
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
          border: "1px solid #d1d5db",
          background: nextCursor ? "#fff" : "#f3f4f6",
          cursor: nextCursor ? "pointer" : "default",
          fontSize: 13,
        }}
      >
        Next →
      </button>
    </div>
  );

  return (
    <section aria-label="Users list">
      {hasUsers && renderPagination()}

      <div style={gridStyle}>
        {safeUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {hasUsers && renderPagination()}
    </section>
  );
}
