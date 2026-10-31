import { describe, it, expect } from 'vitest';
import { binData } from '@/utils/charts/binCount';

describe('binCount.ts', () => {
  it('Bins data as expected', () => {
    const testData = [1, 1, 2, 3, 5, 6, 8, 10];
    const res = binData(testData, 3);
    // Bin size is rounded to a "nice" step (2.5), so the bin count is approximate
    expect(res.length).toEqual(4);
    expect(res).toEqual([
      { start: 0, end: 2.5, count: 3, clipped: false },
      { start: 2.5, end: 5, count: 1, clipped: false },
      { start: 5, end: 7.5, count: 2, clipped: false },
      { start: 7.5, end: 10, count: 2, clipped: false },
    ]);
    expect(res.map((v) => v.count).reduce((a, b) => a + b)).toEqual(testData.length);
    const res1 = binData(testData, 5);
    // expect(res1.length).toEqual(5);
    expect(res1).toEqual([
      { start: 0, end: 2, count: 2, clipped: false },
      { start: 2, end: 4, count: 2, clipped: false },
      { start: 4, end: 6, count: 1, clipped: false },
      { start: 6, end: 8, count: 1, clipped: false },
      { start: 8, end: 10, count: 2, clipped: false },
    ]);
    expect(res1.map((v) => v.count).reduce((a, b) => a + b)).toEqual(testData.length);
  });

  it('Bins data with negatives', () => {
    const testData = [1, 1, 2, 3, 5, 6, 8, -1, -3, -5, -4];
    const res = binData(testData, 3);
    expect(res.length).toEqual(3);
    expect(res.map((v) => v.count).reduce((a, b) => a + b)).toEqual(testData.length);
    expect(res).toEqual([
      { start: -5, end: 0, count: 4, clipped: false },
      { start: 0, end: 5, count: 4, clipped: false },
      { start: 5, end: 10, count: 3, clipped: false },
    ]);
  });
  it('Bins data performant', () => {
    const randomSize = 20000;
    const randomData = Array.from({ length: randomSize }, () => Math.floor(Math.random() * 10));
    const startTime = Date.now();
    const res = binData(randomData, 5);

    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(30);

    expect(res.map((v) => v.count).reduce((a, b) => a + b)).toEqual(randomData.length);
  });

  it('binData aligns bins to 0', () => {
    const testData = [-0.03, -0.012, -0.004, 0.001, 0.004, 0.006, 0.011, 0.025];
    const res = binData(testData, 10, 0);
    expect(res.map((b) => b.count).reduce((a, b) => a + b)).toEqual(testData.length);
    // 0 is a bin edge - no bin spans both profit and loss
    expect(res.some((b) => b.start < 0 && b.end > 0)).toBe(false);
    expect(res.some((b) => b.start === 0)).toBe(true);
    expect(res.every((b) => !b.clipped)).toBe(true);
    // nice step size (0.5%)
    expect(res[0]).toEqual({ start: -0.03, end: -0.025, count: 1, clipped: false });
  });

  it('binData clips outliers into edge bins', () => {
    const testData = [...Array.from({ length: 198 }, (_, i) => (i - 99) / 2000), -0.5, 0.8];
    const res = binData(testData, 20);
    expect(res.map((b) => b.count).reduce((a, b) => a + b)).toEqual(testData.length);
    expect(res[0]!.clipped).toBe(true);
    expect(res[res.length - 1]!.clipped).toBe(true);
    expect(res[0]!.start).toBeGreaterThan(-0.1);
    expect(res[res.length - 1]!.end).toBeLessThan(0.1);
    expect(binData([], 20)).toEqual([]);
    expect(binData([0.01, 0.01], 20).map((b) => b.count)).toContain(2);
  });
});
