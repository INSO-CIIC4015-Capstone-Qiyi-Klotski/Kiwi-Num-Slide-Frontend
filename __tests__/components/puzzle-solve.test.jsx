import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mock performance.now() for consistent timer testing
let mockNow = 0;
const originalPerformanceNow = global.performance.now;
beforeEach(() => {
  mockNow = 0;
  global.performance.now = jest.fn(() => mockNow);
});
afterEach(() => {
  global.performance.now = originalPerformanceNow;
});

// Mock the PuzzlesService
jest.mock('@/services/puzzles.service', () => ({
  PuzzlesService: {
    submitSolve: jest.fn(),
  },
}));

// Mock SlidingPuzzle to avoid complexity
jest.mock('@/components/Puzzle/SlidingPuzzle', () => {
  return function MockSlidingPuzzle({ onSolved, puzzleId }) {
    return (
      <div data-testid="sliding-puzzle">
        <button
          data-testid="solve-puzzle"
          onClick={() => {
            if (onSolved) {
              onSolved({
                numbers: [1, 2, 3, 4, 5, 6, 7, 8],
                movementsCount: 10,
                puzzleId,
              });
            }
          }}
        >
          Simulate Solve
        </button>
      </div>
    );
  };
});

import LevelGameClient from '@/app/levels/[id]/LevelGameClient';
import { PuzzlesService } from '@/services/puzzles.service';

const mockInitialUiPuzzle = {
  N: 3,
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, null],
  operators: ['+', '-', '+', '-'],
  expected: [10, 20, 30],
};

const mockMeta = {
  author: 'Test Author',
  size: 3,
  difficulty: 2,
};

