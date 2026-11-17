/**
 * Advanced visualizations (calendar, heatmaps, distributions, trees, flows,
 * simulations) and the sources that only exist for them.
 */
import type { ChartViewDef, DataSource, FeedItem, KpiDef, Row, SourceContext } from './types';
import {
  botRadar,
  calendarDays,
  correlationMatrix,
  drawdownSeries,
  groupRows,
  hourWeekdayMatrix,
  monteCarlo,
  pointsFromTrades,
  rankGroups,
  rowTime,
  stackedByPeriod,
  tradeFlow,
  tradeRanges,
  tradeTree,
} from './analytics';
import { closedTradeRows, resolveBots, sum } from './helpers';

const metricOf = (ctx: SourceContext) => ctx.options.metric ?? 'profit_abs';
const groupOf = (ctx: SourceContext) => ctx.options.groupBy ?? 'pair';
const basisOf = (ctx: SourceContext) => ctx.options.timeBasis ?? 'close';

/** Views over closed trades. */
export const closedTradeViews: ChartViewDef[] = [
  {
    key: 'calendar',
    label: 'Profit calendar',
    kinds: ['calendar'],
    controls: ['metric', 'timeBasis'],
    build: (rows, ctx) => calendarDays(rows, metricOf(ctx), basisOf(ctx)),
  },
  {
    key: 'hourWeekday',
    label: 'Hour × weekday heatmap',
    kinds: ['heatmap'],
    controls: ['metric', 'timeBasis'],
    build: (rows, ctx) => hourWeekdayMatrix(rows, metricOf(ctx), basisOf(ctx)),
  },
  {
    key: 'timeline',
    label: 'Trade timeline',
    kinds: ['gantt'],
    controls: ['topN'],
    build: (rows, ctx) => tradeRanges(rows, ctx.options.topN ?? 15),
  },
  {
    key: 'drawdown',
    label: 'Drawdown (underwater)',
    kinds: ['area', 'line'],
    build: (rows) => drawdownSeries(rows),
  },
  {
    key: 'distribution',
    label: 'Profit % distribution',
    kinds: ['histogram', 'boxplot'],
    controls: ['bins', 'groupBy', 'topN'],
    build: (rows, ctx) => {
      const top = rankGroups(rows, groupOf(ctx), 'count', { topN: ctx.options.topN ?? 12 });
      const groups = groupRows(rows, groupOf(ctx), basisOf(ctx));
      return {
        type: 'distribution',
        groups: top.map((g) => ({
          name: g.key,
          values: (groups.get(g.key) ?? []).map((r) => (r.profit_ratio as number) ?? 0),
        })),
        valueFormat: 'percent',
      };
    },
  },
  {
    key: 'durationDistribution',
    label: 'Duration distribution (hours)',
    kinds: ['histogram', 'boxplot'],
    controls: ['bins', 'groupBy', 'topN'],
    build: (rows, ctx) => {
      const top = rankGroups(rows, groupOf(ctx), 'count', { topN: ctx.options.topN ?? 12 });
      const groups = groupRows(rows, groupOf(ctx), basisOf(ctx));
      return {
        type: 'distribution',
        groups: top.map((g) => ({
          name: g.key,
          values: (groups.get(g.key) ?? []).map((r) => ((r.duration as number) ?? 0) / 3600),
        })),
        valueFormat: 'number',
      };
    },
  },
  {
    key: 'scatter',
    label: 'Duration vs profit',
    kinds: ['bubble', 'scatter'],
    controls: ['groupBy'],
    build: (rows, ctx) => pointsFromTrades(rows, groupOf(ctx)),
  },
  {
    key: 'waterfall',
    label: 'Profit contribution (waterfall)',
    kinds: ['waterfall'],
    controls: ['groupBy', 'topN'],
    build: (rows, ctx) => {
      const ranked = rankGroups(rows, groupOf(ctx), 'profit_abs', { basis: basisOf(ctx) });
      const topN = ctx.options.topN ?? 12;
      const top = ranked.slice(0, topN);
      const rest = ranked.slice(topN);
      const entries = rest.length
        ? [...top, { key: 'Other', value: sum(rest.map((r) => r.value)), count: 0 }]
        : top;
      return {
        x: entries.map((e) => e.key),
        series: [{ name: 'Profit', data: entries.map((e) => e.value) }],
        valueFormat: 'stake',
      };
    },
  },
  {
    key: 'stackedWeekly',
    label: 'Profit per week, stacked',
    kinds: ['stackedBar', 'area'],
    controls: ['groupBy', 'metric', 'topN'],
    build: (rows, ctx) =>
      stackedByPeriod(rows, 'week', groupOf(ctx), metricOf(ctx), ctx.options.topN ?? 6),
  },
  {
    key: 'stackedMonthly',
    label: 'Profit per month, stacked',
    kinds: ['stackedBar', 'area'],
    controls: ['groupBy', 'metric', 'topN'],
    build: (rows, ctx) =>
      stackedByPeriod(rows, 'month', groupOf(ctx), metricOf(ctx), ctx.options.topN ?? 6),
  },
  {
    key: 'tree',
    label: 'Bot → pair → exit reason',
    kinds: ['treemap', 'sunburst'],
    controls: ['metric'],
    build: (rows, ctx) =>
      tradeTree(
        rows,
        ['botName', 'pair', 'exit_reason'],
        metricOf(ctx) === 'count' ? 'count' : 'profit_abs',
      ),
  },
  {
    key: 'pairTree',
    label: 'Pair → exit reason',
    kinds: ['treemap', 'sunburst'],
    controls: ['metric'],
    build: (rows, ctx) =>
      tradeTree(rows, ['pair', 'exit_reason'], metricOf(ctx) === 'count' ? 'count' : 'profit_abs'),
  },
  {
    key: 'flow',
    label: 'Enter tag → pair → exit reason',
    kinds: ['sankey'],
    controls: ['topN'],
    build: (rows, ctx) =>
      tradeFlow(rows, ['enter_tag', 'pair', 'exit_reason'], ctx.options.topN ?? 10),
  },
  {
    key: 'sideFlow',
    label: 'Side → exit reason → result',
    kinds: ['sankey'],
    build: (rows) =>
      tradeFlow(
        rows.map((r) => ({ ...r, _result: ((r.profit_abs as number) ?? 0) > 0 ? 'Win' : 'Loss' })),
        ['side', 'exit_reason', '_result' as never],
      ),
  },
  {
    key: 'monteCarlo',
    label: 'Monte Carlo projection',
    kinds: ['band'],
    build: (rows) => monteCarlo([...rows].reverse().map((r) => (r.profit_abs as number) ?? 0)),
  },
];

