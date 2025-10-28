// Utility functions for puzzle logic

/**
 * Convert flat numbers array to 2D grid
 */
export const getNumbersGrid = (numbers, N) => {
    const grid = [];
    for (let i = 0; i < N; i++) {
      grid.push(numbers.slice(i * N, (i + 1) * N));
    }
    return grid;
  };
  
  /**
   * Find the position of the empty tile (null)
   */
  export const findEmptyPosition = (numbers, N) => {
    const grid = getNumbersGrid(numbers, N);
    for (let row = 0; row < N; row++) {
      for (let col = 0; col < N; col++) {
        if (grid[row][col] === null) {
          return { row, col };
        }
      }
    }
    return null;
  };
  
  /**
   * Check if a tile can move to the empty space
   */
  export const canMove = (row, col, numbers, N) => {
    const emptyPos = findEmptyPosition(numbers, N);
    if (!emptyPos) return false;
  
    const { row: emptyRow, col: emptyCol } = emptyPos;
    
    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  };
  
  /**
   * Check if horizontal operator should be shown
   */
  export const shouldShowHorizontalOp = (row, col, N) => {
    if (col >= N - 1) return false; // Last column
    if (row === N - 1 && col === N - 2) return false; // Bottom-right position
    return true;
  };
  
  /**
   * Check if vertical operator should be shown
   */
  export const shouldShowVerticalOp = (row, col, N) => {
    if (row >= N - 1) return false; // Last row
    if (row === N - 2 && col === N - 1) return false; // Bottom-right position
    return true;
  };
  
  /**
   * Get operator index from flat array based on row-by-row pattern
   * Pattern: For each row: [horizontal ops, then vertical ops below]
   */
  export const getOperatorIndex = (row, col, isHorizontal, N) => {
    let index = 0;
    
    // Add operators from previous rows
    for (let r = 0; r < row; r++) {
      const horizontalOpsInRow = (r < N - 1) ? (N - 1) : (N - 2);
      const verticalOpsInRow = (r < N - 1) ? N : 0;
      const actualVerticalOps = (r === N - 2) ? (verticalOpsInRow - 1) : verticalOpsInRow;
      index += horizontalOpsInRow + actualVerticalOps;
    }
    
    if (isHorizontal) {
      index += col;
    } else {
      const horizontalOpsInRow = (row < N - 1) ? (N - 1) : (N - 2);
      index += horizontalOpsInRow + col;
    }
    
    return index;
  };
  
  /**
   * Calculate operator position number for display (1-based)
   */
  export const getOperatorNumber = (row, col, isHorizontal, N) => {
    let counter = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N - 1; c++) {
        if (r === N - 1 && c === N - 2) continue;
        counter++;
        if (r === row && c === col && isHorizontal) return counter;
      }
      if (r < N - 1) {
        for (let c = 0; c < N; c++) {
          if (r === N - 2 && c === N - 1) continue;
          counter++;
          if (r === row && c === col && !isHorizontal) return counter;
        }
      }
    }
    return counter;
  };
  
  /**
   * Swap two elements in the numbers array
   */
  export const swapTiles = (
    numbers,
    sourceRow,
    sourceCol,
    targetRow,
    targetCol,
    N
  ) => {
    const newNumbers = [...numbers];
    const sourceIndex = sourceRow * N + sourceCol;
    const targetIndex = targetRow * N + targetCol;
    
    [newNumbers[sourceIndex], newNumbers[targetIndex]] = 
      [newNumbers[targetIndex], newNumbers[sourceIndex]];
    
    return newNumbers;
  };

/**
 * Round a number to 1 decimal place
 */
const roundToOneDecimal = (num) => {
  if (num === null || num === undefined) return null;
  return Math.round(num * 10) / 10;
};

/**
 * Calculate the result of applying an operator to two numbers
 */
const applyOperator = (a, b, operator) => {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
    case '*':
      return a * b;
    case '÷':
    case '/':
      return b !== 0 ? a / b : null;
    default:
      return null;
  }
};

/**
 * Evaluate an expression with operator precedence (* and / before + and -)
 */
const evaluateExpression = (numbers, operators) => {
  if (numbers.length === 0) return null;
  if (numbers.length === 1) return roundToOneDecimal(numbers[0]);
  
  // Create working copies
  let nums = [...numbers];
  let ops = [...operators];
  
  // First pass: handle * and /
  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === '×' || ops[i] === '*' || ops[i] === '÷' || ops[i] === '/') {
      const result = applyOperator(nums[i], nums[i + 1], ops[i]);
      if (result === null) return null;
      
      nums.splice(i, 2, result);
      ops.splice(i, 1);
      i--;
    }
  }
  
  // Second pass: handle + and -
  for (let i = 0; i < ops.length; i++) {
    const result = applyOperator(nums[i], nums[i + 1], ops[i]);
    if (result === null) return null;
    
    nums.splice(i, 2, result);
    ops.splice(i, 1);
    i--;
  }
  
  return roundToOneDecimal(nums[0]);
};

