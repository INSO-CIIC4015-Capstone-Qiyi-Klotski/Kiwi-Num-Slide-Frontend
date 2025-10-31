import { toUIPuzzle, fetchPuzzleDataFromBE } from '@/components/Puzzle/puzzle-api';
import { PuzzlesService } from '@/services/puzzles.service';

// Mock the PuzzlesService
jest.mock('@/services/puzzles.service', () => ({
  PuzzlesService: {
    getDailyPuzzle: jest.fn(),
    get: jest.fn(),
  },
}));

describe('Puzzle API Utilities', () => {
  describe('toUIPuzzle', () => {
    it('converts backend puzzle format to UI format', () => {
      const boardSpec = {
        N: 4,
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        operators: ['*', '/', '+', '-'],
        expected: [10, 20, 30, 40],
      };

      const result = toUIPuzzle(boardSpec);

      expect(result.N).toBe(4);
      expect(result.numbers).toHaveLength(16); // Should add null for empty space
      expect(result.numbers[15]).toBeNull(); // Last element should be null
      expect(result.operators).toEqual(['×', '÷', '+', '-']); // Should convert operators
      expect(result.expected).toEqual([10, 20, 30, 40]);
    });

    it('converts all operator symbols correctly', () => {
      const boardSpec = {
        N: 2,
        numbers: [1, 2, 3],
        operators: ['*', '/', '+', '-'],
        expected: [5, 10],
      };

      const result = toUIPuzzle(boardSpec);

      expect(result.operators).toContain('×'); // multiplication
      expect(result.operators).toContain('÷'); // division
      expect(result.operators).toContain('+'); // addition
      expect(result.operators).toContain('-'); // subtraction
    });

    it('throws error when board_spec is missing', () => {
      expect(() => toUIPuzzle(null)).toThrow('board_spec is missing');
      expect(() => toUIPuzzle(undefined)).toThrow('board_spec is missing');
    });

    it('adds null to numbers array', () => {
      const boardSpec = {
        N: 3,
        numbers: [1, 2, 3, 4, 5, 6, 7, 8],
        operators: ['+', '-'],
        expected: [10, 15],
      };

      const result = toUIPuzzle(boardSpec);

      expect(result.numbers).toHaveLength(9);
      expect(result.numbers[8]).toBeNull();
      // Original numbers should be preserved
      expect(result.numbers.slice(0, 8)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });
  });

  describe('fetchPuzzleDataFromBE', () => {
    beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();
      // Clear performance marks (if available in environment)
      if (typeof performance.clearMarks === 'function') {
        performance.clearMarks();
      }
      if (typeof performance.clearMeasures === 'function') {
        performance.clearMeasures();
      }
    });

    it('fetches daily puzzle and returns UI format', async () => {
      const mockDailyResponse = {
        ok: true,
        data: {
          puzzle: {
            id: 'puzzle-123',
          },
        },
      };

      const mockDetailResponse = {
        ok: true,
        data: {
          board_spec: {
            N: 4,
            numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            operators: ['*', '+', '-', '/'],
            expected: [100, 200, 300, 400],
          },
        },
      };

      PuzzlesService.getDailyPuzzle.mockResolvedValue(mockDailyResponse);
      PuzzlesService.get.mockResolvedValue(mockDetailResponse);

      const result = await fetchPuzzleDataFromBE();

      expect(PuzzlesService.getDailyPuzzle).toHaveBeenCalledTimes(1);
      expect(PuzzlesService.get).toHaveBeenCalledWith('puzzle-123');
      expect(result.N).toBe(4);
      expect(result.numbers).toHaveLength(16);
      expect(result.numbers[15]).toBeNull();
    });

    it('throws error when daily puzzle fetch fails', async () => {
      PuzzlesService.getDailyPuzzle.mockResolvedValue({
        ok: false,
        error: 'Network error',
      });

      await expect(fetchPuzzleDataFromBE()).rejects.toThrow('Network error');
    });

    it('throws error when puzzle ID is missing', async () => {
      PuzzlesService.getDailyPuzzle.mockResolvedValue({
        ok: true,
        data: {
          puzzle: {}, // No ID
        },
      });

      await expect(fetchPuzzleDataFromBE()).rejects.toThrow('Daily puzzle ID is missing');
    });

    it('throws error when detail fetch fails', async () => {
      PuzzlesService.getDailyPuzzle.mockResolvedValue({
        ok: true,
        data: {
          puzzle: { id: 'puzzle-123' },
        },
      });

      PuzzlesService.get.mockResolvedValue({
        ok: false,
        error: 'Puzzle not found',
      });

      await expect(fetchPuzzleDataFromBE()).rejects.toThrow('Puzzle not found');
    });

    it('creates performance marks and measures', async () => {
      const mockDailyResponse = {
        ok: true,
        data: {
          puzzle: { id: 'puzzle-123' },
        },
      };

      const mockDetailResponse = {
        ok: true,
        data: {
          board_spec: {
            N: 2,
            numbers: [1, 2, 3],
            operators: ['+'],
            expected: [5],
          },
        },
      };

      PuzzlesService.getDailyPuzzle.mockResolvedValue(mockDailyResponse);
      PuzzlesService.get.mockResolvedValue(mockDetailResponse);

      await fetchPuzzleDataFromBE();

      // Check that performance marks were created
      const marks = performance.getEntriesByType('mark');
      const markNames = marks.map(m => m.name);

      expect(markNames).toContain('daily_fetch_start');
      expect(markNames).toContain('daily_fetch_end');
      expect(markNames).toContain('detail_fetch_start');
      expect(markNames).toContain('detail_fetch_end');
      expect(markNames).toContain('ui_transform_start');
      expect(markNames).toContain('ui_transform_end');

      // Check that performance measures were created
      const measures = performance.getEntriesByType('measure');
      const measureNames = measures.map(m => m.name);

      expect(measureNames).toContain('daily_fetch');
      expect(measureNames).toContain('detail_fetch');
      expect(measureNames).toContain('ui_transform');
    });

    it('fetches puzzle with custom N size', async () => {
      const mockDailyResponse = {
        ok: true,
        data: {
          puzzle: { id: 'puzzle-456' },
        },
      };

      const mockDetailResponse = {
        ok: true,
        data: {
          board_spec: {
            N: 3,
            numbers: [5, 10, 15, 20, 25, 30, 35, 40],
            operators: ['*', '-'],
            expected: [50, 100],
          },
        },
      };

      PuzzlesService.getDailyPuzzle.mockResolvedValue(mockDailyResponse);
      PuzzlesService.get.mockResolvedValue(mockDetailResponse);

      const result = await fetchPuzzleDataFromBE();

      expect(result.N).toBe(3);
      expect(result.numbers).toHaveLength(9);
      expect(result.numbers[8]).toBeNull();
      expect(result.operators).toEqual(['×', '-']);
      expect(result.expected).toEqual([50, 100]);
    });
  });
});