/** Views over open trades. */
export const openTradeViews: ChartViewDef[] = [
  {
    key: 'timeline',
    label: 'Open trade timeline',
    kinds: ['gantt'],
    controls: ['topN'],
    build: (rows, ctx) => tradeRanges(rows, ctx.options.topN ?? 15),
  },
  {
    key: 'tree',
    label: 'Open positions by pair',
    kinds: ['treemap', 'sunburst'],
    controls: ['metric'],
    build: (rows, ctx) =>
      tradeTree(rows, ['botName', 'pair'], metricOf(ctx) === 'count' ? 'count' : 'profit_abs'),
  },
  {
    key: 'scatter',
    label: 'Duration vs profit',
    kinds: ['bubble', 'scatter'],
    controls: ['groupBy'],
    build: (rows, ctx) => pointsFromTrades(rows, groupOf(ctx)),
  },
];

/** Bot radar, for the profit summary source (one row per bot). */
export const radarView: ChartViewDef = {
  key: 'radar',
  label: 'Bot comparison radar',
  kinds: ['radar'],
  build: (rows) => botRadar(rows),
};

// ---------------------------------------------------------------------------
// New sources
// ---------------------------------------------------------------------------

const PERIOD_MS = { daily: 86_400_000, weekly: 7 * 86_400_000, monthly: 30 * 86_400_000 };

