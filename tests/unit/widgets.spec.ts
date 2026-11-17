import { describe, expect, it } from 'vitest';
import {
  aggregateRows,
  applyTradeFilters,
  cumulative,
  defaultOptions,
  timeRangeStart,
} from '@/widgets/helpers';
import { DEFAULT_BOARDS, resolveOverlaps } from '@/widgets/defaultBoards';
import { SOURCES } from '@/widgets/sources';

const DAY = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 5, 15, 12, 0, 0);

const rows = [
  {
    pair: 'BTC/USDT',
    side: 'Long',
    profit_abs: 10,
    profit_ratio: 0.1,
    exit_reason: 'roi',
    enter_tag: 'a',
    close_timestamp: now - DAY / 2,
  },
  {
    pair: 'ETH/USDT',
    side: 'Short',
    profit_abs: -5,
    profit_ratio: -0.05,
    exit_reason: 'stop_loss',
    enter_tag: 'b',
    close_timestamp: now - 3 * DAY,
  },
  {
    pair: 'BTC/USDT',
    side: 'Long',
    profit_abs: 2,
    profit_ratio: 0.02,
    exit_reason: 'exit_signal',
    enter_tag: 'a',
    close_timestamp: now - 40 * DAY,
  },
];

describe('widgets/helpers', () => {
  it('computes time range starts', () => {
    expect(timeRangeStart('all', now)).toBe(0);
    expect(timeRangeStart('24h', now)).toBe(now - DAY);
    expect(timeRangeStart('7d', now)).toBe(now - 7 * DAY);
    expect(timeRangeStart('ytd', now)).toBe(new Date(2026, 0, 1).getTime());
  });

  it('filters trades by pair, side, outcome and reason', () => {
    const opts = defaultOptions();
    expect(applyTradeFilters(rows, opts, 'close_timestamp')).toHaveLength(3);
    expect(
      applyTradeFilters(rows, { ...opts, filters: { pair: 'btc' } }, 'close_timestamp'),
    ).toHaveLength(2);
    expect(
      applyTradeFilters(rows, { ...opts, filters: { side: 'short' } }, 'close_timestamp'),
    ).toHaveLength(1);
    expect(
      applyTradeFilters(rows, { ...opts, filters: { outcome: 'win' } }, 'close_timestamp'),
    ).toHaveLength(2);
    expect(
      applyTradeFilters(rows, { ...opts, filters: { exitReason: 'stop' } }, 'close_timestamp'),
    ).toHaveLength(1);
  });

  it('aggregates rows by key, sorted by profit', () => {
    const agg = aggregateRows(rows, (r) => String(r.pair));
    expect(agg[0]).toMatchObject({ group: 'BTC/USDT', count: 2, wins: 2, profit_abs: 12 });
    expect(agg[1]).toMatchObject({ group: 'ETH/USDT', count: 1, losses: 1, winrate: 0 });
  });

  it('builds cumulative series', () => {
    expect(cumulative([1, -2, 3])).toEqual([1, -1, 2]);
  });
});

describe('widgets/defaultBoards', () => {
  it('pushes overlapping items down', () => {
    const out = resolveOverlaps([
      { i: 1, x: 0, y: 0, w: 12, h: 3 },
      { i: 2, x: 0, y: 2, w: 6, h: 4 },
      { i: 3, x: 6, y: 2, w: 6, h: 4 },
    ]);
    expect(out.find((l) => l.i === 2)?.y).toBe(3);
    expect(out.find((l) => l.i === 3)?.y).toBe(3);
  });

  it('default boards only use known sources and have a layout per widget', () => {
    Object.values(DEFAULT_BOARDS).forEach((board) => {
      board.widgets.forEach((w) => {
        expect(SOURCES[w.source], `${board.id}: ${w.source}`).toBeDefined();
        expect(SOURCES[w.source]!.displays).toContain(w.display);
        expect(board.layout.find((l) => l.i === w.id)).toBeDefined();
      });
    });
  });
});
