import { describe, it, expect } from 'vitest';
import { roundTimeframe, ROUND_DOWN, ROUND_UP } from '@/shared/timemath';

// 1651021200000 = 2022-04-27T11:05:00+00:00

const TIMEFRAME_MS_1M = 1000 * 60;
const TIMEFRAME_MS_5M = 1000 * 60 * 5;
const TIMEFRAME_MS_1H = 1000 * 60 * 60;
const TIMEFRAME_MS_1D = 1000 * 60 * 60 * 24;

describe('timemath.ts', () => {
  // Use EpochConverter for details on the test data
  it('rounds values down 1m', () => {
    expect(roundTimeframe(TIMEFRAME_MS_1M, 1651057500000)).toEqual(1651057500000);
    expect(roundTimeframe(TIMEFRAME_MS_1M, 1651057500000, ROUND_DOWN)).toEqual(1651057500000);
    expect(roundTimeframe(TIMEFRAME_MS_1M, 1651057500200)).toEqual(1651057500000);
    expect(roundTimeframe(TIMEFRAME_MS_1M, 1651057500200, ROUND_DOWN)).toEqual(1651057500000);
  });
  it('rounds values down 5m', () => {
    expect(roundTimeframe(TIMEFRAME_MS_5M, 1651057500000)).toEqual(1651057500000);
    expect(roundTimeframe(TIMEFRAME_MS_5M, 1651057500000, ROUND_DOWN)).toEqual(1651057500000);
    expect(roundTimeframe(TIMEFRAME_MS_5M, 1651057500200)).toEqual(1651057500000);
    expect(roundTimeframe(TIMEFRAME_MS_5M, 1651057500200, ROUND_DOWN)).toEqual(1651057500000);
    // Expect to round down to :00
    expect(roundTimeframe(TIMEFRAME_MS_5M, 1651057499999, ROUND_DOWN)).toEqual(1651057200000);
  });
  it('rounds values down 1h', () => {
    expect(roundTimeframe(TIMEFRAME_MS_1H, 1651057500000)).toEqual(1651057200000);
    expect(roundTimeframe(TIMEFRAME_MS_1H, 1651057500200)).toEqual(1651057200000);
  });
  it('rounds values down 1D', () => {
    expect(roundTimeframe(TIMEFRAME_MS_1D, 1651057500000)).toEqual(1651017600000);
    expect(roundTimeframe(TIMEFRAME_MS_1D, 1651057500200)).toEqual(1651017600000);
  });

  it('rounds values up 1m', () => {
    expect(roundTimeframe(TIMEFRAME_MS_1M, 1651057500000, ROUND_UP)).toEqual(1651057560000);
    expect(roundTimeframe(TIMEFRAME_MS_1M, 1651057500200, ROUND_UP)).toEqual(1651057560000);
  });
  it('rounds values up 5m', () => {
    expect(roundTimeframe(TIMEFRAME_MS_5M, 1651057500000, ROUND_UP)).toEqual(1651057800000);
    expect(roundTimeframe(TIMEFRAME_MS_5M, 1651057500200, ROUND_UP)).toEqual(1651057800000);
  });
  it('rounds values up 1h', () => {
    expect(roundTimeframe(TIMEFRAME_MS_1H, 1651057500000, ROUND_UP)).toEqual(1651060800000);
    expect(roundTimeframe(TIMEFRAME_MS_1H, 1651057500200, ROUND_UP)).toEqual(1651060800000);
  });
  it('rounds values up 1d', () => {
    expect(roundTimeframe(TIMEFRAME_MS_1D, 1651057500000, ROUND_UP)).toEqual(1651104000000);
    expect(roundTimeframe(TIMEFRAME_MS_1D, 1651057500200, ROUND_UP)).toEqual(1651104000000);
  });
});
