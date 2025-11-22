// src/components/levels/create/SummaryStep.jsx
"use client";

import Link from "next/link";
import StaticGrid from "@/components/Puzzle/StaticGrid";
import {
  getNumbersGrid,
  getExpectedValues,
  shouldShowHorizontalOp,
  shouldShowVerticalOp,
  getOperatorIndex,
} from "@/components/Puzzle/puzzle-utils";
import puzzleStyles from "@/components/Puzzle/SlidingPuzzle.module.css";

export default function SummaryStep({
  size,
  numbers,          // estado inicial
  targetNumbers,   
  operators,
  expected,
  title,
  difficulty,
  onTitleChange,
  onDifficultyChange,
  onPrev,
  onSubmit,
  canSubmit,
  submitting,
  submitError,
  createdLevelId,
}) {
  const initialGrid = getNumbersGrid(numbers, size);

  // si tenemos un layout de target, úsalo; si no, usa el inicial
  const targetGrid =
    targetNumbers && targetNumbers.length === numbers.length
      ? getNumbersGrid(targetNumbers, size)
      : initialGrid;

  const expectedValid =
    Array.isArray(expected) &&
    expected.length === 2 * size &&
    expected.every((v) => typeof v === "number");

  let verticalExpected = [];
  let horizontalExpected = [];

  if (expectedValid) {
    const { vertical, horizontal } = getExpectedValues(expected, size);
    verticalExpected = vertical;
    horizontalExpected = horizontal;
  }

  const filledOperatorsCount = Array.isArray(operators)
    ? operators.filter((op) => op != null).length
    : 0;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>5. Summary &amp; publish</h2>
      <p style={{ fontSize: 14, color: "#4b5563" }}>
        Review your level and give it a name. When you&apos;re ready, create
        the level.
      </p>

      {/* Título y dificultad */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 480,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={`Custom level (${size}×${size})`}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 14,
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Difficulty (1–5)
          </span>
          <select
            value={difficulty}
            onChange={(e) =>
              onDifficultyChange(parseInt(e.target.value, 10) || 1)
            }
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 14,
              maxWidth: 120,
            }}
          >
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Vista rápida del board y expected */}
      <div
        style={{
          display: "flex",
          gap: 32,
          flexWrap: "wrap",
          alignItems: "flex-start",
          marginTop: 8,
        }}
      >
        {/* Estado inicial (mini grid) */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Initial state
          </div>
          <div className={puzzleStyles.unifiedZoomWrapper} data-size={size}>
            <div className={puzzleStyles.puzzleLayout}>
              <div className={puzzleStyles.topSection}>
                <div className={puzzleStyles.puzzleAndHorizontalGrids}>
                  <div className={puzzleStyles.puzzleGridWrapper} data-size={size}>
                    <div className={puzzleStyles.puzzleGrid}>
                      {initialGrid.map((row, rowIndex) =>
                        row.map((value, colIndex) => (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={puzzleStyles.tile}
                          >
                            {value !== null && (
                              <span className={puzzleStyles.tileNumber}>{value}</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Puzzle final con expected y operadores */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Expected results</div>

          {expectedValid ? (
            <div className={puzzleStyles.unifiedZoomWrapper} data-size={size}>
              <div className={puzzleStyles.puzzleLayout}>
                <div className={puzzleStyles.topSection}>
                  {/* Board + expected columnas debajo */}
                  <div className={puzzleStyles.puzzleAndHorizontalGrids}>
                    <div
                      className={puzzleStyles.puzzleGridWrapper}
                      data-size={size}
                    >
                      <div className={puzzleStyles.puzzleGrid}>
                        {targetGrid.map((row, rowIndex) =>
                          row.map((value, colIndex) => {
                            const cellKey = `${rowIndex}-${colIndex}`;
                            return (
                              <div
                                key={cellKey}
                                className={puzzleStyles.tile}
                              >
                                {value !== null && (
                                  <span className={puzzleStyles.tileNumber}>
                                    {value}
                                  </span>
                                )}

                                {/* Operador horizontal (derecha) */}
                                {shouldShowHorizontalOp(
                                  rowIndex,
                                  colIndex,
                                  size
                                ) && (
                                  <div className={puzzleStyles.horizontalOp}>
                                    <span className={puzzleStyles.opSymbol}>
                                      {operators[
                                        getOperatorIndex(
                                          rowIndex,
                                          colIndex,
                                          true,
                                          size
                                        )
                                      ] || ""}
                                    </span>
                                  </div>
                                )}

                                {/* Operador vertical (abajo) */}
                                {shouldShowVerticalOp(
                                  rowIndex,
                                  colIndex,
                                  size
                                ) && (
                                  <div className={puzzleStyles.verticalOp}>
                                    <span className={puzzleStyles.opSymbol}>
                                      {operators[
                                        getOperatorIndex(
                                          rowIndex,
                                          colIndex,
                                          false,
                                          size
                                        )
                                      ] || ""}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Expected columnas debajo del board */}
                    <div className={puzzleStyles.horizontalGridsContainer}>
                      <StaticGrid
                        numbers={horizontalExpected}
                        label="Cols"
                        orientation="horizontal"
                      />
                    </div>
                  </div>

                  {/* Expected filas a la derecha del board */}
                  <div className={puzzleStyles.verticalGridsContainer}>
                    <StaticGrid
                      numbers={verticalExpected}
                      label="Rows"
                      orientation="vertical"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#b45309" }}>
              Target sums are not fully set. Go back and set them before
              publishing.
            </p>
          )}

          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Operators: {filledOperatorsCount} slots filled.
          </div>
        </div>
      </div>

      {/* Navegación y submit */}
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
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
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            border: "1px solid #111827",
            background:
              !canSubmit || submitting ? "#9ca3af" : "#111827",
            color: "#f9fafb",
            fontSize: 14,
            fontWeight: 600,
            cursor:
              !canSubmit || submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Creating level..." : "Create level"}
        </button>

        {createdLevelId && (
          <Link
            href={`/levels/${createdLevelId}`}
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              border: "1px solid #16a34a",
              background: "#ecfdf3",
              color: "#166534",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            View level →
          </Link>
        )}
      </div>

      {submitError && (
        <p style={{ fontSize: 13, color: "#b91c1c" }}>{submitError}</p>
      )}

      {!canSubmit && !submitError && (
        <p style={{ fontSize: 12, color: "#6b7280" }}>
          Make sure: size is set, all numbers and operators are filled, and
          target sums are defined.
        </p>
      )}
    </section>
  );
}
