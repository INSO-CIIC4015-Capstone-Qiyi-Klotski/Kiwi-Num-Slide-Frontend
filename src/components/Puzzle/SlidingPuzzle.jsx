"use client";
import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './SlidingPuzzle.module.css';
import { 
  mockPuzzleDataN3, 
  mockPuzzleDataN4
} from './puzzle-constants';
import { 
  getNumbersGrid, 
  canMove, 
  swapTiles,
  calculateHorizontalCurrent,
  calculateVerticalCurrent,
  getExpectedValues
} from './puzzle-utils';
import { useKeyboardNavigation, useDragAndDrop } from './puzzle-hooks';
import PuzzleHeader from './PuzzleHeader';
import PuzzleTile from './PuzzleTile';
import StaticGrid from './StaticGrid';
import { fetchPuzzleDataFromBE } from './puzzle-api';

export default function SlidingPuzzle({ initialN = 4 }) {
  const [N, setN] = useState(initialN);
  const [puzzle, setPuzzle] = useState(
    initialN === 3 ? mockPuzzleDataN3 : mockPuzzleDataN4
  );
  const [draggedTile, setDraggedTile] = useState(null);
  const puzzleRef = useRef(null);

  useEffect(() => {
  let cancelled = false;
  (async () => {
    try {
      const uiPuzzle = await fetchPuzzleDataFromBE();
      if (!cancelled) {
        setN(uiPuzzle.N);
        setPuzzle(uiPuzzle);
        
        // Lee resultados en consola (Chrome → Performance panel también los lista)
        console.table(performance.getEntriesByType('measure').map(m => ({
          name: m.name, ms: Math.round(m.duration)
        })));
      }
    } catch (e) {
      console.error(e);
    }
  })();
  return () => { cancelled = true; };
}, []);

  // Handle tile click
  const handleTileClick = useCallback((row, col) => {
    const numbersGrid = getNumbersGrid(puzzle.numbers, N);
    if (numbersGrid[row][col] === null || !canMove(row, col, puzzle.numbers, N)) {
      return;
    }

    const emptyPos = puzzle.numbers.indexOf(null);
    const emptyRow = Math.floor(emptyPos / N);
    const emptyCol = emptyPos % N;

    const newNumbers = swapTiles(puzzle.numbers, row, col, emptyRow, emptyCol, N);
    setPuzzle({ ...puzzle, numbers: newNumbers });
  }, [puzzle, N]);

  // Handle puzzle size change
  const handleNChange = async (newN) => {
    try {
      const newPuzzle = await fetchPuzzleDataFromBE(newN);
      setN(newPuzzle.N);
      setPuzzle(newPuzzle);
    } catch (e) {
      console.error("Failed to change size:", e);
      const fallback = newN === 3 ? mockPuzzleDataN3 : mockPuzzleDataN4;
      setN(newN);
      setPuzzle(fallback);
    }
  };

  // Use custom hooks
  useKeyboardNavigation(puzzle, setPuzzle, puzzleRef);
  const dragHandlers = useDragAndDrop(puzzle, setPuzzle, draggedTile, setDraggedTile);

  const numbersGrid = getNumbersGrid(puzzle.numbers, N);
  // Calculate current values based on puzzle state
  // Note: horizontal calculations (rows) display on vertical grid (right side)
  //       vertical calculations (columns) display on horizontal grid (below)
  const horizontalCurrent = calculateHorizontalCurrent(puzzle.numbers, puzzle.operators, N);
  const verticalCurrent = calculateVerticalCurrent(puzzle.numbers, puzzle.operators, N);
  
  // Extract expected values from puzzle data
  // Expected format: [row0, row1, row2, row3, col0, col1, col2, col3]
  // First N are for vertical grid (right) - these are the row results
  // Last N are for horizontal grid (below) - these are the column results
  const { vertical: verticalExpected, horizontal: horizontalExpected } = getExpectedValues(puzzle.expected, N);

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
                        isMovable={canMove(rowIndex, colIndex, puzzle.numbers, N)}
                        isDragging={
                          draggedTile?.row === rowIndex && draggedTile?.col === colIndex
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
        </div>
      </div>
    </div>
  );
}