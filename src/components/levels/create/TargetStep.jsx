// src/components/levels/create/TargetStep.jsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  getNumbersGrid,
  findEmptyPosition,
  canMove,
  swapTiles,
  calculateHorizontalCurrent,
  calculateVerticalCurrent,
} from "@/components/Puzzle/puzzle-utils";
import StaticGrid from "@/components/Puzzle/StaticGrid";
import puzzleStyles from "@/components/Puzzle/SlidingPuzzle.module.css";
import { MOVABLE_TILE_BORDER_COLOR } from "@/components/Puzzle/puzzle-constants";

export default function TargetStep({
  size,
  numbers,                 // estado inicial (step 2)
  targetNumbers,         
  onTargetNumbersChange,    
  operators,
  expected,
  onExpectedChange,
  onPrev,
  onNext,
}) {
  // Estado interno que se sincroniza con targetNumbers o numbers
  const [boardNumbers, setBoardNumbers] = useState(() =>
    targetNumbers && targetNumbers.length === numbers.length
      ? targetNumbers.slice()
      : numbers.slice()
  );

  // Si cambian numbers o targetNumbers desde fuera, actualizamos
  useEffect(() => {
    if (targetNumbers && targetNumbers.length === numbers.length) {
      setBoardNumbers(targetNumbers.slice());
    } else {
      setBoardNumbers(numbers.slice());
    }
  }, [numbers, targetNumbers, size]);

  const grid = useMemo(
    () => getNumbersGrid(boardNumbers, size),
    [boardNumbers, size]
  );

  const horizontalCurrent = useMemo(
    () => calculateHorizontalCurrent(boardNumbers, operators, size),
    [boardNumbers, operators, size]
  );

  const verticalCurrent = useMemo(
    () => calculateVerticalCurrent(boardNumbers, operators, size),
    [boardNumbers, operators, size]
  );

  // ¿La casilla vacía está abajo a la derecha?
  const blankBottomRight = useMemo(() => {
    const emptyIndex = boardNumbers.indexOf(null);
    const lastIndex = size * size - 1;
    return emptyIndex === lastIndex;
  }, [boardNumbers, size]);

  const updateBoard = (next) => {
    setBoardNumbers(next);
    if (onTargetNumbersChange) {
      onTargetNumbersChange(next); // guardamos en LevelCreateClient
    }
  };

  const handleTileClick = (row, col) => {
    const gridNums = getNumbersGrid(boardNumbers, size);
    if (gridNums[row][col] === null) return;
    if (!canMove(row, col, boardNumbers, size)) return;

    const emptyPos = findEmptyPosition(boardNumbers, size);
    if (!emptyPos) return;

    const newNumbers = swapTiles(
      boardNumbers,
      row,
      col,
      emptyPos.row,
      emptyPos.col,
      size
    );
    updateBoard(newNumbers);
  };

  const randomizeBoard = () => {
    // muchos movimientos aleatorios válidos
    let temp = boardNumbers.slice();
    for (let i = 0; i < size * size * 3; i++) {
      const emptyPos = findEmptyPosition(temp, size);
      if (!emptyPos) break;
      const { row, col } = emptyPos;

      const candidates = [
        { r: row - 1, c: col },
        { r: row + 1, c: col },
        { r: row, c: col - 1 },
        { r: row, c: col + 1 },
      ].filter(
        (p) =>
          p.r >= 0 &&
          p.r < size &&
          p.c >= 0 &&
          p.c < size &&
          canMove(p.r, p.c, temp, size)
      );

      if (candidates.length === 0) break;
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      temp = swapTiles(temp, chosen.r, chosen.c, row, col, size);
    }

    // Garantizar que el null quede abajo a la derecha (último índice)
    const lastIndex = size * size - 1;
    const emptyIndex = temp.indexOf(null);
    if (emptyIndex !== -1 && emptyIndex !== lastIndex) {
      const tmpVal = temp[lastIndex];
      temp[lastIndex] = null;
      temp[emptyIndex] = tmpVal;
    }

    updateBoard(temp);
  };

  const handleSetTarget = () => {
    // Seguridad extra: no hacer nada si el blank NO está abajo a la derecha
    if (!blankBottomRight) return;

    // nos aseguramos de que el padre tenga el layout final
    if (onTargetNumbersChange) {
      onTargetNumbersChange(boardNumbers);
    }

    const horiz = calculateHorizontalCurrent(boardNumbers, operators, size);
    const vert = calculateVerticalCurrent(boardNumbers, operators, size);

    // mismo formato que espera getExpectedValues: [horizontal..., vertical...]
    const nextExpected = [...horiz, ...vert];
    onExpectedChange(nextExpected);
    onNext();
  };

  const expectedSet =
    Array.isArray(expected) &&
    expected.length === 2 * size &&
    expected.every((v) => typeof v === "number");

  const canSetTarget = blankBottomRight;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ 
        fontSize: 18, 
        fontWeight: 700,
        color: "var(--text-primary)",
        background: "var(--bg-secondary)",
        padding: "10px 16px",
        borderRadius: 12,
        border: "1px solid var(--border-color)",
        margin: 0,
        width: "fit-content",
      }}>4. Target sums</h2>
      <p style={{ 
        fontSize: 14, 
        color: "var(--text-primary)", 
        background: "var(--bg-secondary)",
        padding: "10px 16px",
        borderRadius: 12,
        border: "1px solid var(--border-color)",
        margin: 0,
        width: "fit-content",
      }}>
        Use the same sliding mechanics as the game to arrange the board. When
        you&apos;re happy, click &ldquo;Set as target&rdquo; to freeze the row
        and column results. The empty tile must be in the bottom-right corner.
      </p>

      {/* 🔹 Mismo layout del puzzle de juego */}
      <div className={puzzleStyles.unifiedZoomWrapper} data-size={size}>
        <div className={puzzleStyles.puzzleLayout}>
          <div className={puzzleStyles.topSection}>
            {/* Tablero + resultados de columnas debajo */}
            <div className={puzzleStyles.puzzleAndHorizontalGrids}>
              <div
                className={puzzleStyles.puzzleGridWrapper}
                data-size={size}
                tabIndex={0}
              >
                <div className={puzzleStyles.puzzleGrid}>
                  {grid.map((row, rowIndex) =>
                    row.map((value, colIndex) => {
                      const isMovable =
                        value !== null &&
                        canMove(rowIndex, colIndex, boardNumbers, size);

                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          type="button"
                          onClick={() => handleTileClick(rowIndex, colIndex)}
                          className={`${puzzleStyles.tile} ${
                            value === null ? puzzleStyles.emptyTile : ""
                          } ${isMovable ? puzzleStyles.movableTile : ""}`}
                          style={
                            isMovable && value !== null
                              ? {
                                  "--movable-border-color":
                                    MOVABLE_TILE_BORDER_COLOR,
                                }
                              : undefined
                          }
                        >
                          {value !== null && (
                            <span className={puzzleStyles.tileNumber}>
                              {value}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Current column results (igual que en juego: abajo del board) */}
              <div className={puzzleStyles.horizontalGridsContainer}>
                <StaticGrid
                  numbers={verticalCurrent}
                  label="Current"
                  orientation="horizontal"
                />
              </div>
            </div>

            {/* Current row results (a la derecha del board) */}
            <div className={puzzleStyles.verticalGridsContainer}>
              <StaticGrid
                numbers={horizontalCurrent}
                label="Current"
                orientation="vertical"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botones acción */}
      <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
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
          onClick={randomizeBoard}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "1px solid #0ea5e9",
            background: "#e0f2fe",
            color: "#0f172a",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Randomize board
        </button>

        <button
          type="button"
          onClick={handleSetTarget}
          disabled={!canSetTarget}
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            border: "1px solid #111827",
            background: canSetTarget ? "#111827" : "#9ca3af",
            color: "#f9fafb",
            fontSize: 14,
            fontWeight: 600,
            cursor: canSetTarget ? "pointer" : "not-allowed",
          }}
        >
          Set as target &amp; continue →
        </button>
      </div>

      {!canSetTarget && (
        <p style={{ fontSize: 13, color: "#b45309" }}>
          To continue, move the empty tile to the bottom-right corner.
        </p>
      )}

      {expectedSet && (
        <p style={{ fontSize: 13, color: "#16a34a" }}>
          Target sums already set. You can adjust the board and set again if you
          want.
        </p>
      )}
    </section>
  );
}
