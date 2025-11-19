// src/components/Puzzle/SlidingPuzzle.jsx
"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import styles from "./SlidingPuzzle.module.css";
import { mockPuzzleDataN3, mockPuzzleDataN4 } from "./puzzle-constants";
import {
  getNumbersGrid,
  canMove,
  swapTiles,
  calculateHorizontalCurrent,
  calculateVerticalCurrent,
  getExpectedValues,
} from "./puzzle-utils";
import { useKeyboardNavigation, useDragAndDrop } from "./puzzle-hooks";
import PuzzleHeader from "./PuzzleHeader";
import PuzzleTile from "./PuzzleTile";
import StaticGrid from "./StaticGrid";
import { fetchPuzzleDataFromBE } from "./puzzle-api";

// helper chiquito para comparar arrays
function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Props extra:
 * - mode: "daily" | "level"
 * - initialUiPuzzle: { N, numbers, operators, expected }
 * - puzzleId: number
 * - onSolved: (finalState) => void
 */
export default function SlidingPuzzle({
  initialN = 4,
  mode = "daily",
  initialUiPuzzle = null,
  puzzleId = null,
  onSolved = null,
}) {
  const [N, setN] = useState(
    initialUiPuzzle && initialUiPuzzle.N ? initialUiPuzzle.N : initialN
  );
  const [puzzle, setPuzzle] = useState(
    initialUiPuzzle || (initialN === 3 ? mockPuzzleDataN3 : mockPuzzleDataN4)
  );
  const [draggedTile, setDraggedTile] = useState(null);
  const [movesCount, setMovesCount] = useState(0);

  const puzzleRef = useRef(null);

  // wrapper para incrementar movimientos cuando cambian los numbers
  const setPuzzleWithMoves = useCallback((updater) => {
    setPuzzle((prev) => {
      const prevNumbers = prev?.numbers;
      const next =
        typeof updater === "function" ? updater(prev) : updater || prev;

      if (
        next &&
        Array.isArray(prevNumbers) &&
        Array.isArray(next.numbers) &&
        !arraysEqual(prevNumbers, next.numbers)
      ) {
        setMovesCount((m) => m + 1);
      }

      return next;
    });
  }, []);

  // Carga del puzzle:
  // - Si `mode === "level"` y hay `initialUiPuzzle`, no llamamos al daily.
  // - Si no, dejamos el comportamiento original del daily.
  useEffect(() => {
    if (mode === "level" && initialUiPuzzle) {
      setN(initialUiPuzzle.N);
      setPuzzle(initialUiPuzzle);
      setMovesCount(0);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const uiPuzzle = await fetchPuzzleDataFromBE();
        if (!cancelled) {
          setN(uiPuzzle.N);
          setPuzzle(uiPuzzle);
          setMovesCount(0);

          console.table(
            performance.getEntriesByType("measure").map((m) => ({
              name: m.name,
              ms: Math.round(m.duration),
            }))
          );
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, initialUiPuzzle]);

  // Handle tile click
  const handleTileClick = useCallback(
    (row, col) => {
      const numbersGrid = getNumbersGrid(puzzle.numbers, N);
      if (
        numbersGrid[row][col] === null ||
        !canMove(row, col, puzzle.numbers, N)
      ) {
        return;
      }

      const emptyPos = puzzle.numbers.indexOf(null);
      const emptyRow = Math.floor(emptyPos / N);
      const emptyCol = emptyPos % N;

      const newNumbers = swapTiles(
        puzzle.numbers,
        row,
        col,
        emptyRow,
        emptyCol,
        N
      );

      const nextPuzzle = { ...puzzle, numbers: newNumbers };
      // este wrapper incrementa movesCount si cambian los numbers
      setPuzzleWithMoves(nextPuzzle);

      // chequeo de "resuelto": comparamos current vs expected
      if (onSolved && puzzle.expected) {
        const nextHorizontal = calculateHorizontalCurrent(
          newNumbers,
          puzzle.operators,
          N
        );
        const nextVertical = calculateVerticalCurrent(
          newNumbers,
          puzzle.operators,
          N
        );
        const { vertical: verticalExpected, horizontal: horizontalExpected } =
          getExpectedValues(puzzle.expected, N);

        const okRows = arraysEqual(nextHorizontal, horizontalExpected);
        const okCols = arraysEqual(nextVertical, verticalExpected);

        if (okRows && okCols) {
          const finalNumbers = newNumbers.filter((n) => n != null);
          const finalMoves = movesCount + 1; // este movimiento aún no estaba contado

          onSolved({
            numbers: finalNumbers,
            movementsCount: finalMoves,
            puzzleId,
          });
        }
      }
    },
    [puzzle, N, onSolved, puzzleId, setPuzzleWithMoves, movesCount]
  );

  // Handle puzzle size change (solo tiene sentido en modo daily)
  const handleNChange = async (newN) => {
    if (mode === "level") {
      // En levels dejamos fijo el tamaño; ignoramos cambios
      return;
    }

    try {
      const newPuzzle = await fetchPuzzleDataFromBE(newN);
      setN(newPuzzle.N);
      setPuzzle(newPuzzle);
      setMovesCount(0);
    } catch (e) {
      console.error("Failed to change size:", e);
      const fallback = newN === 3 ? mockPuzzleDataN3 : mockPuzzleDataN4;
      setN(newN);
      setPuzzle(fallback);
      setMovesCount(0);
    }
  };

  // Hooks personalizados: usan el wrapper para contar movimientos
  useKeyboardNavigation(puzzle, setPuzzleWithMoves, puzzleRef);
  const dragHandlers = useDragAndDrop(
    puzzle,
    setPuzzleWithMoves,
    draggedTile,
    setDraggedTile
  );

  const numbersGrid = getNumbersGrid(puzzle.numbers, N);

  const horizontalCurrent = calculateHorizontalCurrent(
    puzzle.numbers,
    puzzle.operators,
    N
  );
  const verticalCurrent = calculateVerticalCurrent(
    puzzle.numbers,
    puzzle.operators,
    N
  );

  const { vertical: verticalExpected, horizontal: horizontalExpected } =
    getExpectedValues(puzzle.expected, N);

  return (
    <div className={`${styles.puzzleContainer} ${styles.puzzlePageContainer}`}>
      <PuzzleHeader N={N} onNChange={handleNChange} />

      <div className={styles.unifiedZoomWrapper} data-size={N}>
        <div className={styles.puzzleLayout}>
          {/* Top section: Puzzle + Vertical grids */}
          <div className={styles.topSection}>
            <div className={styles.puzzleAndHorizontalGrids}>
              <div
                ref={puzzleRef}
                className={styles.puzzleGridWrapper}
                data-size={N}
                tabIndex={0}
              >
                <div className={styles.puzzleGrid}>
                  {numbersGrid.map((row, rowIndex) =>
                    row.map((tile, colIndex) => (
                      <PuzzleTile
                        key={`tile-${rowIndex}-${colIndex}`}
                        tile={tile}
                        rowIndex={rowIndex}
                        colIndex={colIndex}
                        N={N}
                        operators={puzzle.operators}
                        isMovable={canMove(
                          rowIndex,
                          colIndex,
                          puzzle.numbers,
                          N
                        )}
                        isDragging={
                          draggedTile?.row === rowIndex &&
                          draggedTile?.col === colIndex
                        }
                        onTileClick={handleTileClick}
                        onDragStart={dragHandlers.handleDragStart}
                        onDragEnd={dragHandlers.handleDragEnd}
                        onDragOver={dragHandlers.handleDragOver}
                        onDrop={dragHandlers.handleDrop}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Horizontal grids below puzzle - shows vertical (column) calculations */}
              <div className={styles.horizontalGridsContainer}>
                <StaticGrid
                  numbers={verticalCurrent}
                  label="Current"
                  orientation="horizontal"
                />
                <StaticGrid
                  numbers={horizontalExpected}
                  label="Expected"
                  orientation="horizontal"
                />
              </div>
            </div>

            {/* Vertical grids to the right - shows horizontal (row) calculations */}
            <div className={styles.verticalGridsContainer}>
              <StaticGrid
                numbers={horizontalCurrent}
                label="Current"
                orientation="vertical"
              />
              <StaticGrid
                numbers={verticalExpected}
                label="Expected"
                orientation="vertical"
              />
            </div>
          </div>

          {/* Botón de test: usa el conteo real de movimientos */}
          {onSolved && (
            <button
              type="button"
              onClick={() => {
                const finalNumbers = (puzzle.numbers || []).filter(
                  (n) => n != null
                );
                onSolved({
                  numbers: finalNumbers,
                  movementsCount: movesCount,
                  puzzleId,
                });
              }}
              style={{
                marginTop: 12,
                alignSelf: "center",
                padding: "6px 14px",
                borderRadius: 999,
                border: "1px solid #d1d5db",
                background: "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Test submit solve ({movesCount} moves)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
