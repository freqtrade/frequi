/**
 * Pure data transforms behind the widget visualizations.
 * Input rows are trade rows as produced by `tradeToRow` (see helpers.ts).
 */
import type {
  BandData,
  CalendarData,
  ChartData,
  Dimension,
  FlowData,
  MatrixData,
  Metric,
  PointsData,
  RadarData,
  RangesData,
  Row,
  TreeData,
  TreeNode,
  ValueFormat,
} from './types';

export const DIMENSIONS: { value: Dimension; label: string }[] = [
  { value: 'pair', label: 'Pair' },
  { value: 'side', label: 'Side' },
  { value: 'exit_reason', label: 'Exit reason' },
  { value: 'enter_tag', label: 'Enter tag' },
  { value: 'botName', label: 'Bot' },
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'weekday', label: 'Weekday' },
  { value: 'hour', label: 'Hour of day' },
  { value: 'durationBucket', label: 'Trade duration' },
];

export const METRICS: { value: Metric; label: string; format: ValueFormat }[] = [
  { value: 'profit_abs', label: 'Total profit', format: 'stake' },
  { value: 'avg_profit_ratio', label: 'Average profit %', format: 'percent' },
  { value: 'count', label: 'Trade count', format: 'integer' },
  { value: 'winrate', label: 'Win rate', format: 'percent' },
];

export function metricFormat(metric: Metric): ValueFormat {
  return METRICS.find((m) => m.value === metric)?.format ?? 'number';
}
export function metricLabel(metric: Metric): string {
  return METRICS.find((m) => m.value === metric)?.label ?? metric;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DURATION_BUCKETS = ['< 1h', '1–4h', '4–12h', '12–24h', '1–3d', '> 3d'];

const pad = (n: number) => String(n).padStart(2, '0');

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Monday of the week, as yyyy-mm-dd */
function weekKey(ts: number): string {
  const d = new Date(ts);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return dayKey(d.getTime());
}

export function rowTime(row: Row, basis: 'open' | 'close' = 'close'): number {
  const close = row.close_timestamp as number | null;
  return basis === 'open' || !close ? (row.open_timestamp as number) : close;
}

function durationBucket(seconds: number): string {
  const h = seconds / 3600;
  if (h < 1) return DURATION_BUCKETS[0]!;
  if (h < 4) return DURATION_BUCKETS[1]!;
  if (h < 12) return DURATION_BUCKETS[2]!;
  if (h < 24) return DURATION_BUCKETS[3]!;
  if (h < 72) return DURATION_BUCKETS[4]!;
  return DURATION_BUCKETS[5]!;
}

export function dimensionValue(
  row: Row,
  dim: Dimension,
  basis: 'open' | 'close' = 'close',
): string {
  switch (dim) {
    case 'month': {
      const d = new Date(rowTime(row, basis));
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    }
    case 'week':
      return weekKey(rowTime(row, basis));
    case 'weekday':
      return WEEKDAYS[(new Date(rowTime(row, basis)).getDay() + 6) % 7]!;
    case 'hour':
      return `${pad(new Date(rowTime(row, basis)).getHours())}:00`;
    case 'durationBucket':
      return durationBucket((row.duration as number) ?? 0);
    default:
      return String(row[dim] ?? '') || '(none)';
  }
}

/** Natural ordering for time-like dimensions, otherwise undefined (sort by value). */
function dimensionOrder(dim: Dimension): ((a: string, b: string) => number) | undefined {
  if (dim === 'weekday') return (a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b);
  if (dim === 'durationBucket')
    return (a, b) => DURATION_BUCKETS.indexOf(a) - DURATION_BUCKETS.indexOf(b);
  if (dim === 'hour' || dim === 'month' || dim === 'week') return (a, b) => (a < b ? -1 : 1);
  return undefined;
}

export function groupRows(rows: Row[], dim: Dimension, basis: 'open' | 'close' = 'close') {
  const groups = new Map<string, Row[]>();
  rows.forEach((r) => {
    const k = dimensionValue(r, dim, basis);
    const g = groups.get(k);
    if (g) g.push(r);
    else groups.set(k, [r]);
  });
  return groups;
}

export function metricValue(rows: Row[], metric: Metric): number | null {
  if (rows.length === 0) return null;
  switch (metric) {
    case 'count':
      return rows.length;
    case 'avg_profit_ratio':
      return rows.reduce((a, r) => a + ((r.profit_ratio as number) ?? 0), 0) / rows.length;
    case 'winrate':
      return rows.filter((r) => ((r.profit_abs as number) ?? 0) > 0).length / rows.length;
    default:
      return rows.reduce((a, r) => a + ((r.profit_abs as number) ?? 0), 0);
  }
}

/** Groups and ranks rows: [{ key, value, count }] best first, or worst first. */
export function rankGroups(
  rows: Row[],
  dim: Dimension,
  metric: Metric,
  opts: { topN?: number; bottom?: boolean; basis?: 'open' | 'close' } = {},
) {
  const entries = [...groupRows(rows, dim, opts.basis)].map(([key, g]) => ({
    key,
    value: metricValue(g, metric) ?? 0,
    count: g.length,
  }));
  const order = dimensionOrder(dim);
  if (order && !opts.topN) return entries.sort((a, b) => order(a.key, b.key));
  entries.sort((a, b) => (opts.bottom ? a.value - b.value : b.value - a.value));
  return opts.topN ? entries.slice(0, opts.topN) : entries;
}

// ---------------------------------------------------------------------------
// Time
// ---------------------------------------------------------------------------

export function calendarDays(rows: Row[], metric: Metric, basis: 'open' | 'close'): CalendarData {
  const groups = groupRows(
    rows.map((r) => ({ ...r, _day: dayKey(rowTime(r, basis)) })),
    '_day' as Dimension,
  );
  return {
    type: 'calendar',
    days: [...groups].map(([d, g]) => [d, metricValue(g, metric) ?? 0]),
    valueFormat: metricFormat(metric),
  };
}

export function hourWeekdayMatrix(
  rows: Row[],
  metric: Metric,
  basis: 'open' | 'close',
): MatrixData {
  const cells = new Map<string, Row[]>();
  rows.forEach((r) => {
    const d = new Date(rowTime(r, basis));
    const key = `${d.getHours()}|${(d.getDay() + 6) % 7}`;
    const c = cells.get(key);
    if (c) c.push(r);
    else cells.set(key, [r]);
  });
  const values: [number, number, number | null][] = [];
  cells.forEach((g, key) => {
    const [h, wd] = key.split('|').map(Number);
    values.push([h!, wd!, metricValue(g, metric)]);
  });
  return {
    type: 'matrix',
    xLabels: Array.from({ length: 24 }, (_, i) => `${pad(i)}h`),
    yLabels: WEEKDAYS,
    values,
    valueFormat: metricFormat(metric),
    diverging: metric === 'profit_abs' || metric === 'avg_profit_ratio',
  };
}

/** Rows sorted by close time, oldest first. */
function chronological(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => rowTime(a) - rowTime(b));
}

