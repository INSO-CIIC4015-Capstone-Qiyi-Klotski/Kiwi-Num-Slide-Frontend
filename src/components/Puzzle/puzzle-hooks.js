import { useCallback, useEffect, useState } from 'react';
import { findEmptyPosition, swapTiles, canMove, getNumbersGrid } from './puzzle-utils';
import { loadSettings, onSettingsChange, DEFAULT_KEY_BINDINGS } from '@/lib/settings-store';

/**
 * Hook for handling keyboard navigation with custom key bindings
 */
export const useKeyboardNavigation = (
  puzzle,
  setPuzzle,    
  puzzleRef
) => {
  const [keyBindings, setKeyBindings] = useState(DEFAULT_KEY_BINDINGS);

  // Load key bindings on mount and listen for changes
  useEffect(() => {
    const settings = loadSettings();
    setKeyBindings(settings.keyBindings);

    const unsubscribe = onSettingsChange((newSettings) => {
      setKeyBindings(newSettings.keyBindings);
    });

    return () => unsubscribe();
  }, []);

  const handleKeyDown = useCallback((e) => {
    const { N, numbers } = puzzle;
    
    // Get the action for this key
    const boundKeys = Object.values(keyBindings);
    
    // Prevent default behavior for bound keys to stop page scrolling
    if (boundKeys.includes(e.key)) {
      e.preventDefault();
    }

    const emptyPos = findEmptyPosition(numbers, N);
    if (!emptyPos) return;

    const { row: emptyRow, col: emptyCol } = emptyPos;
    let targetRow = emptyRow;
    let targetCol = emptyCol;

    // Check which action this key maps to
    if (e.key === keyBindings.moveUp) {
      if (emptyRow < N - 1) {
        targetRow = emptyRow + 1;
        targetCol = emptyCol;
      }
    } else if (e.key === keyBindings.moveDown) {
      if (emptyRow > 0) {
        targetRow = emptyRow - 1;
        targetCol = emptyCol;
      }
    } else if (e.key === keyBindings.moveLeft) {
      if (emptyCol < N - 1) {
        targetRow = emptyRow;
        targetCol = emptyCol + 1;
      }
    } else if (e.key === keyBindings.moveRight) {
      if (emptyCol > 0) {
        targetRow = emptyRow;
        targetCol = emptyCol - 1;
      }
    } else {
      return;
    }

    if (targetRow !== emptyRow || targetCol !== emptyCol) {
      if (targetRow >= 0 && targetRow < N && targetCol >= 0 && targetCol < N) {
        const newNumbers = swapTiles(numbers, targetRow, targetCol, emptyRow, emptyCol, N);
        setPuzzle({ ...puzzle, numbers: newNumbers });
      }
    }
  }, [puzzle, setPuzzle, keyBindings]);

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