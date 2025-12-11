// src/components/TutorialBoard.jsx
"use client";

import styles from "./Puzzle/SlidingPuzzle.module.css";
import tutorialStyles from "./TutorialBoard.module.css";
import PuzzleTile from "./Puzzle/PuzzleTile";
import StaticGrid from "./Puzzle/StaticGrid";
import { mockPuzzleDataN3 } from "./Puzzle/puzzle-constants";
import { 
  getNumbersGrid, 
  calculateHorizontalCurrent,
  calculateVerticalCurrent,
  getExpectedValues 
} from "./Puzzle/puzzle-utils";

export default function TutorialBoard() {
  const puzzle = mockPuzzleDataN3;
  const N = puzzle.N;

  // Convert to 2D grid
  const numbersGrid = getNumbersGrid(puzzle.numbers, N);

  // Calculate current values (based on current tile positions)
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

  // Get expected values
  const { vertical: verticalExpected, horizontal: horizontalExpected } =
    getExpectedValues(puzzle.expected, N);

  // Dummy handlers (static display, no interaction)
  const noop = () => {};

  return (
    <div className={tutorialStyles.tutorialBoardWrapper}>
      <div className={tutorialStyles.scaledBoard}>
        <div className={styles.puzzleLayout}>
          {/* Top section: Puzzle + Vertical grids */}
          <div className={styles.topSection}>
            <div className={styles.puzzleAndHorizontalGrids}>
              <div className={styles.puzzleGridWrapper} data-size={N}>
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
                        isMovable={false}
                        isDragging={false}
                        onTileClick={noop}
                        onDragStart={noop}
                        onDragEnd={noop}
                        onDragOver={noop}
                        onDrop={noop}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Horizontal grids below puzzle - shows column calculations */}
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

            {/* Vertical grids to the right - shows row calculations */}
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
        </div>
      </div>

      <p className={tutorialStyles.caption}>
        Match "Current" values to "Expected" by sliding tiles
      </p>
    </div>
  );
}
