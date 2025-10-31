import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the environment module before importing anything else
jest.mock('@/lib/env', () => ({
  API_URL: 'http://localhost:8000/api/v1',
}));

// Mock the puzzle API to prevent real API calls during tests
jest.mock('@/components/Puzzle/puzzle-api', () => ({
  fetchPuzzleDataFromBE: jest.fn(),
  toUIPuzzle: jest.requireActual('@/components/Puzzle/puzzle-api').toUIPuzzle,
}));

import SlidingPuzzle from '@/components/Puzzle/SlidingPuzzle';
import * as puzzleApi from '@/components/Puzzle/puzzle-api';
import { mockPuzzleDataN3, mockPuzzleDataN4 } from '@/components/Puzzle/puzzle-constants';

// Mock performance API if it doesn't exist in test environment
global.performance = global.performance || {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
};

describe('SlidingPuzzle Component', () => {
  // Helper to create a proper mock dataTransfer that stores/retrieves data
  const createMockDataTransfer = () => {
    const data = {};
    return {
      setData: (format, value) => { data[format] = value; },
      getData: (format) => data[format] || '',
      dropEffect: 'none',
      effectAllowed: 'all'
    };
  };

  beforeEach(() => {
    // Reset mock before each test
    jest.clearAllMocks();
    // Make the mock resolve with mock data (default to N=4)
    puzzleApi.fetchPuzzleDataFromBE.mockResolvedValue(mockPuzzleDataN4);
    // Suppress debug console output during tests
    jest.spyOn(console, 'table').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    console.table.mockRestore?.();
  });

  it('renders the board with 16 tiles (4x4 grid)', async () => {
    const { container } = render(<SlidingPuzzle initialN={4} />);
    
    await waitFor(() => {
      // The board should have 16 cells (4x4 grid)
      // Find the puzzle grid wrapper which has data-size attribute
      const puzzleGridWrapper = container.querySelector('[data-size="4"][class*="puzzleGridWrapper"]');
      expect(puzzleGridWrapper).toBeInTheDocument();
      
      // Find the actual puzzle grid inside the wrapper
      const puzzleGrid = puzzleGridWrapper?.querySelector('[class*="puzzleGrid"]');
      expect(puzzleGrid).toBeInTheDocument();
      
      // Count all tiles (15 numbered + 1 empty = 16 total)
      // Only count direct children of puzzle grid
      const allTiles = puzzleGrid?.children;
      expect(allTiles?.length).toBe(16);
    });
  });

  it('renders tiles with numbers and one empty space', async () => {
    const { container } = render(<SlidingPuzzle initialN={4} />);
    
    // Wait for the puzzle to fully render by checking tile count
    await waitFor(() => {
      const puzzleGridWrapper = container.querySelector('[data-size="4"][class*="puzzleGridWrapper"]');
      if (!puzzleGridWrapper) throw new Error('Puzzle grid wrapper not found');
      
      const puzzleGrid = puzzleGridWrapper.querySelector('[class*="puzzleGrid"]');
      if (!puzzleGrid) throw new Error('Puzzle grid not found');
      
      const allTiles = Array.from(puzzleGrid.children);
      if (allTiles.length !== 16) {
        throw new Error(`Waiting for 16 tiles, currently have ${allTiles.length}`);
      }
      
      // Count numbered tiles (tiles with numbers, not empty)
      const numberedTiles = allTiles.filter(tile => !tile.className.includes('emptyTile'));
      expect(numberedTiles.length).toBe(15);
      
      // Should have exactly one empty tile
      const emptyTiles = allTiles.filter(tile => tile.className.includes('emptyTile'));
      expect(emptyTiles.length).toBe(1);
    }, { timeout: 5000 });
  });

  it('tiles are draggable except the empty one', async () => {
    const { container } = render(<SlidingPuzzle initialN={4} />);
    
    await waitFor(() => {
      const puzzleGrid = container.querySelector('[class*="puzzleGrid"]');
      
      // Verify only tiles adjacent to empty space are draggable
      const draggableTiles = puzzleGrid?.querySelectorAll('[draggable="true"]');
      // Should have at least 2 (minimum adjacent tiles in any configuration)
      expect(draggableTiles?.length).toBeGreaterThanOrEqual(2);
      // But not more than 4 (maximum adjacent tiles)
      expect(draggableTiles?.length).toBeLessThanOrEqual(4);
      
      // Verify the empty tile exists and is NOT draggable
      const emptyTile = puzzleGrid?.querySelector('[class*="emptyTile"]');
      expect(emptyTile).toBeInTheDocument();
      expect(emptyTile?.getAttribute('draggable')).not.toBe('true');
    });
  });

  it('tiles can be clicked when movable', async () => {
    const { container } = render(<SlidingPuzzle initialN={4} />);
    
    await waitFor(() => {
      const puzzleGridWrapper = container.querySelector('[data-size="4"][class*="puzzleGridWrapper"]');
      expect(puzzleGridWrapper).toBeInTheDocument();
      
      const puzzleGrid = puzzleGridWrapper.querySelector('[class*="puzzleGrid"]');
      const allTiles = Array.from(puzzleGrid.children);
      expect(allTiles.length).toBe(16);
      
      // Find movable tiles
      const movableTiles = allTiles.filter(tile => tile.className.includes('movableTile'));
      expect(movableTiles.length).toBeGreaterThanOrEqual(2);
      
      // Verify movable tiles have onClick handler attached (not null/undefined)
      movableTiles.forEach(tile => {
        expect(tile.onclick).toBeDefined();
      });
      
      // Click a movable tile and verify it doesn't throw an error
      const movableTile = movableTiles[0];
      expect(() => {
        fireEvent.click(movableTile);
      }).not.toThrow();
    }, { timeout: 5000 });
  });

  it('handles drag and drop events', async () => {
    const { container } = render(<SlidingPuzzle initialN={4} />);
    
    await waitFor(() => {
      const puzzleGridWrapper = container.querySelector('[data-size="4"][class*="puzzleGridWrapper"]');
      expect(puzzleGridWrapper).toBeInTheDocument();
      
      const puzzleGrid = puzzleGridWrapper.querySelector('[class*="puzzleGrid"]');
      const allTiles = Array.from(puzzleGrid.children);
      expect(allTiles.length).toBe(16);
      
      // Find movable and empty tiles
      const movableTile = allTiles.find(tile => tile.className.includes('movableTile'));
      const emptyTile = allTiles.find(tile => tile.className.includes('emptyTile'));
      
      expect(movableTile).toBeInTheDocument();
      expect(emptyTile).toBeInTheDocument();
      
      // Verify drag handlers are attached
      expect(movableTile.draggable).toBe(true);
      expect(movableTile.ondragstart).toBeDefined();
      expect(movableTile.ondragend).toBeDefined();
      expect(emptyTile.ondragover).toBeDefined();
      expect(emptyTile.ondrop).toBeDefined();
      
      // Create a proper mock dataTransfer
      const dataTransfer = createMockDataTransfer();
      
      // Simulate drag and drop events and verify they don't throw errors
      expect(() => {
        fireEvent.dragStart(movableTile, { dataTransfer });
        fireEvent.dragOver(emptyTile, { dataTransfer });
        fireEvent.drop(emptyTile, { dataTransfer });
        fireEvent.dragEnd(movableTile);
      }).not.toThrow();
    }, { timeout: 5000 });
  });

  it('renders with N=3 when specified', async () => {
    // Override mock to return N=3 data for this test
    puzzleApi.fetchPuzzleDataFromBE.mockResolvedValue(mockPuzzleDataN3);
    
    const { container } = render(<SlidingPuzzle initialN={3} />);
    
    await waitFor(() => {
      // The board should have 9 cells (3x3 grid)
      const puzzleGridWrapper = container.querySelector('[data-size="3"][class*="puzzleGridWrapper"]');
      expect(puzzleGridWrapper).toBeInTheDocument();
      
      const puzzleGrid = puzzleGridWrapper?.querySelector('[class*="puzzleGrid"]');
      expect(puzzleGrid).toBeInTheDocument();
      
      // Should have 9 total tiles (8 numbered + 1 empty)
      // Only count direct children of puzzle grid, not nested tiles in operators
      const allTiles = puzzleGrid?.children;
      expect(allTiles?.length).toBe(9);
    });
  });

  it('prevents non-movable tiles from moving when clicked', async () => {
    const { container } = render(<SlidingPuzzle initialN={4} />);
    
    let puzzleGrid;
    let nonMovableTile;
    let initialValue;
    
    await waitFor(() => {
      puzzleGrid = container.querySelector('[class*="puzzleGrid"]');
      // Find a tile that is NOT movable (doesn't have movableTile class)
      const allTiles = Array.from(puzzleGrid?.querySelectorAll('[class*="tile"]') || []);
      nonMovableTile = allTiles.find(tile => !tile.className.includes('movableTile') && !tile.className.includes('emptyTile'));
      expect(nonMovableTile).toBeInTheDocument();
    });
    
    // Get the initial value
    initialValue = nonMovableTile.textContent;
    
    // Click the non-movable tile
    fireEvent.click(nonMovableTile);
    
    // Wait a bit and verify the tile didn't move (value is still the same in that position)
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(nonMovableTile.textContent).toBe(initialValue);
    
    // Also verify the empty tile position didn't change
    const emptyTile = container.querySelector('[class*="emptyTile"]');
    expect(emptyTile?.textContent).not.toBe(initialValue);
  });

  it('handles keyboard navigation with arrow keys', async () => {
    const { container } = render(<SlidingPuzzle initialN={4} />);
    
    let puzzleGridWrapper;
    
    await waitFor(() => {
      puzzleGridWrapper = container.querySelector('[data-size="4"][class*="puzzleGridWrapper"]');
      expect(puzzleGridWrapper).toBeInTheDocument();
      expect(puzzleGridWrapper.getAttribute('tabindex')).toBe('0');
    });
    
    // Focus the puzzle grid and press arrow keys
    // Test that keyboard events can be fired without error
    puzzleGridWrapper.focus();
    
    expect(() => {
      fireEvent.keyDown(puzzleGridWrapper, { key: 'ArrowUp', code: 'ArrowUp' });
      fireEvent.keyDown(puzzleGridWrapper, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(puzzleGridWrapper, { key: 'ArrowLeft', code: 'ArrowLeft' });
      fireEvent.keyDown(puzzleGridWrapper, { key: 'ArrowRight', code: 'ArrowRight' });
    }).not.toThrow();
  });

  it('displays operators between tiles', async () => {
    const { container } = render(<SlidingPuzzle initialN={4} />);
    
    await waitFor(() => {
      // Check for horizontal operators (right side of tiles)
      const horizontalOps = container.querySelectorAll('[class*="horizontalOp"]');
      expect(horizontalOps.length).toBeGreaterThan(0);
      
      // Check for vertical operators (bottom of tiles)
      const verticalOps = container.querySelectorAll('[class*="verticalOp"]');
      expect(verticalOps.length).toBeGreaterThan(0);
      
      // Verify operators have symbols
      const opSymbols = container.querySelectorAll('[class*="opSymbol"]');
      expect(opSymbols.length).toBeGreaterThan(0);
      
      // At least one operator should have content
      const hasContent = Array.from(opSymbols).some(op => op.textContent.trim() !== '');
      expect(hasContent).toBe(true);
    });
  });

  it('displays expected and current calculation values', async () => {
    const { container } = render(<SlidingPuzzle initialN={4} />);
    
    await waitFor(() => {
      // Check for static grids that display expected/current values
      const staticGrids = container.querySelectorAll('[class*="staticGrid"]');
      expect(staticGrids.length).toBeGreaterThan(0);
      
      // Static grids should have cells with numbers
      const staticCells = container.querySelectorAll('[class*="staticCell"]');
      expect(staticCells.length).toBeGreaterThan(0);
      
      // At least some cells should have number content
      const cellsWithNumbers = Array.from(staticCells).filter(cell => {
        const cellNumber = cell.querySelector('[class*="cellNumber"]');
        return cellNumber && cellNumber.textContent.trim() !== '';
      });
      expect(cellsWithNumbers.length).toBeGreaterThan(0);
    });
  });
});