export function drawdownSeries(rows: Row[]): ChartData {
  let equity = 0;
  let peak = 0;
  const sorted = chronological(rows);
  const data = sorted.map((r) => {
    equity += (r.profit_abs as number) ?? 0;
    peak = Math.max(peak, equity);
    return equity - peak;
  });
  return {
    x: sorted.map((r) => rowTime(r)),
    series: [{ name: 'Drawdown', data }],
    timeAxis: true,
    valueFormat: 'stake',
  };
}

export function tradeRanges(rows: Row[], topN = 15): RangesData {
  const pairs = rankGroups(rows, 'pair', 'count', { topN }).map((g) => g.key);
  const now = Date.now();
  return {
    type: 'ranges',
    rows: pairs,
    items: rows
      .filter((r) => pairs.includes(String(r.pair)))
      .slice(0, 500)
      .map((r) => ({
        row: pairs.indexOf(String(r.pair)),
        start: r.open_timestamp as number,
        end: (r.close_timestamp as number) ?? now,
        value: (r.profit_ratio as number) ?? 0,
        label: `${r.pair} #${r.trade_id}`,
      })),
    valueFormat: 'percent',
  };
}

// ---------------------------------------------------------------------------
// Distribution / comparison
// ---------------------------------------------------------------------------

export function histogramBins(values: number[], bins = 20) {
  if (values.length === 0) return { x: [] as string[], counts: [] as number[], edges: [] };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = (max - min) / bins || 1;
  const counts = Array.from({ length: bins }, () => 0);
  values.forEach((v) => {
    const i = Math.min(bins - 1, Math.floor((v - min) / width));
    counts[i]! += 1;
  });
  const edges = counts.map((_, i) => min + i * width);
  return { edges, counts, width };
}

export function quartiles(values: number[]): [number, number, number, number, number] {
  const s = [...values].sort((a, b) => a - b);
  const q = (p: number) => {
    const pos = (s.length - 1) * p;
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    return s[lo]! + (s[hi]! - s[lo]!) * (pos - lo);
  };
  return [s[0]!, q(0.25), q(0.5), q(0.75), s[s.length - 1]!];
}

