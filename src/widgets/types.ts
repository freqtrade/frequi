import type { Component } from 'vue';
import type { GridItemData } from '@/types';
import type { BotSubStore } from '@/stores/ftbotwrapper';

/** How a widget renders its data source. */
export type DisplayType =
  | 'table'
  | 'chart'
  | 'kpi'
  | 'list'
  | 'native'
  | 'gauge'
  | 'leaderboard'
  | 'feed'
  | 'pivot'
  | 'note';

export type ChartKind =
  | 'line'
  | 'area'
  | 'bar'
  | 'stackedBar'
  | 'pie'
  | 'donut'
  | 'waterfall'
  | 'histogram'
  | 'boxplot'
  | 'scatter'
  | 'bubble'
  | 'heatmap'
  | 'calendar'
  | 'gantt'
  | 'treemap'
  | 'sunburst'
  | 'sankey'
  | 'radar'
  | 'band';

/** Trade fields that can be used to group or pivot trades. */
export type Dimension =
  | 'pair'
  | 'side'
  | 'exit_reason'
  | 'enter_tag'
  | 'botName'
  | 'month'
  | 'week'
  | 'weekday'
  | 'hour'
  | 'durationBucket';

/** Aggregated value of a group of trades. */
export type Metric = 'profit_abs' | 'avg_profit_ratio' | 'count' | 'winrate';

/** Which bot(s) a widget reads from. */
export type BotScope = 'selected' | 'all' | 'bot';
export type TimeRange = 'all' | '24h' | '7d' | '30d' | '90d' | 'ytd';
export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface WidgetFilters {
  pair?: string;
  side?: 'all' | 'long' | 'short';
  outcome?: 'all' | 'win' | 'loss';
  exitReason?: string;
  enterTag?: string;
}

export interface WidgetOptions {
  botScope: BotScope;
  /** Only used with botScope 'bot' */
  botId?: string;
  timeRange: TimeRange;
  period?: PeriodType;
  periodCount?: number;
  filters: WidgetFilters;
  /** Visible table/list columns, in display order */
  columns?: string[];
  sortBy?: string;
  sortDesc?: boolean;
  pageSize?: number;
  /** Which chart view of the source to show */
  chartView?: string;
  chartKind?: ChartKind;
  /** Visible KPI tiles, in display order */
  kpis?: string[];
  /** Stat tiles: 'tiles' (compact grid) or 'big' (one large number with delta) */
  kpiStyle?: 'tiles' | 'big';
  /** Gauges: 'dial' or horizontal 'bar' */
  gaugeStyle?: 'dial' | 'bar';
  /** Value used by leaderboards, heatmaps, trees and pivots */
  metric?: Metric;
  /** Grouping used by charts like stacked bars, box plots and waterfalls */
  groupBy?: Dimension;
  /** Pivot table rows / columns */
  pivotRows?: Dimension;
  pivotCols?: Dimension;
  /** Leaderboard / chart size limit */
  topN?: number;
  /** Leaderboard direction: best first or worst first */
  bottom?: boolean;
  /** Histogram bins */
  bins?: number;
  /** Which timestamp to use for time-based views */
  timeBasis?: 'open' | 'close';
  /** Note widget content (markdown) */
  note?: string;
}

export interface WidgetInstance {
  /** Unique within its board, also used as grid item id */
  id: number;
  source: string;
  display: DisplayType;
  /** Custom title, falls back to the source label */
  title?: string;
  options: WidgetOptions;
  /** Minimized to its header bar */
  collapsed?: boolean;
  /** Height before collapsing, restored on expand */
  expandedH?: number;
}

export interface Board {
  id: string;
  name: string;
  icon: string;
  /** Built-in boards back a route and can be reset to defaults, but not deleted */
  builtIn: boolean;
  widgets: WidgetInstance[];
  layout: GridItemData[];
}

export interface BoardExport {
  freqUIBoard: 1;
  board: Board;
}

// ---------------------------------------------------------------------------
// Data source definitions
// ---------------------------------------------------------------------------

export type ValueFormat =
  'text' | 'number' | 'integer' | 'price' | 'stake' | 'percent' | 'date' | 'duration';

export interface ColumnDef {
  key: string;
  label: string;
  format?: ValueFormat;
  /** Color the value green/red based on its sign */
  tone?: boolean;
  defaultVisible?: boolean;
}

export interface KpiDef {
  key: string;
  label: string;
  format?: ValueFormat;
  tone?: boolean;
  icon?: string;
  defaultVisible?: boolean;
  /** Upper bound for gauges / progress bars. A number, or a function of the KPI values. */
  max?: number | ((values: Record<string, number | string | null>) => number | null);
  /** For metrics where lower is better (e.g. drawdown) */
  lowerIsBetter?: boolean;
}

/** Category or time series - line, area, bar, stacked bar, pie, donut, waterfall. */
export interface ChartData {
  type?: 'series';
  /** X-axis categories, or timestamps (ms) when timeAxis is true */
  x: (string | number)[];
  series: { name: string; data: (number | null)[] }[];
  timeAxis?: boolean;
  valueFormat?: ValueFormat;
}

export interface MatrixData {
  type: 'matrix';
  xLabels: string[];
  yLabels: string[];
  /** [xIndex, yIndex, value] */
  values: [number, number, number | null][];
  valueFormat?: ValueFormat;
  /** Symmetric range around 0 (diverging colours) */
  diverging?: boolean;
  min?: number;
  max?: number;
}

