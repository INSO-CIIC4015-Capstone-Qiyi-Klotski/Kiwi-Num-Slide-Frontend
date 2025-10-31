# Test Suite Overview

This directory contains all test files for the Kiwi Num Slide Frontend application.

## Quick Start

```bash
# Install dependencies (if not already installed) 
# npm install --save-dev jest
sudo rm -rf node_modules package-lock.json
npm install

# Run tests
npm test

# Watch mode (for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Files

### Components Tests
- **`components/Board.test.jsx`** - Tests for the sliding puzzle board component
  - Rendering tests
  - Drag and drop functionality
  - Tile state management
  - CSS class verification

### API/Utility Tests
- **`components/puzzle-api.test.js`** - Tests for puzzle data transformation and API calls
  - `toUIPuzzle()` function tests
  - `fetchPuzzleDataFromBE()` function tests
  - Service mocking examples
  - Error handling tests
  - Performance measurement tests

### Setup/Smoke Tests
- **`setup/example.test.js`** - Basic smoke tests to verify Jest configuration
  - JavaScript operations
  - DOM manipulation
  - Async operations
  - Mock functions
  - Timer tests

## Test Coverage

Current test files cover:
- Board component rendering and interactions
- Puzzle API data transformation
- API error handling
- Performance monitoring
- Jest setup verification

## Adding New Tests

1. Create a new test file in the appropriate subdirectory
2. Follow the naming convention: `ComponentName.test.jsx` or `utilityName.test.js`
3. Import necessary testing utilities
4. Write descriptive test cases using `describe()` and `it()`
5. Run tests to ensure they pass

Example:
```javascript
import { render, screen } from '@testing-library/react';
import MyNewComponent from '@/components/MyNewComponent';

describe('MyNewComponent', () => {
  it('renders without crashing', () => {
    render(<MyNewComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Testing Philosophy

- **Test behavior, not implementation** - Focus on what users see and do
- **Keep tests simple** - Each test should verify one thing
- **Use meaningful descriptions** - Test names should explain what they verify
- **Mock external dependencies** - Isolate the code being tested
- **Test edge cases** - Include error conditions and boundary cases

## Useful Commands

```bash
# Run a specific test file
npm test -- Board.test.jsx

# Run tests matching a pattern
npm test -- --testNamePattern="renders"

# Update snapshots (if you add snapshot tests)
npm test -- -u

# Run with verbose output
npm test -- --verbose

# Run in watch mode with coverage
npm test -- --watch --coverage
```

## Next Steps

Consider adding tests for:
- Other React components (Hud, MenuButton, BackButton, etc.)
- Service layer (puzzles.service)
- Page components
- Custom hooks (if any)
- Utility functions
- Error boundaries