export function stackedByPeriod(
  rows: Row[],
  period: Dimension,
  stack: Dimension,
  metric: Metric,
  topN = 6,
): ChartData {
  const top = rankGroups(rows, stack, 'count', { topN }).map((g) => g.key);
  const periods = [...groupRows(rows, period)].sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const stacks = [...top, 'Other'];
  const series = stacks.map((name) => ({
    name,
    data: periods.map(([, g]) => {
      const members = g.filter((r) => {
        const v = dimensionValue(r, stack);
        return name === 'Other' ? !top.includes(v) : v === name;
      });
      return members.length ? metricValue(members, metric) : null;
    }),
  }));
  return {
    x: periods.map(([k]) => k),
    series: series.filter((s) => s.data.some((v) => v !== null)),
    valueFormat: metricFormat(metric),
  };
}

export function pointsFromTrades(rows: Row[], group: Dimension, topGroups = 8): PointsData {
  const top = rankGroups(rows, group, 'count', { topN: topGroups }).map((g) => g.key);
  return {
    type: 'points',
    xLabel: 'Duration (hours)',
    yLabel: 'Profit %',
    xFormat: 'number',
    yFormat: 'percent',
    points: rows.slice(0, 2000).map((r) => {
      const g = dimensionValue(r, group);
      return {
        x: Math.round((((r.duration as number) ?? 0) / 3600) * 100) / 100,
        y: (r.profit_ratio as number) ?? 0,
        size: (r.max_stake_amount as number) ?? (r.stake_amount as number) ?? 0,
        name: `${r.pair} #${r.trade_id}`,
        group: top.includes(g) ? g : 'Other',
      };
    }),
  };
}

