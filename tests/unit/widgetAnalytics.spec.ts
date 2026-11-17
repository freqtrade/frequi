import { describe, expect, it } from 'vitest';
import {
  correlationMatrix,
  drawdownSeries,
  histogramBins,
  monteCarlo,
  pivot,
  quartiles,
  rankGroups,
  stackedByPeriod,
  tradeFlow,
  tradeTree,
} from '@/widgets/analytics';
import { renderMarkdown, toggleTask } from '@/widgets/markdown';
import { WIDGET_PRESETS } from '@/widgets/presets';
import { SOURCES } from '@/widgets/sources';

const DAY = 86_400_000;
const t0 = new Date(2026, 0, 5, 10).getTime(); // a Monday

function trade(i: number, pair: string, profit: number, exit = 'roi', tag = 'a') {
  return {
    trade_id: i,
    pair,
    side: 'Long',
    botName: 'Bot',
    profit_abs: profit,
    profit_ratio: profit / 100,
    exit_reason: exit,
    enter_tag: tag,
    open_timestamp: t0 + i * DAY - 3_600_000,
    close_timestamp: t0 + i * DAY,
    duration: 3600,
    max_stake_amount: 100,
  };
}

const rows = [
  trade(0, 'BTC/USDT', 10),
  trade(1, 'ETH/USDT', -4, 'stop_loss', 'b'),
  trade(2, 'BTC/USDT', 5),
  trade(3, 'XRP/USDT', -8, 'stop_loss', 'b'),
  trade(40, 'BTC/USDT', 3),
];

describe('widgets/analytics', () => {
  it('ranks groups best and worst first', () => {
    expect(rankGroups(rows, 'pair', 'profit_abs').map((g) => g.key)).toEqual([
      'BTC/USDT',
      'ETH/USDT',
      'XRP/USDT',
    ]);
    expect(rankGroups(rows, 'pair', 'profit_abs', { bottom: true, topN: 1 })[0]?.key).toBe(
      'XRP/USDT',
    );
  });

  it('computes the underwater drawdown curve', () => {
    // equity: 10, 6, 11, 3, 6 -> peak 10, 10, 11, 11, 11
    expect(drawdownSeries(rows).series[0]!.data).toEqual([0, -4, 0, -8, -5]);
  });

  it('bins values and computes quartiles', () => {
    const { counts } = histogramBins([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
    expect(counts).toEqual([2, 2, 2, 2, 2]);
    expect(quartiles([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });

  it('builds pivot tables with totals', () => {
    const p = pivot(rows, 'pair', 'exit_reason', 'count');
    expect(p.cells['BTC/USDT']?.roi).toBe(3);
    expect(p.cells['BTC/USDT']?.stop_loss).toBeNull();
    expect(p.colTotals.stop_loss).toBe(2);
    expect(p.total).toBe(5);
  });

  it('stacks periods by a dimension', () => {
    const d = stackedByPeriod(rows, 'month', 'pair', 'profit_abs', 1);
    expect(d.x).toEqual(['2026-01', '2026-02']);
    expect(d.series.map((s) => s.name)).toEqual(['BTC/USDT', 'Other']);
  });

  it('builds trees and flows', () => {
    const tree = tradeTree(rows, ['pair', 'exit_reason'], 'count');
    expect(tree.nodes.find((n) => n.name === 'BTC/USDT')?.value).toBe(3);
    const flow = tradeFlow(rows, ['enter_tag', 'exit_reason']);
    const link = flow.links.find((l) => l.source === 'b' && l.target.startsWith('stop_loss'));
    expect(link?.value).toBe(2);
  });

  it('produces ordered Monte Carlo percentiles', () => {
    const band = monteCarlo([1, -1, 2, -2, 3], 200, 10);
    expect(band.x).toHaveLength(10);
    const last = band.lines.map((l) => l.data[9]!);
    expect([...last].sort((a, b) => a - b)).toEqual(last);
  });

  it('correlates perfectly related series', () => {
    const a = new Map([1, 2, 3, 4, 5].map((t, i) => [t, 100 + i * i]));
    const b = new Map([1, 2, 3, 4, 5].map((t, i) => [t, 200 + 2 * i * i]));
    const m = correlationMatrix({ A: a, B: b });
    expect(m.values.find((v) => v[0] === 0 && v[1] === 1)?.[2]).toBeGreaterThan(0.95);
  });
});

describe('widgets/markdown', () => {
  it('escapes HTML and only allows http(s) links', () => {
    const html = renderMarkdown(
      '<img src=x onerror=alert(1)> [a](javascript:alert(1)) [b](https://x.io)',
    );
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
    expect(html).not.toContain('href="javascript');
    expect(html).toContain('href="https://x.io"');
  });

  it('renders and toggles checklists', () => {
    const src = '# Todo\n- [ ] one\n- [x] two';
    expect(renderMarkdown(src)).toContain('data-line="1"');
    expect(toggleTask(src, 1)).toBe('# Todo\n- [x] one\n- [x] two');
    expect(toggleTask(src, 2)).toBe('# Todo\n- [ ] one\n- [ ] two');
  });
});

describe('widgets/presets', () => {
  it('only reference existing sources, displays and chart views', () => {
    WIDGET_PRESETS.forEach((p) => {
      const src = SOURCES[p.source];
      expect(src, p.key).toBeDefined();
      expect(src!.displays, p.key).toContain(p.display);
      if (p.options?.chartView) {
        const view = src!.charts?.find((c) => c.key === p.options!.chartView);
        expect(view, p.key).toBeDefined();
        if (p.options.chartKind) expect(view!.kinds, p.key).toContain(p.options.chartKind);
      }
    });
  });
});
