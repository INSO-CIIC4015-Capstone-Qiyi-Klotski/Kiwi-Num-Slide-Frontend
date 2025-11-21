// src/components/daily/DailyDateSearchCard.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/env";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const titleStyle = {
  fontSize: 15,
  fontWeight: 600,
};

const helperStyle = {
  fontSize: 12,
  color: "#6b7280",
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 13,
};

const resultTitleStyle = {
  fontSize: 13,
  marginTop: 4,
};

const errorStyle = {
  fontSize: 12,
  color: "#b91c1c",
};

const linkButtonStyle = {
  display: "inline-block",
  marginTop: 8,
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid #4b5563",
  textDecoration: "none",
};

export default function DailyDateSearchCard() {
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { id, title }
  const [error, setError] = useState("");

  const todayISO = new Date().toISOString().slice(0, 10);
  // Puedes ajustar este mínimo cuando quieras
  const minDate = "2025-09-01";

  async function handleChange(e) {
    const value = e.target.value;
    setSelectedDate(value);
    setResult(null);
    setError("");

    if (!value) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/puzzles/daily-puzzle/${value}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("No daily puzzle configured for this date.");
        } else {
          setError("Error loading daily puzzle for this date.");
        }
        return;
      }

      const data = await res.json();
      if (data && data.puzzle) {
        const id = data.puzzle.id;
        const title =
          data.puzzle.title || `Puzzle #${id}`;
        setResult({ id, title });
      } else {
        setError("No daily puzzle configured for this date.");
      }
    } catch (err) {
      console.error("Error fetching daily puzzle by date", err);
      setError("Network error while loading daily puzzle.");
    } finally {
      setLoading(false);
    }
  }

  const queryHref =
    result?.title
      ? `/levels/browse?q=${encodeURIComponent(result.title)}`
      : null;

  return (
    <aside style={cardStyle}>
      <div>
        <div style={titleStyle}>Find a past daily</div>
        <p style={helperStyle}>
          Pick a date to look up that day&apos;s daily puzzle and search
          for it in the level browser.
        </p>
      </div>

      <input
        type="date"
        value={selectedDate}
        onChange={handleChange}
        min={minDate}
        max={todayISO}
        style={inputStyle}
      />

      {loading && (
        <div style={helperStyle}>Loading daily puzzle…</div>
      )}

      {!loading && result && (
        <div>
          <div style={resultTitleStyle}>
            {selectedDate}: {result.title}
          </div>
          {queryHref && (
            <Link href={queryHref} style={linkButtonStyle}>
              Open in level browser →
            </Link>
          )}
        </div>
      )}

      {!loading && error && (
        <div style={errorStyle}>{error}</div>
      )}
    </aside>
  );
}