/** Radar of bot KPIs, each axis normalized to the best bot. */
export function botRadar(rows: Row[]): RadarData {
  const axes: { name: string; get: (r: Row) => number }[] = [
    { name: 'Profit %', get: (r) => Math.max(0, (r.profit_all_ratio as number) ?? 0) },
    { name: 'Win rate', get: (r) => (r.winrate as number) ?? 0 },
    { name: 'Profit factor', get: (r) => (r.profit_factor as number) ?? 0 },
    { name: 'Trades', get: (r) => (r.trade_count as number) ?? 0 },
    { name: 'Low drawdown', get: (r) => 1 - Math.min(1, (r.max_drawdown as number) ?? 0) },
  ];
  return {
    type: 'radar',
    indicators: axes.map((a) => ({
      name: a.name,
      max: Math.max(1e-9, ...rows.map((r) => a.get(r))) * 1.05,
    })),
    series: rows.map((r) => ({ name: String(r.botName), values: axes.map((a) => a.get(r)) })),
  };
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

/** Hierarchy for treemap / sunburst. Size by trade count or absolute profit. */
export function tradeTree(rows: Row[], levels: Dimension[], sizeBy: Metric): TreeData {
  const build = (subset: Row[], depth: number): TreeNode[] => {
    const dim = levels[depth]!;
    return [...groupRows(subset, dim)].map(([name, g]) => {
      const profit = metricValue(g, 'profit_abs') ?? 0;
      const node: TreeNode = {
        name,
        value: sizeBy === 'count' ? g.length : Math.abs(profit) || 1e-9,
        signed: profit,
      };
      if (depth < levels.length - 1) node.children = build(g, depth + 1);
      return node;
    });
  };
  return {
    type: 'tree',
    nodes: build(rows, 0),
    valueFormat: sizeBy === 'count' ? 'integer' : 'stake',
  };
}

export function tradeFlow(rows: Row[], levels: Dimension[], topN = 10): FlowData {
  // Limit each level to its most common values so the diagram stays readable.
  const keep = levels.map(
    (dim) => new Set(rankGroups(rows, dim, 'count', { topN }).map((g) => g.key)),
  );
  const label = (r: Row, i: number) => {
    const v = dimensionValue(r, levels[i]!);
    // Sankey node names must be unique; the same value can appear on several
    // levels (e.g. "(none)"), so levels are told apart by invisible suffixes.
    return `${keep[i]!.has(v) ? v : 'Other'}${'\u200b'.repeat(i)}`;
  };
  const nodes = new Map<string, number>();
  const links = new Map<string, number>();
  rows.forEach((r) => {
    for (let i = 0; i < levels.length; i++) {
      nodes.set(label(r, i), i);
      if (i > 0) {
        const key = `${label(r, i - 1)}→${label(r, i)}`;
        links.set(key, (links.get(key) ?? 0) + 1);
      }
    }
  });
  return {
    type: 'flow',
    nodes: [...nodes].map(([name, depth]) => ({ name, depth })),
    links: [...links].map(([k, value]) => {
      const [source, target] = k.split('→') as [string, string];
      return { source, target, value };
    }),
    valueFormat: 'integer',
  };
}

// ---------------------------------------------------------------------------
// Advanced
// ---------------------------------------------------------------------------

/** Small seeded PRNG, so simulations are stable between re-renders. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Bootstrap Monte Carlo of the equity curve: resample past trade results with
 * replacement and report percentiles of cumulative profit after each trade.
 */
export function monteCarlo(
  profits: number[],
  simulations = 500,
  steps?: number,
  seed = 42,
): BandData {
  const n = Math.min(steps ?? profits.length, 1000);
  if (profits.length === 0 || n === 0) return { type: 'band', x: [], lines: [] };
  const rand = mulberry32(seed);
  const paths: Float64Array[] = [];
  for (let s = 0; s < simulations; s++) {
    const path = new Float64Array(n);
    let acc = 0;
    for (let i = 0; i < n; i++) {
      acc += profits[Math.floor(rand() * profits.length)]!;
      path[i] = acc;
    }
    paths.push(path);
  }
  const pct = [0.05, 0.25, 0.5, 0.75, 0.95];
  const lines = pct.map((p) => ({ name: `P${Math.round(p * 100)}`, data: [] as number[] }));
  const column = new Float64Array(simulations);
  for (let i = 0; i < n; i++) {
    for (let s = 0; s < simulations; s++) column[s] = paths[s]![i]!;
    column.sort();
    pct.forEach((p, j) => lines[j]!.data.push(column[Math.floor(p * (simulations - 1))]!));
  }
  return {
    type: 'band',
    x: Array.from({ length: n }, (_, i) => i + 1),
    lines,
    valueFormat: 'stake',
  };
}

export interface PivotResult {
  rowKeys: string[];
  colKeys: string[];
  cells: Record<string, Record<string, number | null>>;
  rowTotals: Record<string, number | null>;
  colTotals: Record<string, number | null>;
  total: number | null;
}

export function pivot(
  rows: Row[],
  rowDim: Dimension,
  colDim: Dimension,
  metric: Metric,
  basis: 'open' | 'close' = 'close',
): PivotResult {
  const byRow = groupRows(rows, rowDim, basis);
  const byCol = groupRows(rows, colDim, basis);
  const rowOrder = dimensionOrder(rowDim);
  const colOrder = dimensionOrder(colDim);
  const rowKeys = [...byRow.keys()].sort(
    rowOrder ?? ((a, b) => byRow.get(b)!.length - byRow.get(a)!.length),
  );
  const colKeys = [...byCol.keys()].sort(
    colOrder ?? ((a, b) => byCol.get(b)!.length - byCol.get(a)!.length),
  );
  const cells: PivotResult['cells'] = {};
  rowKeys.forEach((rk) => {
    const sub = groupRows(byRow.get(rk)!, colDim, basis);
    cells[rk] = {};
    colKeys.forEach((ck) => {
      const g = sub.get(ck);
      cells[rk]![ck] = g ? metricValue(g, metric) : null;
    });
  });
  return {
    rowKeys,
    colKeys,
    cells,
    rowTotals: Object.fromEntries(rowKeys.map((k) => [k, metricValue(byRow.get(k)!, metric)])),
    colTotals: Object.fromEntries(colKeys.map((k) => [k, metricValue(byCol.get(k)!, metric)])),
    total: metricValue(rows, metric),
  };
}

/** Pearson correlation of returns, aligned on common timestamps. */
export function correlationMatrix(closes: Record<string, Map<number, number>>): MatrixData {
  const pairs = Object.keys(closes);
  const returns: Record<string, Map<number, number>> = {};
  pairs.forEach((p) => {
    const entries = [...closes[p]!].sort((a, b) => a[0] - b[0]);
    const r = new Map<number, number>();
    for (let i = 1; i < entries.length; i++) {
      const prev = entries[i - 1]![1];
      if (prev) r.set(entries[i]![0], entries[i]![1] / prev - 1);
    }
    returns[p] = r;
  });
  const corr = (a: Map<number, number>, b: Map<number, number>) => {
    const xs: number[] = [];
    const ys: number[] = [];
    a.forEach((v, ts) => {
      const w = b.get(ts);
      if (w !== undefined) {
        xs.push(v);
        ys.push(w);
      }
    });
    const n = xs.length;
    if (n < 3) return null;
    const mx = xs.reduce((s, v) => s + v, 0) / n;
    const my = ys.reduce((s, v) => s + v, 0) / n;
    let num = 0;
    let dx = 0;
    let dy = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i]! - mx) * (ys[i]! - my);
      dx += (xs[i]! - mx) ** 2;
      dy += (ys[i]! - my) ** 2;
    }
    return dx && dy ? num / Math.sqrt(dx * dy) : null;
  };
  const values: [number, number, number | null][] = [];
  pairs.forEach((a, i) =>
    pairs.forEach((b, j) => values.push([i, j, i === j ? 1 : corr(returns[a]!, returns[b]!)])),
  );
  return {
    type: 'matrix',
    xLabels: pairs,
    yLabels: pairs,
    values,
    valueFormat: 'number',
    diverging: true,
    min: -1,
    max: 1,
  };
}
