import { describe, it, expect } from 'vitest';
import type { TimeSummaryRecord } from '@/types';
import { combineTimeSummaries } from '@/utils/timeSummary';

function record(
  date: string,
  abs_profit: number,
  starting_balance: number,
  trade_count = 1,
): TimeSummaryRecord {
  return {
    date,
    abs_profit,
    starting_balance,
    rel_profit: starting_balance > 0 ? abs_profit / starting_balance : 0,
    fiat_value: abs_profit,
    trade_count,
  };
}

describe('timeSummary.ts', () => {
  it('sums values and recalculates relative profit', () => {
    const bot1 = [record('2026-10-01', 4, 800, 5)];
    const bot2 = [record('2026-10-01', 3, 200, 7)];

    const result = combineTimeSummaries([bot1, bot2]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      date: '2026-10-01',
      abs_profit: 7,
      fiat_value: 7,
      starting_balance: 1000,
      trade_count: 12,
    });
    // 7 / 1000 - not 4 / 800 + 3 / 200 = 0.02
    expect(result[0]!.rel_profit).toBeCloseTo(0.007);
  });

  it('keeps dates of a single bot and sorts by date', () => {
    const bot1 = [record('2026-10-01', 4, 800), record('2026-09-01', 2, 796)];
    const bot2 = [record('2026-10-01', 3, 200)];

    const result = combineTimeSummaries([bot1, bot2]);

    expect(result.map((r) => r.date)).toEqual(['2026-09-01', '2026-10-01']);
    expect(result[0]).toMatchObject({ abs_profit: 2, starting_balance: 796 });
    expect(result[0]!.rel_profit).toBeCloseTo(2 / 796);
  });

  it('returns zero relative profit without a starting balance', () => {
    const result = combineTimeSummaries([
      [record('2026-10-01', 5, 0)],
      [record('2026-10-01', 1, 0)],
    ]);

    expect(result[0]!.abs_profit).toBe(6);
    expect(result[0]!.rel_profit).toBe(0);
  });

  it('does not modify the input', () => {
    const bot1 = [record('2026-10-01', 4, 800)];
    const bot2 = [record('2026-10-01', 3, 200)];

    combineTimeSummaries([bot1, bot2]);

    expect(bot1[0]).toEqual(record('2026-10-01', 4, 800));
    expect(bot2[0]).toEqual(record('2026-10-01', 3, 200));
  });

  it('handles empty input', () => {
    expect(combineTimeSummaries([])).toEqual([]);
    expect(combineTimeSummaries([[], []])).toEqual([]);
  });
});