function windowStart(period: 'daily' | 'weekly' | 'monthly', now = new Date()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (period === 'weekly') d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  if (period === 'monthly') d.setDate(1);
  return d.getTime();
}

function previousWindowStart(period: 'daily' | 'weekly' | 'monthly', start: number): number {
  if (period === 'monthly') {
    const d = new Date(start);
    d.setMonth(d.getMonth() - 1);
    return d.getTime();
  }
  return start - PERIOD_MS[period];
}

function periodKpis(rows: Row[]) {
  const profits = rows.map((r) => (r.profit_abs as number) ?? 0);
  const ratios = rows.map((r) => (r.profit_ratio as number) ?? 0);
  return {
    profit: sum(profits),
    trades: rows.length,
    winrate: rows.length ? profits.filter((p) => p > 0).length / rows.length : null,
    avgProfit: rows.length ? sum(ratios) / rows.length : null,
  };
}

const periodCompareKpis: KpiDef[] = [
  {
    key: 'profit',
    label: 'Profit',
    format: 'stake',
    tone: true,
    icon: 'i-mdi-cash',
    defaultVisible: true,
  },
  {
    key: 'trades',
    label: 'Closed trades',
    format: 'integer',
    icon: 'i-mdi-swap-horizontal',
    defaultVisible: true,
  },
  {
    key: 'winrate',
    label: 'Win rate',
    format: 'percent',
    icon: 'i-mdi-trophy-outline',
    defaultVisible: true,
    max: 1,
  },
  {
    key: 'avgProfit',
    label: 'Avg profit',
    format: 'percent',
    tone: true,
    icon: 'i-mdi-chart-bell-curve',
    defaultVisible: true,
  },
];

function feedFromBots(ctx: SourceContext): FeedItem[] {
  const items: FeedItem[] = [];
  const multi = ctx.bots.length > 1;
  ctx.bots.forEach((bot) => {
    const suffix = multi ? ` · ${bot.uiBotName}` : '';
    [...bot.openTrades, ...bot.closedTrades].forEach((t) => {
      const side = t.is_short ? 'short' : 'long';
      items.push({
        ts: t.open_timestamp,
        icon: t.is_short ? 'i-mdi-arrow-down-bold' : 'i-mdi-arrow-up-bold',
        title: `Entered ${side} ${t.pair}`,
        detail: `${t.enter_tag ? `Tag ${t.enter_tag} · ` : ''}Rate ${formatPrice(t.open_rate)}${suffix}`,
        tone: 'neutral',
      });
      if (t.close_timestamp) {
        const p = t.profit_abs ?? 0;
        items.push({
          ts: t.close_timestamp,
          icon: p >= 0 ? 'i-mdi-check-circle-outline' : 'i-mdi-close-circle-outline',
          title: `Exited ${t.pair}`,
          detail: `${t.exit_reason ?? ''} · ${formatPercent(t.profit_ratio, 2)}${suffix}`,
          value: p,
          valueFormat: 'stake',
          tone: p >= 0 ? 'profit' : 'loss',
        });
      }
    });
    bot.activeLocks.forEach((l) => {
      items.push({
        ts: l.lock_timestamp,
        icon: 'i-mdi-lock-outline',
        title: `Locked ${l.pair}`,
        detail: `${l.reason ?? ''} · until ${timestampms(l.lock_end_timestamp)}${suffix}`,
        tone: 'warning',
      });
    });
  });
  return items;
}