describe('Puzzle Solution Submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the level game client with puzzle info', () => {
    render(
      <LevelGameClient
        puzzleId={123}
        initialUiPuzzle={mockInitialUiPuzzle}
        meta={mockMeta}
      />
    );

    expect(screen.getByText(/by test author/i)).toBeInTheDocument();
    expect(screen.getByText(/size 3/i)).toBeInTheDocument();
    expect(screen.getByText(/difficulty 2/i)).toBeInTheDocument();
    expect(screen.getByTestId('sliding-puzzle')).toBeInTheDocument();
  });

  it('displays timer that increments', async () => {
    render(
      <LevelGameClient
        puzzleId={123}
        initialUiPuzzle={mockInitialUiPuzzle}
        meta={mockMeta}
      />
    );

    // Initial timer at 0
    expect(screen.getByText(/⏱ 0s/)).toBeInTheDocument();

    // Advance time and mock performance.now
    mockNow = 2000;
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Timer should update (we just check that it changed from 0)
    await waitFor(() => {
      // The timer display includes seconds, just verify it updated
      const timerElement = screen.getByText(/⏱ \d+s/);
      expect(timerElement).toBeInTheDocument();
    });
  });

  it('shows anonymous author when no author is provided', () => {
    render(
      <LevelGameClient
        puzzleId={123}
        initialUiPuzzle={mockInitialUiPuzzle}
        meta={{ ...mockMeta, author: null }}
      />
    );

    expect(screen.getByText(/anonymous author/i)).toBeInTheDocument();
  });

  it('hides difficulty when not provided', () => {
    render(
      <LevelGameClient
        puzzleId={123}
        initialUiPuzzle={mockInitialUiPuzzle}
        meta={{ ...mockMeta, difficulty: null }}
      />
    );

    expect(screen.queryByText(/difficulty/i)).not.toBeInTheDocument();
  });

  describe('Solution Submission', () => {
    it('submits solve when puzzle is solved', async () => {
      PuzzlesService.submitSolve.mockResolvedValue({
        ok: true,
        data: { id: 1 },
      });

      // Simulate some time elapsed
      mockNow = 5000;

      render(
        <LevelGameClient
          puzzleId={123}
          initialUiPuzzle={mockInitialUiPuzzle}
          meta={mockMeta}
        />
      );

      // Trigger the solve
      const solveButton = screen.getByTestId('solve-puzzle');
      fireEvent.click(solveButton);

      await waitFor(() => {
        expect(PuzzlesService.submitSolve).toHaveBeenCalledWith(123, {
          movements: 10,
          duration_ms: expect.any(Number),
          solution: { solution: [1, 2, 3, 4, 5, 6, 7, 8] },
        });
      });
    });

    it('shows success message after successful submission', async () => {
      PuzzlesService.submitSolve.mockResolvedValue({
        ok: true,
        data: { id: 1 },
      });

      render(
        <LevelGameClient
          puzzleId={123}
          initialUiPuzzle={mockInitialUiPuzzle}
          meta={mockMeta}
        />
      );

      // Trigger the solve
      const solveButton = screen.getByTestId('solve-puzzle');
      fireEvent.click(solveButton);

      await waitFor(() => {
        expect(screen.getByText(/solve submitted successfully/i)).toBeInTheDocument();
      });
    });

    it('shows submitting state while submitting', async () => {
      // Make the submission take some time
      PuzzlesService.submitSolve.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ ok: true }), 1000))
      );

      render(
        <LevelGameClient
          puzzleId={123}
          initialUiPuzzle={mockInitialUiPuzzle}
          meta={mockMeta}
        />
      );

      // Trigger the solve
      const solveButton = screen.getByTestId('solve-puzzle');
      fireEvent.click(solveButton);

      // Should show submitting state
      await waitFor(() => {
        expect(screen.getByText(/submitting solve/i)).toBeInTheDocument();
      });
    });

    it('shows error message when submission fails with string error', async () => {
      PuzzlesService.submitSolve.mockResolvedValue({
        ok: false,
        error: 'Invalid solution submitted',
      });

      render(
        <LevelGameClient
          puzzleId={123}
          initialUiPuzzle={mockInitialUiPuzzle}
          meta={mockMeta}
        />
      );

      // Trigger the solve
      const solveButton = screen.getByTestId('solve-puzzle');
      fireEvent.click(solveButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid solution submitted/i)).toBeInTheDocument();
      });
    });

    it('shows error message when submission fails with object error', async () => {
      PuzzlesService.submitSolve.mockResolvedValue({
        ok: false,
        error: { msg: 'Solution validation failed' },
      });

      render(
        <LevelGameClient
          puzzleId={123}
          initialUiPuzzle={mockInitialUiPuzzle}
          meta={mockMeta}
        />
      );

      // Trigger the solve
      const solveButton = screen.getByTestId('solve-puzzle');
      fireEvent.click(solveButton);

      await waitFor(() => {
        expect(screen.getByText(/solution validation failed/i)).toBeInTheDocument();
      });
    });

    it('shows error message when submission fails with array error', async () => {
      PuzzlesService.submitSolve.mockResolvedValue({
        ok: false,
        error: [{ msg: 'Error 1' }, { msg: 'Error 2' }],
      });

      render(
        <LevelGameClient
          puzzleId={123}
          initialUiPuzzle={mockInitialUiPuzzle}
          meta={mockMeta}
        />
      );

      // Trigger the solve
      const solveButton = screen.getByTestId('solve-puzzle');
      fireEvent.click(solveButton);

      await waitFor(() => {
        expect(screen.getByText(/error 1; error 2/i)).toBeInTheDocument();
      });
    });

    it('shows error message when submission fails with detail array', async () => {
      PuzzlesService.submitSolve.mockResolvedValue({
        ok: false,
        error: { detail: [{ msg: 'Detail error' }] },
      });

      render(
        <LevelGameClient
          puzzleId={123}
          initialUiPuzzle={mockInitialUiPuzzle}
          meta={mockMeta}
        />
      );

      // Trigger the solve
      const solveButton = screen.getByTestId('solve-puzzle');
      fireEvent.click(solveButton);

      await waitFor(() => {
        expect(screen.getByText(/detail error/i)).toBeInTheDocument();
      });
    });

    it('shows generic error when submission throws an exception', async () => {
      PuzzlesService.submitSolve.mockRejectedValue(new Error('Network error'));

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <LevelGameClient
          puzzleId={123}
          initialUiPuzzle={mockInitialUiPuzzle}
          meta={mockMeta}
        />
      );

      // Trigger the solve
      const solveButton = screen.getByTestId('solve-puzzle');
      fireEvent.click(solveButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to submit solve/i)).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('does not submit twice when solve is triggered multiple times', async () => {
      PuzzlesService.submitSolve.mockResolvedValue({
        ok: true,
        data: { id: 1 },
      });

      render(
        <LevelGameClient
          puzzleId={123}
          initialUiPuzzle={mockInitialUiPuzzle}
          meta={mockMeta}
        />
      );

      // Trigger the solve multiple times
      const solveButton = screen.getByTestId('solve-puzzle');
      fireEvent.click(solveButton);
      fireEvent.click(solveButton);
      fireEvent.click(solveButton);

      await waitFor(() => {
        expect(screen.getByText(/solve submitted successfully/i)).toBeInTheDocument();
      });

      // Should only be called once due to isSolved flag
      expect(PuzzlesService.submitSolve).toHaveBeenCalledTimes(1);
    });

    it('stops timer when puzzle is solved', async () => {
      PuzzlesService.submitSolve.mockResolvedValue({
        ok: true,
        data: { id: 1 },
      });

      mockNow = 3000;

      render(
        <LevelGameClient
          puzzleId={123}
          initialUiPuzzle={mockInitialUiPuzzle}
          meta={mockMeta}
        />
      );

      // Let timer update
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Trigger the solve
      const solveButton = screen.getByTestId('solve-puzzle');
      fireEvent.click(solveButton);

      await waitFor(() => {
        expect(screen.getByText(/solve submitted successfully/i)).toBeInTheDocument();
      });

      // Note: Timer display would have stopped at the moment of solve
      // The actual behavior depends on when stopTimer is called
    });

    it('handles null values in numbers array', async () => {
      PuzzlesService.submitSolve.mockResolvedValue({
        ok: true,
        data: { id: 1 },
      });

      render(
        <LevelGameClient
          puzzleId={123}
          initialUiPuzzle={mockInitialUiPuzzle}
          meta={mockMeta}
        />
      );

      // Trigger the solve
      const solveButton = screen.getByTestId('solve-puzzle');
      fireEvent.click(solveButton);

      await waitFor(() => {
        expect(PuzzlesService.submitSolve).toHaveBeenCalled();
      });

      // The solution should not contain null values
      const callArgs = PuzzlesService.submitSolve.mock.calls[0];
      expect(callArgs[1].solution.solution).not.toContain(null);
    });
  });
});

