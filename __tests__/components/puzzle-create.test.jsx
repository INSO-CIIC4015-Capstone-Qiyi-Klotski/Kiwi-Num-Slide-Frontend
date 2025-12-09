import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the PuzzlesService
jest.mock('@/services/puzzles.service', () => ({
  PuzzlesService: {
    create: jest.fn(),
  },
}));

// Provide a minimal mock for puzzle-utils that the NumbersStep uses
jest.mock('@/components/Puzzle/puzzle-utils', () => ({
  getNumbersGrid: jest.fn((numbers, N) => {
    const grid = [];
    for (let i = 0; i < N; i++) {
      grid.push(numbers.slice(i * N, (i + 1) * N));
    }
    return grid;
  }),
}));

import LevelCreateClient from '@/components/levels/create/LevelCreateClient';
import SizeStep from '@/components/levels/create/SizeStep';
import NumbersStep from '@/components/levels/create/NumbersStep';
import { PuzzlesService } from '@/services/puzzles.service';

describe('Puzzle Creation Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('LevelCreateClient', () => {
    it('renders the initial size step', () => {
      render(<LevelCreateClient />);

      expect(screen.getByText(/1. Size/)).toBeInTheDocument();
      expect(screen.getByText(/choose board size/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue to numbers/i })).toBeInTheDocument();
    });

    it('shows step navigation indicators', () => {
      render(<LevelCreateClient />);

      // All steps should be shown in the navigation
      expect(screen.getByText(/1. Size/)).toBeInTheDocument();
      expect(screen.getByText(/2. Numbers/)).toBeInTheDocument();
      expect(screen.getByText(/3. Operators/)).toBeInTheDocument();
      expect(screen.getByText(/4. Target/)).toBeInTheDocument();
      expect(screen.getByText(/5. Summary/)).toBeInTheDocument();
    });

    it('allows selecting different board sizes', () => {
      render(<LevelCreateClient />);

      // Should see size buttons for 3x3, 4x4, 5x5 (note: uses × with spaces like "3 × 3")
      expect(screen.getByRole('button', { name: /3\s*×\s*3/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /4\s*×\s*4/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /5\s*×\s*5/i })).toBeInTheDocument();
    });

    it('navigates from Size to Numbers step', async () => {
      render(<LevelCreateClient />);

      const nextButton = screen.getByRole('button', { name: /continue to numbers/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/initial state.*numbers/i)).toBeInTheDocument();
      });
    });

    it('can navigate back from Numbers to Size step', async () => {
      render(<LevelCreateClient />);

      // Go to Numbers step
      const nextButton = screen.getByRole('button', { name: /continue to numbers/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/initial state.*numbers/i)).toBeInTheDocument();
      });

      // Go back
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText(/choose board size/i)).toBeInTheDocument();
      });
    });

    it('changes board size when different size is selected', async () => {
      render(<LevelCreateClient />);

      // Select 4x4 (note: uses × with spaces like "4 × 4")
      const size4Button = screen.getByRole('button', { name: /4\s*×\s*4/i });
      fireEvent.click(size4Button);

      // Should go to step 2 automatically
      await waitFor(() => {
        expect(screen.getByText(/initial state.*numbers/i)).toBeInTheDocument();
      });
    });
  });

  describe('SizeStep Component', () => {
    it('renders all size options', () => {
      const mockOnChange = jest.fn();
      const mockOnNext = jest.fn();

      render(<SizeStep size={3} onChange={mockOnChange} onNext={mockOnNext} />);

      expect(screen.getByRole('button', { name: /3\s*×\s*3/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /4\s*×\s*4/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /5\s*×\s*5/i })).toBeInTheDocument();
    });

    it('calls onChange when size is selected', () => {
      const mockOnChange = jest.fn();
      const mockOnNext = jest.fn();

      render(<SizeStep size={3} onChange={mockOnChange} onNext={mockOnNext} />);

      const size4Button = screen.getByRole('button', { name: /4\s*×\s*4/i });
      fireEvent.click(size4Button);

      expect(mockOnChange).toHaveBeenCalledWith(4);
    });

    it('calls onNext when continue button is clicked', () => {
      const mockOnChange = jest.fn();
      const mockOnNext = jest.fn();

      render(<SizeStep size={3} onChange={mockOnChange} onNext={mockOnNext} />);

      const nextButton = screen.getByRole('button', { name: /continue to numbers/i });
      fireEvent.click(nextButton);

      expect(mockOnNext).toHaveBeenCalled();
    });

    it('highlights the selected size', () => {
      const mockOnChange = jest.fn();
      const mockOnNext = jest.fn();

      render(<SizeStep size={4} onChange={mockOnChange} onNext={mockOnNext} />);

      const size4Button = screen.getByRole('button', { name: /4\s*×\s*4/i });
      // Check that 4x4 has the selected styling (background color)
      expect(size4Button).toHaveStyle({ background: 'rgb(17, 24, 39)' }); // #111827
    });
  });

  describe('NumbersStep Component', () => {
    const defaultNumbers = [1, 2, 3, 4, 5, 6, 7, 8, null];
    
    it('renders the grid with numbers', () => {
      const mockOnChange = jest.fn();
      const mockOnPrev = jest.fn();
      const mockOnNext = jest.fn();

      render(
        <NumbersStep
          size={3}
          numbers={defaultNumbers}
          onChange={mockOnChange}
          onPrev={mockOnPrev}
          onNext={mockOnNext}
        />
      );

      // Should see the heading
      expect(screen.getByText(/initial state.*numbers/i)).toBeInTheDocument();

      // Should have 9 grid cells (buttons)
      const gridButtons = screen.getAllByRole('button').filter(btn => 
        !btn.textContent.includes('Back') && 
        !btn.textContent.includes('Continue')
      );
      expect(gridButtons.length).toBe(9);
    });

    it('calls onPrev when back button is clicked', () => {
      const mockOnChange = jest.fn();
      const mockOnPrev = jest.fn();
      const mockOnNext = jest.fn();

      render(
        <NumbersStep
          size={3}
          numbers={defaultNumbers}
          onChange={mockOnChange}
          onPrev={mockOnPrev}
          onNext={mockOnNext}
        />
      );

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      expect(mockOnPrev).toHaveBeenCalled();
    });

    it('shows number picker when a tile is clicked', async () => {
      const mockOnChange = jest.fn();
      const mockOnPrev = jest.fn();
      const mockOnNext = jest.fn();

      render(
        <NumbersStep
          size={3}
          numbers={defaultNumbers}
          onChange={mockOnChange}
          onPrev={mockOnPrev}
          onNext={mockOnNext}
        />
      );

      // Click on the first tile (which has value 1)
      const gridButtons = screen.getAllByRole('button').filter(btn => 
        !btn.textContent.includes('Back') && 
        !btn.textContent.includes('Continue')
      );
      fireEvent.click(gridButtons[0]);

      // Should show the number picker dialog
      await waitFor(() => {
        expect(screen.getByText(/pick a number/i)).toBeInTheDocument();
      });
    });
  });

  describe('PuzzlesService Integration', () => {
    it('create method is properly mocked', () => {
      PuzzlesService.create.mockResolvedValue({
        ok: true,
        data: { id: 123 },
      });

      // Verify the mock can be called
      expect(PuzzlesService.create).toBeDefined();
      expect(PuzzlesService.create({ title: 'test' })).resolves.toEqual({
        ok: true,
        data: { id: 123 },
      });
    });

    it('create returns expected error format', async () => {
      PuzzlesService.create.mockResolvedValue({
        ok: false,
        error: 'Validation failed',
      });

      const result = await PuzzlesService.create({ title: '' });
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Validation failed');
    });
  });
});
