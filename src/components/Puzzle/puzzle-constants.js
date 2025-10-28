// Puzzle configuration constants
export const MOVABLE_TILE_BORDER_COLOR = '#4CAF50';

// Mock puzzle data for N=4
export const mockPuzzleDataN4 = {
  N: 4,
  numbers: [2, 3, 4, 5, 1, 2, 3, 4, 5, 6, 2, 3, 4, 5, 6, null],
  operators: [
    '+', '+', '+',      //row0
    '+', '+', '+', '+', 
    '+', '+', '+',      //row1
    '+', '+', '+', '+',
    '+', '+', '+',      //row2
    '+', '+', '+',      
    '+', '+'            //row3
  ],
  expected: [14, 10, 16, 15, 12, 16, 15, 12] // [row0, row1, row2, row3, col0, col1, col2, col3]
};

// Mock puzzle data for N=3
export const mockPuzzleDataN3 = {
  N: 3,
  numbers: [3, 2, 4, 2, 2, 2, 4, 3, null],
  operators: [
    '+', '-',       //row0  
    '+', '×', '-',
    '+', '+',       //row1
    '+', '+',
    '-'             //row2
  ],
  expected: [1, 6, 1, 9, 7, 2] // [row0, row1, row2, col0, col1, col2]
};

