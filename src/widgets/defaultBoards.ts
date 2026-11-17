import type { GridItemData } from '@/types';
import type { Board, WidgetInstance, WidgetOptions } from './types';
import { defaultOptions } from './helpers';
import { SOURCES } from './sources';
import { WIDGET_PRESETS } from './presets';

type Spec = [
  source: string,
  layout: Omit<GridItemData, 'i'>,
  extra?: Partial<Omit<WidgetInstance, 'id' | 'source' | 'options'>> & {
    options?: Partial<WidgetOptions>;
  },
];

function overlaps(a: GridItemData, b: GridItemData) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/** Pushes items down until nothing overlaps, so default layouts need no exact y values. */
export function resolveOverlaps(layout: GridItemData[]): GridItemData[] {
  const placed: GridItemData[] = [];
  [...layout]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .forEach((item) => {
      const next = { ...item };
      while (placed.some((p) => overlaps(p, next))) next.y += 1;
      placed.push(next);
    });
  return layout.map((l) => placed.find((p) => p.i === l.i)!);
}

function board(id: string, name: string, icon: string, specs: Spec[]): Board {
  const widgets: WidgetInstance[] = [];
  const layout: GridItemData[] = [];
  specs.forEach(([source, pos, extra], idx) => {
    const id = idx + 1;
    widgets.push({
      id,
      source,
      display: extra?.display ?? SOURCES[source]?.defaultDisplay ?? 'native',
      title: extra?.title,
      options: defaultOptions(extra?.options),
    });
    layout.push({ i: id, ...pos });
  });
  return { id, name, icon, builtIn: true, widgets, layout: resolveOverlaps(layout) };
}

const ALL = { botScope: 'all' } as const;

/** One board per route. Keys are the board ids used by the pages. */
export const DEFAULT_BOARDS: Record<string, Board> = {
  home: board('home', 'Home', 'i-mdi-home-outline', [
    ['app.welcome', { x: 0, y: 0, w: 12, h: 14 }],
  ]),
  dashboard: board('dashboard', 'Dashboard', 'i-mdi-view-dashboard-outline', [
    ['profit.summary', { x: 0, y: 0, w: 12, h: 3 }, { options: ALL }],
    ['bots.comparison', { x: 0, y: 3, w: 8, h: 6 }],
    [
      'period.breakdown',
      { x: 8, y: 3, w: 4, h: 6 },
      {
        display: 'chart',
        title: 'Profit over time',
        options: {
          ...ALL,
          period: 'daily',
          periodCount: 30,
          chartView: 'absProfit',
          chartKind: 'bar',
        },
      },
    ],
    ['trades.open', { x: 0, y: 8, w: 8, h: 6 }, { title: 'Open Trades', options: ALL }],
    [
      'trades.closed',
      { x: 8, y: 8, w: 4, h: 6 },
      {
        display: 'chart',
        title: 'Cumulative Profit',
        options: { ...ALL, chartView: 'cumulative', chartKind: 'area' },
      },
    ],
    ['trades.closed', { x: 0, y: 14, w: 8, h: 6 }, { title: 'Closed Trades', options: ALL }],
    ['wallet.history', { x: 8, y: 14, w: 4, h: 6 }, { options: ALL }],
    ['chart.tradesLog', { x: 0, y: 20, w: 8, h: 6 }, { title: 'Trades Log', options: ALL }],
    [
      'chart.profitDistribution',
      { x: 8, y: 20, w: 4, h: 6 },
      { title: 'Profit Distribution', options: ALL },
    ],
  ]),
  trade: board('trade', 'Trade', 'i-mdi-swap-vertical-circle-outline', [
    ['bot.multiPane', { x: 0, y: 0, w: 3, h: 35 }, { title: 'Multi Pane' }],
    ['chart.candles', { x: 3, y: 0, w: 9, h: 14 }, { title: 'Chart' }],
    ['trades.open', { x: 3, y: 14, w: 9, h: 5 }, { title: 'Open Trades' }],
    ['trade.detail', { x: 3, y: 19, w: 9, h: 6 }, { title: 'Trade Detail' }],
    ['trades.closed', { x: 3, y: 25, w: 9, h: 10 }, { title: 'Closed Trades' }],
  ]),
  graph: board('graph', 'Chart', 'i-mdi-chart-line', [
    ['chart.full', { x: 0, y: 0, w: 12, h: 14 }],
  ]),
  logs: board('logs', 'Logs', 'i-mdi-format-list-bulleted', [
    ['logs', { x: 0, y: 0, w: 12, h: 14 }],
  ]),
  balance: board('balance', 'Balance', 'i-mdi-bank-outline', [
    ['balance.currencies', { x: 0, y: 0, w: 12, h: 14 }],
  ]),
  open_trades: board('open_trades', 'Open trades', 'i-mdi-folder-open-outline', [
    ['trades.mobileOpen', { x: 0, y: 0, w: 12, h: 14 }],
  ]),
  trade_history: board('trade_history', 'Trade history', 'i-mdi-folder-lock-outline', [
    ['trades.mobileHistory', { x: 0, y: 0, w: 12, h: 14 }],
  ]),
  pairlist: board('pairlist', 'Pairlist', 'i-mdi-format-list-group', [
    ['pairlist.live', { x: 0, y: 0, w: 12, h: 14 }],
  ]),
  backtest: board('backtest', 'Backtest', 'i-mdi-flask-outline', [
    ['backtest.workbench', { x: 0, y: 0, w: 12, h: 16 }],
  ]),
  download_data: board('download_data', 'Download Data', 'i-mdi-download', [
    ['tools.downloadData', { x: 0, y: 0, w: 12, h: 14 }],
  ]),
  pairlist_config: board('pairlist_config', 'Pairlist Config', 'i-mdi-format-list-numbered-rtl', [
    ['tools.pairlistConfig', { x: 0, y: 0, w: 12, h: 14 }],
  ]),
  recursive_analysis: board('recursive_analysis', 'Recursive Analysis', 'i-mdi-magnify-scan', [
    ['analysis.recursive', { x: 0, y: 0, w: 12, h: 14 }],
  ]),
  lookahead_analysis: board(
    'lookahead_analysis',
    'Lookahead Analysis',
    'i-mdi-chart-timeline-variant-shimmer',
    [['analysis.lookahead', { x: 0, y: 0, w: 12, h: 14 }]],
  ),
};

