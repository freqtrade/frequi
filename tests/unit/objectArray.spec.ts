import { describe, it, expect } from 'vitest';
import { formatObjectForTable } from '@/shared/objectToTableItems';

describe('objectArray.ts', () => {
  it('converts object array', () => {
    const originalObj = {
      XXX1: [{ Profit: 20 }, { Loss: 50 }],
      XXX2: [{ Profit: 50 }, { Loss: 21 }],
    };
    const expected = [
      { metric: 'Profit', XXX1: 20, XXX2: 50 },
      { metric: 'Loss', XXX1: 50, XXX2: 21 },
    ];
    const expected2 = [
      { settings: 'Profit', XXX1: 20, XXX2: 50 },
      { settings: 'Loss', XXX1: 50, XXX2: 21 },
    ];
    expect(formatObjectForTable(originalObj, 'metric')).toEqual(expected);
    expect(formatObjectForTable(originalObj, 'settings')).toEqual(expected2);
  });
});
