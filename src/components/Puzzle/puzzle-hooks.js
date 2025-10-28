import { useCallback, useEffect } from 'react';
import { findEmptyPosition, swapTiles, canMove, getNumbersGrid } from './puzzle-utils';

/**
 * Hook for handling keyboard navigation
 */
export const useKeyboardNavigation = (
  puzzle,
  setPuzzle,    
  puzzleRef
) => {
  const handleKeyDown = useCallback((e) => {
    const { N, numbers } = puzzle;
    
    // Prevent default behavior for arrow keys to stop page scrolling (To allow Puzzle interaction instead)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }

    const emptyPos = findEmptyPosition(numbers, N);
    if (!emptyPos) return;

    const { row: emptyRow, col: emptyCol } = emptyPos;
    let targetRow = emptyRow;
    let targetCol = emptyCol;

    switch (e.key) {
      case 'ArrowUp':
        if (emptyRow < N - 1) {
          targetRow = emptyRow + 1;
          targetCol = emptyCol;
        }
        break;
      case 'ArrowDown':
        if (emptyRow > 0) {
          targetRow = emptyRow - 1;
          targetCol = emptyCol;
        }
        break;
      case 'ArrowLeft':
        if (emptyCol < N - 1) {
          targetRow = emptyRow;
          targetCol = emptyCol + 1;
        }
        break;
      case 'ArrowRight':
        if (emptyCol > 0) {
          targetRow = emptyRow;
          targetCol = emptyCol - 1;
        }
        break;
      default:
        return;
    }

    if (targetRow !== emptyRow || targetCol !== emptyCol) {
      if (targetRow >= 0 && targetRow < N && targetCol >= 0 && targetCol < N) {
        const newNumbers = swapTiles(numbers, targetRow, targetCol, emptyRow, emptyCol, N);
        setPuzzle({ ...puzzle, numbers: newNumbers });
      }
    }
  }, [puzzle, setPuzzle]);

  useEffect(() => {
    const puzzleElement = puzzleRef.current;
    if (puzzleElement) {
      puzzleElement.addEventListener('keydown', handleKeyDown);
      puzzleElement.setAttribute('tabindex', '0');
      
      // Auto-focus the puzzle grid on mount
      puzzleElement.focus();
      
      return () => {
        puzzleElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, puzzleRef]);
};

/**
 * Hook for handling drag and drop
 */
export const useDragAndDrop = (
  puzzle,
  setPuzzle,
  draggedTile,
  setDraggedTile
) => {
  const { N, numbers } = puzzle;

  const handleDragStart = useCallback((e, row, col) => {
    const numbersGrid = getNumbersGrid(numbers, N);
    if (numbersGrid[row][col] === null || !canMove(row, col, numbers, N)) {
      e.preventDefault();
      return;
    }
    
    setDraggedTile({ row, col });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${row}-${col}`);
  }, [numbers, N, setDraggedTile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, targetRow, targetCol) => {
    e.preventDefault();
    
    const numbersGrid = getNumbersGrid(numbers, N);
    if (numbersGrid[targetRow][targetCol] !== null) {
      return;
    }

    const draggedData = e.dataTransfer.getData('text/plain');
    if (!draggedData) return;

    const [sourceRow, sourceCol] = draggedData.split('-').map(Number);
    
    if (canMove(sourceRow, sourceCol, numbers, N)) {
      const newNumbers = swapTiles(numbers, sourceRow, sourceCol, targetRow, targetCol, N);
      setPuzzle({ ...puzzle, numbers: newNumbers });
    }
    
    setDraggedTile(null);
  }, [puzzle, numbers, N, setPuzzle, setDraggedTile]);

  const handleDragEnd = useCallback(() => {
    setDraggedTile(null);
  }, [setDraggedTile]);

  return {
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };
};