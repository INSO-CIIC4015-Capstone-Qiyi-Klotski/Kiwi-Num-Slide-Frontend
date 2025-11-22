// src/components/levels/create/NumbersStep.jsx
"use client";

import { useState } from "react";
import { getNumbersGrid } from "@/components/Puzzle/puzzle-utils";

export default function NumbersStep({ size, numbers, onChange, onPrev, onNext }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const grid = getNumbersGrid(numbers, size);
  const totalTiles = size * size;
  const blankIndex = totalTiles - 1; // última casilla = hueco

  const filledCount = numbers.filter((n) => n !== null).length;
  const allFilled = filledCount === totalTiles - 1;

  const handleTileClick = (row, col) => {
    const idx = row * size + col;
    if (idx === blankIndex) return; // no se edita el hueco
    setActiveIndex(idx);
  };

  const handlePickNumber = (value) => {
    if (activeIndex == null) return;
    // solo 1–9, ignorar 0 o cosas raras
    if (value < 1 || value > 9) return;

    const next = numbers.slice();
    next[activeIndex] = value;
    onChange(next);
    setActiveIndex(null);
  };

  const handleClear = () => {
    if (activeIndex == null) return;
    const next = numbers.slice();
    next[activeIndex] = null;
    onChange(next);
    setActiveIndex(null);
  };

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>2. Initial state — numbers</h2>
      <p style={{ fontSize: 14, color: "#4b5563" }}>
        Click any tile (except the blank) to assign a value from 1 to 9. All tiles must be set
        before continuing.
      </p>

      {/* Grid cuadrado */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, 70px)`,
          gridAutoRows: "70px",
          gap: 0,
          background: "#fff",
          border: "3px solid #111",
          borderRadius: 12,
        //   overflow: "hidden",
          width: "fit-content",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const idx = rowIndex * size + colIndex;
            const isBlank = idx === blankIndex;
            const isActive = idx === activeIndex;

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                onClick={() => handleTileClick(rowIndex, colIndex)}
                style={{
                  width: 70,
                  height: 70,
                  borderRight: colIndex === size - 1 ? "none" : "3px solid #111",
                  borderBottom: rowIndex === size - 1 ? "none" : "3px solid #111",
                  background: isBlank
                    ? "#f9f9f9"
                    : isActive
                    ? "#e5f6ff"
                    : "#ffffff",
                  color: isBlank ? "transparent" : "#111827",
                  fontSize: 26,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isBlank ? "default" : "pointer",
                  outline: isActive ? "2px solid #0ea5e9" : "none",
                  outlineOffset: -2,
                }}
              >
                {isBlank ? "•" : value ?? ""}
              </button>
            );
          })
        )}
      </div>

      {/* Navegación */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          type="button"
          onClick={onPrev}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!allFilled}
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            border: "1px solid #111827",
            background: allFilled ? "#111827" : "#9ca3af",
            color: "#f9fafb",
            fontSize: 14,
            fontWeight: 600,
            cursor: allFilled ? "pointer" : "not-allowed",
          }}
        >
          Continue to operators →
        </button>
      </div>

      {!allFilled && (
        <p style={{ fontSize: 13, color: "#b45309" }}>
          You must fill all tiles (except the blank) before continuing.
        </p>
      )}

      {/* Popup selección 1–9 */}
      {activeIndex != null && (
        <div
          onClick={() => setActiveIndex(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 16,
              minWidth: 260,
              boxShadow: "0 20px 45px rgba(15,23,42,0.35)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 15 }}>Pick a number</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handlePickNumber(v)}
                  style={{
                    padding: "10px 0",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    background: "#f9fafb",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                marginTop: 4,
              }}
            >
              <button
                type="button"
                onClick={handleClear}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid #111827",
                  background: "#111827",
                  color: "#f9fafb",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
