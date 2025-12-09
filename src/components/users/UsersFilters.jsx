// src/components/users/UsersFilters.jsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const boxStyle = {
  border: "1px solid var(--border-color)",
  borderRadius: 12,
  padding: 16,
  background: "var(--bg-secondary)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const rowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-primary)",
};

const inputStyle = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid var(--border-color)",
  background: "var(--bg-tertiary)",
  color: "var(--text-primary)",
  fontSize: 14,
};

const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "2px 8px",
  borderRadius: 999,
  background: "var(--bg-tertiary)",
  color: "var(--text-primary)",
  fontSize: 12,
};

export default function UsersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const followersOf = searchParams.get("followersOf") ?? "";
  const followingOf = searchParams.get("followingOf") ?? "";
  const sort = searchParams.get("sort") ?? "recent";
  const limit = searchParams.get("limit") ?? "20";

  function updateParam(key, value) {
    const sp = new URLSearchParams(searchParams.toString());

    if (value == null || value === "") {
      sp.delete(key);
    } else {
      sp.set(key, value);
    }

    // Siempre que cambie un filtro, reseteamos cursor
    if (key !== "cursor") {
      sp.delete("cursor");
    }

    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function clearFilters() {
    router.push(pathname, { scroll: false });
  }

  const hasFollowFilters = !!followersOf || !!followingOf;

  return (
    <section aria-label="User filters" style={boxStyle}>
      <div style={rowStyle}>
        <div style={{ flex: "1 1 220px", minWidth: 200 }}>
          <label style={labelStyle}>
            Search
            <input
              style={{ ...inputStyle, width: "100%", marginTop: 4 }}
              type="text"
              placeholder="User name…"
              value={q}
              onChange={(e) => updateParam("q", e.target.value)}
            />
          </label>
        </div>

        <div style={{ flex: "0 0 150px" }}>
          <label style={labelStyle}>
            Followers of (id / me)
            <input
              style={{ ...inputStyle, width: "100%", marginTop: 4 }}
              type="text"
              value={followersOf}
              onChange={(e) => updateParam("followersOf", e.target.value)}
            />
          </label>
        </div>

        <div style={{ flex: "0 0 150px" }}>
          <label style={labelStyle}>
            Following of (id / me)
            <input
              style={{ ...inputStyle, width: "100%", marginTop: 4 }}
              type="text"
              value={followingOf}
              onChange={(e) => updateParam("followingOf", e.target.value)}
            />
          </label>
        </div>
      </div>

      <div style={rowStyle}>
        <div style={{ flex: "0 0 160px" }}>
          <label style={labelStyle}>
            Sort by
            <select
              style={{ ...inputStyle, width: "100%", marginTop: 4 }}
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
            >
              <option value="recent">Most recent</option>
              <option value="followers">Most followers</option>
              <option value="created">Most created puzzles</option>
              <option value="solved">Most solved</option>
            </select>
          </label>
        </div>

        <div style={{ flex: "0 0 120px" }}>
          <label style={labelStyle}>
            Per page
            <input
              style={{ ...inputStyle, width: "100%", marginTop: 4 }}
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(e) => updateParam("limit", e.target.value)}
            />
          </label>
        </div>

        <div style={{ flex: "0 0 auto", alignSelf: "flex-end" }}>
          <button
            type="button"
            onClick={clearFilters}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border-color)",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      {hasFollowFilters && (
        <div style={{ marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {followersOf && (
            <span style={chipStyle}>
              followersOf={followersOf}
              <button
                type="button"
                onClick={() => updateParam("followersOf", "")}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 12,
                }}
                aria-label="Clear followersOf filter"
              >
                ×
              </button>
            </span>
          )}
          {followingOf && (
            <span style={chipStyle}>
              followingOf={followingOf}
              <button
                type="button"
                onClick={() => updateParam("followingOf", "")}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 12,
                }}
                aria-label="Clear followingOf filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </section>
  );
}