/** Starting point for a new custom board. */
export function newCustomBoard(id: string, name: string): Board {
  const b = board(id, name, 'i-mdi-view-grid-outline', [
    ['profit.summary', { x: 0, y: 0, w: 12, h: 3 }],
  ]);
  return { ...b, builtIn: false };
}

/** Layouts that can be applied to any board from the board menu. */
export const BOARD_TEMPLATES: { key: string; label: string; description: string; board: Board }[] =
  [
    {
      key: 'overview',
      label: 'Overview',
      description: 'Stat tiles, bot comparison, trades and profit charts',
      board: DEFAULT_BOARDS.dashboard!,
    },
    {
      key: 'monitoring',
      label: 'Monitoring',
      description: 'Open trades first, then recent results',
      board: board('tpl', 'Monitoring', 'i-mdi-monitor-eye', [
        ['profit.summary', { x: 0, y: 0, w: 12, h: 3 }, { options: ALL }],
        ['trades.open', { x: 0, y: 3, w: 12, h: 8 }, { options: ALL }],
        ['locks', { x: 0, y: 10, w: 4, h: 6 }, { display: 'list', options: ALL }],
        [
          'trades.closed',
          { x: 4, y: 10, w: 8, h: 6 },
          { display: 'table', title: 'Last 24 hours', options: { ...ALL, timeRange: '24h' } },
        ],
        ['logs', { x: 0, y: 16, w: 12, h: 6 }],
      ]),
    },
    {
      key: 'analysis',
      label: 'Analysis',
      description: 'Charts and breakdowns to review performance',
      board: board('tpl', 'Analysis', 'i-mdi-chart-areaspline', [
        [
          'trades.closed',
          { x: 0, y: 0, w: 12, h: 3 },
          { display: 'kpi', title: 'Closed trades', options: ALL },
        ],
        [
          'trades.closed',
          { x: 0, y: 2, w: 8, h: 7 },
          {
            display: 'chart',
            title: 'Cumulative profit',
            options: { ...ALL, chartView: 'cumulative' },
          },
        ],
        [
          'stats.exitReasons',
          { x: 8, y: 2, w: 4, h: 7 },
          { display: 'chart', options: { ...ALL, chartView: 'count', chartKind: 'pie' } },
        ],
        [
          'period.breakdown',
          { x: 0, y: 9, w: 6, h: 7 },
          {
            display: 'chart',
            title: 'Weekly profit',
            options: { ...ALL, period: 'weekly', periodCount: 12 },
          },
        ],
        ['stats.pairs', { x: 6, y: 9, w: 6, h: 7 }, { display: 'table', options: ALL }],
        ['chart.hourly', { x: 0, y: 16, w: 6, h: 6 }, { options: ALL }],
        ['chart.tradeDuration', { x: 6, y: 16, w: 6, h: 6 }, { options: ALL }],
      ]),
    },
    {
      key: 'trading',
      label: 'Trading desk',
      description: 'Multi pane, candle chart, open trades and history',
      board: DEFAULT_BOARDS.trade!,
    },
  ];

function fromPresets(name: string, specs: [string, Omit<GridItemData, 'i'>][]): Board {
  return board(
    'tpl',
    name,
    'i-mdi-auto-fix',
    specs.map(([key, pos]) => {
      const p = WIDGET_PRESETS.find((x) => x.key === key)!;
      return [p.source, pos, { display: p.display, title: p.label, options: p.options }];
    }),
  );
}

BOARD_TEMPLATES.push({
  key: 'insights',
  label: 'Insights',
  description: 'Calendar, heatmaps, flows, leaderboards and projections',
  board: fromPresets('Insights', [
    ['today', { x: 0, y: 0, w: 12, h: 3 }],
    ['calendar', { x: 0, y: 3, w: 12, h: 5 }],
    ['hourWeekday', { x: 0, y: 8, w: 8, h: 6 }],
    ['topPairs', { x: 8, y: 8, w: 4, h: 6 }],
    ['drawdown', { x: 0, y: 14, w: 6, h: 6 }],
    ['monteCarlo', { x: 6, y: 14, w: 6, h: 6 }],
    ['sankey', { x: 0, y: 20, w: 8, h: 7 }],
    ['feed', { x: 8, y: 20, w: 4, h: 7 }],
    ['treemap', { x: 0, y: 27, w: 6, h: 7 }],
    ['boxplot', { x: 6, y: 27, w: 6, h: 7 }],
    ['pivot', { x: 0, y: 34, w: 8, h: 7 }],
    ['note', { x: 8, y: 34, w: 4, h: 7 }],
  ]),
});