export interface CalendarData {
  type: 'calendar';
  /** [yyyy-mm-dd, value] */
  days: [string, number][];
  valueFormat?: ValueFormat;
}

export interface TreeNode {
  name: string;
  value: number;
  /** Signed value used for colouring (e.g. profit) */
  signed?: number;
  children?: TreeNode[];
}

export interface TreeData {
  type: 'tree';
  nodes: TreeNode[];
  valueFormat?: ValueFormat;
}

export interface FlowData {
  type: 'flow';
  nodes: { name: string; depth: number }[];
  links: { source: string; target: string; value: number }[];
  valueFormat?: ValueFormat;
}

export interface PointsData {
  type: 'points';
  xLabel: string;
  yLabel: string;
  xFormat?: ValueFormat;
  yFormat?: ValueFormat;
  points: { x: number; y: number; size?: number; name: string; group: string }[];
}

export interface RangesData {
  type: 'ranges';
  /** Row labels (y axis) */
  rows: string[];
  items: { row: number; start: number; end: number; value: number; label: string }[];
  valueFormat?: ValueFormat;
}

export interface DistributionData {
  type: 'distribution';
  groups: { name: string; values: number[] }[];
  valueFormat?: ValueFormat;
}

export interface RadarData {
  type: 'radar';
  indicators: { name: string; max: number }[];
  series: { name: string; values: number[] }[];
}

export interface BandData {
  type: 'band';
  x: number[];
  /** Percentile lines, lowest first */
  lines: { name: string; data: number[] }[];
  valueFormat?: ValueFormat;
}

export type VizData =
  | ChartData
  | MatrixData
  | CalendarData
  | TreeData
  | FlowData
  | PointsData
  | RangesData
  | DistributionData
  | RadarData
  | BandData;

/** Extra settings a chart view uses, shown in the settings drawer. */
export type ChartControl = 'metric' | 'groupBy' | 'bins' | 'timeBasis' | 'topN';

export interface ChartViewDef {
  key: string;
  label: string;
  kinds: ChartKind[];
  controls?: ChartControl[];
  build: (rows: Row[], ctx: SourceContext) => VizData;
}

export type Row = Record<string, unknown>;

export interface SourceContext {
  options: WidgetOptions;
  /** Bots in scope for this widget */
  bots: BotSubStore[];
  /** Result of `load()`, if the source defines one */
  loaded: unknown;
  stakeCurrency: string;
}

export interface ListDef {
  title: (row: Row) => string;
  subtitle?: (row: Row) => string;
  /** Column key shown as the main value on the right */
  value?: string;
  /** Column key shown as secondary value under the main value */
  secondary?: string;
}

export type WidgetCategory = 'Trades' | 'Performance' | 'Account' | 'Market' | 'Bot' | 'Tools';

export interface DataSource {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: WidgetCategory;
  displays: DisplayType[];
  defaultDisplay: DisplayType;
  /** Default size when added from the gallery (grid columns: 12, row: 50px) */
  defaultSize?: { w: number; h: number };
  supports?: {
    botScope?: boolean;
    timeRange?: boolean;
    period?: boolean;
    filters?: (keyof WidgetFilters)[];
  };
  /** Fetch data the source needs. Called on mount, on option change and on `refreshMs`. */
  load?: (ctx: Omit<SourceContext, 'loaded'>) => Promise<unknown>;
  refreshMs?: number;

  /** Tabular data (table, list, chart and KPIs are derived from it) */
  rows?: (ctx: SourceContext) => Row[];
  columns?: ColumnDef[];
  list?: ListDef;
  charts?: ChartViewDef[];
  kpis?: KpiDef[];
  kpiValues?: (rows: Row[], ctx: SourceContext) => Record<string, number | string | null>;
  /** Previous-period KPI values, shown as deltas in the "big number" style */
  kpiPrevious?: (rows: Row[], ctx: SourceContext) => Record<string, number | string | null>;
  /** Leaderboard / pivot: rows are trades that can be grouped by dimensions */
  groupable?: boolean;
  /** Leaderboard on pre-aggregated rows: label key and metric columns */
  rank?: { label: string; metrics: { key: string; label: string; format?: ValueFormat }[] };
  /** Activity feed entries */
  feed?: (rows: Row[], ctx: SourceContext) => FeedItem[];
  /** Optional trend shown under the KPI tiles */
  sparkline?: (rows: Row[], ctx: SourceContext) => number[];
  onRowClick?: (row: Row, ctx: SourceContext) => void;

  /** Works without a bot (e.g. notes) */
  standalone?: boolean;
  /** Existing freqUI component, used for display 'native' */
  native?: Component;
  nativeProps?: (ctx: SourceContext) => Record<string, unknown>;
  /** Native component manages its own scrolling/height (e.g. full-page tools) */
  nativeFill?: boolean;
}

export interface FeedItem {
  ts: number;
  icon: string;
  title: string;
  detail?: string;
  value?: number | null;
  valueFormat?: ValueFormat;
  tone?: 'profit' | 'loss' | 'neutral' | 'warning';
}

/** One-click widget presets shown in the gallery. */
export interface WidgetPreset {
  key: string;
  label: string;
  description: string;
  icon: string;
  source: string;
  display: DisplayType;
  title?: string;
  options?: Partial<WidgetOptions>;
  size?: { w: number; h: number };
}