/**
 * Calculate current values for horizontal rows
 * For each row, calculate the result of numbers and operators in that row
 * These results are displayed on the VERTICAL grid (right side)
 * Special rules:
 * - Last row (N-1): only calculate if blank is in bottom-right corner
 * - Other rows: only calculate if blank is NOT in that row OR blank is in bottom-right
 */
export const calculateHorizontalCurrent = (numbers, operators, N) => {
  const numbersGrid = getNumbersGrid(numbers, N);
  const emptyPos = findEmptyPosition(numbers, N);
  const results = [];
  const blankInBottomRight = emptyPos && emptyPos.row === N - 1 && emptyPos.col === N - 1;
  
  for (let row = 0; row < N; row++) {
    // Last row: only calculate if blank is in bottom-right
    if (row === N - 1 && !blankInBottomRight) {
      results.push(null);
      continue;
    }
    
    // Other rows: skip if blank is in this row (unless it's in bottom-right)
    if (emptyPos && emptyPos.row === row && !blankInBottomRight) {
      results.push(null);
      continue;
    }
    
    // Get all numbers in the row (excluding null)
    const rowNumbers = numbersGrid[row].filter(n => n !== null);
    
    // Get all horizontal operators in the row
    const rowOps = [];
    for (let col = 0; col < N - 1; col++) {
      if (shouldShowHorizontalOp(row, col, N)) {
        const opIndex = getOperatorIndex(row, col, true, N);
        rowOps.push(operators[opIndex]);
      }
    }
    
    // Calculate the result (will be rounded to 1 decimal place)
    const result = evaluateExpression(rowNumbers, rowOps);
    results.push(result);
  }
  
  return results;
};

/**
 * Calculate current values for vertical columns
 * For each column, calculate the result of numbers and operators in that column
 * These results are displayed on the HORIZONTAL grid (below)
 * Special rules:
 * - Last column (N-1): only calculate if blank is in bottom-right corner
 * - Other columns: only calculate if blank is NOT in that column OR blank is in bottom-right
 */
export const calculateVerticalCurrent = (numbers, operators, N) => {
  const numbersGrid = getNumbersGrid(numbers, N);
  const emptyPos = findEmptyPosition(numbers, N);
  const results = [];
  const blankInBottomRight = emptyPos && emptyPos.row === N - 1 && emptyPos.col === N - 1;
  
  for (let col = 0; col < N; col++) {
    // Last column: only calculate if blank is in bottom-right
    if (col === N - 1 && !blankInBottomRight) {
      results.push(null);
      continue;
    }
    
    // Other columns: skip if blank is in this column (unless it's in bottom-right)
    if (emptyPos && emptyPos.col === col && !blankInBottomRight) {
      results.push(null);
      continue;
    }
    
    // Get all numbers in the column (excluding null)
    const colNumbers = [];
    for (let row = 0; row < N; row++) {
      if (numbersGrid[row][col] !== null) {
        colNumbers.push(numbersGrid[row][col]);
      }
    }
    
    // Get all vertical operators in the column
    const colOps = [];
    for (let row = 0; row < N - 1; row++) {
      if (shouldShowVerticalOp(row, col, N)) {
        const opIndex = getOperatorIndex(row, col, false, N);
        colOps.push(operators[opIndex]);
      }
    }
    
    // Calculate the result (will be rounded to 1 decimal place)
    const result = evaluateExpression(colNumbers, colOps);
    results.push(result);
  }
  
  return results;
};

/**
 * Extract expected values from puzzle data
 * Expected format: [row0, row1, row2, row3, col0, col1, col2, col3]
 * First N values are row results (displayed on vertical grid on the right)
 * Last N values are column results (displayed on horizontal grid below)
 * Returns: { vertical: [row results], horizontal: [column results] }
 */
export const getExpectedValues = (expected, N) => {
  if (!expected || expected.length !== 2 * N) {
    return { vertical: Array(N).fill(null), horizontal: Array(N).fill(null) };
  }
  
  return {
    vertical: expected.slice(0, N),      // Row results for vertical grid (right)
    horizontal: expected.slice(N, 2 * N) // Column results for horizontal grid (below)
  };
};