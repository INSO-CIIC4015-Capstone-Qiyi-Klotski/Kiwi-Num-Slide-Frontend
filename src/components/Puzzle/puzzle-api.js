import { mockPuzzleDataN3, mockPuzzleDataN4 } from './puzzle-constants';

/**
 * Fetch puzzle data from backend (currently mocked)
 */
export const fetchPuzzleData = async (n = 4) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(n === 3 ? mockPuzzleDataN3 : mockPuzzleDataN4);
    }, 100);
  });
};