/** Closes per timestamp, read from the candle cache of a bot. */
function closesFor(ctx: SourceContext, pairs: string[]): Record<string, Map<number, number>> {
  const bot = ctx.bots[0];
  const out: Record<string, Map<number, number>> = {};
  if (!bot) return out;
  pairs.forEach((pair) => {
    const entry = bot.candleData[`${pair}__${bot.timeframe}`];
    const data = entry?.data;
    if (!data?.data?.length) return;
    const tsIdx = data.columns.indexOf('__date_ts');
    const closeIdx = data.columns.indexOf('close');
    if (tsIdx < 0 || closeIdx < 0) return;
    out[pair] = new Map(data.data.map((row) => [row[tsIdx]!, row[closeIdx]!]));
  });
  return out;
}

export const extraSources: DataSource[] = [
  {
    id: 'stats.periodCompare',
    label: 'Period comparison',
    description: 'Today vs yesterday, this week vs last week, or this month vs last month.',
    icon: 'i-mdi-compare-horizontal',
    category: 'Performance',
    displays: ['kpi', 'gauge'],
    defaultDisplay: 'kpi',
    defaultSize: { w: 12, h: 3 },
    supports: { botScope: true, period: true, filters: ['pair', 'side', 'enterTag'] },
    rows: (ctx) => closedTradeRows({ ...ctx.options, timeRange: 'all' }),
    kpis: periodCompareKpis,
    kpiValues: (rows, ctx) => {
      const start = windowStart(ctx.options.period ?? 'daily');
      return periodKpis(rows.filter((r) => rowTime(r) >= start));
    },
    kpiPrevious: (rows, ctx) => {
      const period = ctx.options.period ?? 'daily';
      const start = windowStart(period);
      const prev = previousWindowStart(period, start);
      return periodKpis(rows.filter((r) => rowTime(r) >= prev && rowTime(r) < start));
    },
  },
  {
    id: 'activity',
    label: 'Activity feed',
    description: 'Timeline of entries, exits and pair locks.',
    icon: 'i-mdi-timeline-text-outline',
    category: 'Trades',
    displays: ['feed'],
    defaultDisplay: 'feed',
    defaultSize: { w: 4, h: 10 },
    supports: { botScope: true },
    feed: (_rows, ctx) => feedFromBots(ctx),
  },
  {
    id: 'note',
    label: 'Note',
    description: 'Your own text, checklists and links (markdown).',
    icon: 'i-mdi-note-text-outline',
    category: 'Tools',
    displays: ['note'],
    defaultDisplay: 'note',
    defaultSize: { w: 4, h: 5 },
    standalone: true,
  },
  {
    id: 'market.correlation',
    label: 'Pair correlation',
    description: 'How the returns of whitelisted pairs move together (from candle data).',
    icon: 'i-mdi-grid',
    category: 'Market',
    displays: ['chart'],
    defaultDisplay: 'chart',
    defaultSize: { w: 6, h: 8 },
    load: async (ctx) => {
      const bot = ctx.bots[0];
      if (!bot?.timeframe) return [];
      const pairs = bot.whitelist.slice(0, Math.min(ctx.options.topN ?? 8, 20));
      // Sequential, to avoid hammering the bot with many candle requests at once.
      for (const pair of pairs) {
        if (!bot.candleData[`${pair}__${bot.timeframe}`]) {
          await bot.getPairCandles({ pair, timeframe: bot.timeframe }).catch(() => undefined);
        }
      }
      return pairs;
    },
    refreshMs: 600_000,
    rows: () => [],
    charts: [
      {
        key: 'correlation',
        label: 'Correlation of returns',
        kinds: ['heatmap'],
        controls: ['topN'],
        build: (_rows, ctx) => correlationMatrix(closesFor(ctx, (ctx.loaded as string[]) ?? [])),
      },
    ],
  },
];

/** Gauges for open trades vs the configured maximum. */
export function openTradeGaugeMax(): number | null {
  const bot = resolveBots({ botScope: 'selected', timeRange: 'all', filters: {} })[0];
  const max = bot?.botState?.max_open_trades;
  return typeof max === 'number' && max > 0 ? max : null;
}
