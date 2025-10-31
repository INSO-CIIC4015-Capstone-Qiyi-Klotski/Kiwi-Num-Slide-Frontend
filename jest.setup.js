// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Performance API for jsdom environment
global.performance = global.performance || {};

// Add missing performance methods if they don't exist
if (!global.performance.mark) {
  global.performance.mark = jest.fn();
}
if (!global.performance.measure) {
  global.performance.measure = jest.fn();
}
if (!global.performance.clearMarks) {
  global.performance.clearMarks = jest.fn();
}
if (!global.performance.clearMeasures) {
  global.performance.clearMeasures = jest.fn();
}
if (!global.performance.getEntriesByType) {
  global.performance.getEntriesByType = jest.fn((type) => {
    // Return mock entries for testing
    if (type === 'mark') {
      return [
        { name: 'daily_fetch_start', entryType: 'mark' },
        { name: 'daily_fetch_end', entryType: 'mark' },
        { name: 'detail_fetch_start', entryType: 'mark' },
        { name: 'detail_fetch_end', entryType: 'mark' },
        { name: 'ui_transform_start', entryType: 'mark' },
        { name: 'ui_transform_end', entryType: 'mark' },
      ];
    }
    if (type === 'measure') {
      return [
        { name: 'daily_fetch', entryType: 'measure', duration: 100 },
        { name: 'detail_fetch', entryType: 'measure', duration: 150 },
        { name: 'ui_transform', entryType: 'measure', duration: 10 },
      ];
    }
    return [];
  });
}

