import { defineAsyncComponent } from 'vue';
import type { ProfitStats, TimeSummaryRecord, TimeSummaryReturnValue } from '@/types';
import type { TimeSummaryOptions } from '@/types';
import type { BotSubStore } from '@/stores/ftbotwrapper';
import type { ChartViewDef, ColumnDef, DataSource, KpiDef, Row, SourceContext } from './types';
import { aggregateRows, closedTradeRows, cumulative, openTradeRows, sum } from './helpers';
import {
  closedTradeViews,
  extraSources,
  openTradeGaugeMax,
  openTradeViews,
  radarView,
} from './advancedViews';

const native = (loader: () => Promise<{ default: unknown }>) =>
  defineAsyncComponent(loader as never);

const TRADE_FILTERS: ('pair' | 'side' | 'outcome' | 'exitReason' | 'enterTag')[] = [
  'pair',
  'side',
  'outcome',
  'exitReason',
  'enterTag',
];

function selectTrade(row: Row) {
  const botStore = useBotStore();
  const botId = row._botId as string;
  if (botId && botStore.selectedBot !== botId) botStore.selectBot(botId);
  const trade = row._trade as never;
  if (botStore.activeBot.detailTradeId === (row.trade_id as number)) {
    botStore.activeBot.setDetailTrade(null);
  } else {
    botStore.activeBot.setDetailTrade(trade);
  }
}

// ---------------------------------------------------------------------------
// Trades
// ---------------------------------------------------------------------------

const openTradeColumns: ColumnDef[] = [
  { key: 'botName', label: 'Bot' },
  { key: 'trade_id', label: 'ID', format: 'integer', defaultVisible: true },
  { key: 'pair', label: 'Pair', defaultVisible: true },
  { key: 'side', label: 'Side', defaultVisible: true },
  { key: 'amount', label: 'Amount', format: 'number' },
  { key: 'stake_amount', label: 'Stake', format: 'stake' },
  { key: 'leverage', label: 'Leverage', format: 'number' },
  { key: 'open_rate', label: 'Open rate', format: 'price', defaultVisible: true },
  { key: 'current_rate', label: 'Current rate', format: 'price', defaultVisible: true },
  { key: 'profit_ratio', label: 'Profit %', format: 'percent', tone: true, defaultVisible: true },
  { key: 'profit_abs', label: 'Profit', format: 'stake', tone: true, defaultVisible: true },
  { key: 'enter_tag', label: 'Enter tag' },
  { key: 'open_timestamp', label: 'Opened', format: 'date', defaultVisible: true },
  { key: 'duration', label: 'Duration', format: 'duration' },
  { key: 'stop_loss_abs', label: 'Stoploss', format: 'price' },
];

const closedTradeColumns: ColumnDef[] = [
  { key: 'botName', label: 'Bot' },
  { key: 'trade_id', label: 'ID', format: 'integer', defaultVisible: true },
  { key: 'pair', label: 'Pair', defaultVisible: true },
  { key: 'side', label: 'Side' },
  { key: 'max_stake_amount', label: 'Stake', format: 'stake' },
  { key: 'open_rate', label: 'Open rate', format: 'price' },
  { key: 'close_rate', label: 'Close rate', format: 'price' },
  { key: 'profit_ratio', label: 'Profit %', format: 'percent', tone: true, defaultVisible: true },
  { key: 'profit_abs', label: 'Profit', format: 'stake', tone: true, defaultVisible: true },
  { key: 'enter_tag', label: 'Enter tag' },
  { key: 'exit_reason', label: 'Exit reason', defaultVisible: true },
  { key: 'open_timestamp', label: 'Opened', format: 'date' },
  { key: 'close_timestamp', label: 'Closed', format: 'date', defaultVisible: true },
  { key: 'duration', label: 'Duration', format: 'duration', defaultVisible: true },
];

function groupChart(
  key: string,
  label: string,
  groupBy: (r: Row) => string,
  metric: 'profit_abs' | 'count' | 'stake_amount' = 'profit_abs',
): ChartViewDef {
  return {
    key,
    label,
    kinds: ['bar', 'pie', 'donut'],
    build: (rows) => {
      const groups = new Map<string, number>();
      rows.forEach((r) => {
        const k = groupBy(r) || '(none)';
        const v = metric === 'count' ? 1 : ((r[metric] as number) ?? 0);
        groups.set(k, (groups.get(k) ?? 0) + v);
      });
      const entries = [...groups.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
      return {
        x: entries.map((e) => e[0]),
        series: [{ name: label, data: entries.map((e) => e[1]) }],
        valueFormat: metric === 'count' ? 'integer' : 'stake',
      };
    },
  };
}

const tradeKpis: KpiDef[] = [
  {
    key: 'count',
    label: 'Trades',
    format: 'integer',
    icon: 'i-mdi-swap-horizontal',
    defaultVisible: true,
  },
  {
    key: 'profit',
    label: 'Profit',
    format: 'stake',
    tone: true,
    icon: 'i-mdi-cash',
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
  { key: 'best', label: 'Best trade', format: 'percent', tone: true, icon: 'i-mdi-arrow-up-bold' },
  {
    key: 'worst',
    label: 'Worst trade',
    format: 'percent',
    tone: true,
    icon: 'i-mdi-arrow-down-bold',
  },
  { key: 'avgDuration', label: 'Avg duration', format: 'duration', icon: 'i-mdi-timer-outline' },
  { key: 'longs', label: 'Longs', format: 'integer', icon: 'i-mdi-trending-up' },
  { key: 'shorts', label: 'Shorts', format: 'integer', icon: 'i-mdi-trending-down' },
];

/** Open trades: the trade count is compared to max_open_trades in gauges. */
const openTradeKpis: KpiDef[] = tradeKpis.map((k) =>
  k.key === 'count' ? { ...k, label: 'Open trades', max: () => openTradeGaugeMax() } : k,
);

function tradeKpiValues(rows: Row[]) {
  const profits = rows.map((r) => (r.profit_abs as number) ?? 0);
  const ratios = rows.map((r) => (r.profit_ratio as number) ?? 0);
  const wins = profits.filter((p) => p > 0).length;
  return {
    count: rows.length,
    profit: sum(profits),
    winrate: rows.length ? wins / rows.length : null,
    avgProfit: rows.length ? sum(ratios) / rows.length : null,
    best: rows.length ? Math.max(...ratios) : null,
    worst: rows.length ? Math.min(...ratios) : null,
    avgDuration: rows.length ? sum(rows.map((r) => r.duration as number)) / rows.length : null,
    longs: rows.filter((r) => r.side === 'Long').length,
    shorts: rows.filter((r) => r.side === 'Short').length,
  };
}

const tradeList = {
  title: (r: Row) => `${r.pair}`,
  subtitle: (r: Row) =>
    [r.side, r.exit_reason || r.enter_tag, r.botName].filter(Boolean).join(' · '),
  value: 'profit_ratio',
  secondary: 'profit_abs',
};

function aggregateSource(
  id: string,
  label: string,
  description: string,
  icon: string,
  groupLabel: string,
  groupBy: (r: Row) => string,
): DataSource {
  return {
    id,
    label,
    description,
    icon,
    category: 'Performance',
    displays: ['table', 'chart', 'list', 'leaderboard'],
    defaultDisplay: 'table',
    defaultSize: { w: 6, h: 7 },
    rank: {
      label: 'group',
      metrics: [
        { key: 'profit_abs', label: 'Profit', format: 'stake' },
        { key: 'avg_profit_ratio', label: 'Average profit %', format: 'percent' },
        { key: 'count', label: 'Trade count', format: 'integer' },
        { key: 'winrate', label: 'Win rate', format: 'percent' },
      ],
    },
    supports: { botScope: true, timeRange: true, filters: TRADE_FILTERS },
    rows: (ctx) => aggregateRows(closedTradeRows(ctx.options), groupBy),
    columns: [
      { key: 'group', label: groupLabel, defaultVisible: true },
      { key: 'count', label: 'Trades', format: 'integer', defaultVisible: true },
      { key: 'wins', label: 'Wins', format: 'integer' },
      { key: 'losses', label: 'Losses', format: 'integer' },
      { key: 'winrate', label: 'Win rate', format: 'percent', defaultVisible: true },
      {
        key: 'avg_profit_ratio',
        label: 'Avg profit %',
        format: 'percent',
        tone: true,
        defaultVisible: true,
      },
      { key: 'profit_abs', label: 'Profit', format: 'stake', tone: true, defaultVisible: true },
    ],
    list: {
      title: (r) => String(r.group),
      subtitle: (r) => `${r.count} trades · ${Math.round((r.winrate as number) * 100)}% wins`,
      value: 'profit_abs',
      secondary: 'avg_profit_ratio',
    },
    charts: [
      {
        key: 'profit',
        label: 'Profit',
        kinds: ['bar', 'pie', 'donut'],
        build: (rows) => ({
          x: rows.map((r) => String(r.group)),
          series: [{ name: 'Profit', data: rows.map((r) => r.profit_abs as number) }],
          valueFormat: 'stake',
        }),
      },
      {
        key: 'count',
        label: 'Trade count',
        kinds: ['bar', 'pie', 'donut'],
        build: (rows) => ({
          x: rows.map((r) => String(r.group)),
          series: [{ name: 'Trades', data: rows.map((r) => r.count as number) }],
          valueFormat: 'integer',
        }),
      },
      {
        key: 'winrate',
        label: 'Win rate',
        kinds: ['bar'],
        build: (rows) => ({
          x: rows.map((r) => String(r.group)),
          series: [{ name: 'Win rate', data: rows.map((r) => r.winrate as number) }],
          valueFormat: 'percent',
        }),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Profit / bots
// ---------------------------------------------------------------------------

function botSummaryRows(bots: BotSubStore[]): Row[] {
  return bots.map((bot) => {
    const p: Partial<ProfitStats> = bot.profit ?? {};
    const wins = p.winning_trades ?? 0;
    const losses = p.losing_trades ?? 0;
    return {
      _botId: bot.botId,
      botName: bot.uiBotName,
      profit_all_coin: p.profit_all_coin ?? null,
      profit_all_ratio: p.profit_all_ratio ?? null,
      profit_closed_coin: p.profit_closed_coin ?? null,
      profit_closed_ratio: p.profit_closed_ratio ?? null,
      trade_count: p.trade_count ?? null,
      closed_trade_count: p.closed_trade_count ?? null,
      open_trades: bot.openTradeCount,
      winrate: wins + losses ? wins / (wins + losses) : null,
      profit_factor: p.profit_factor ?? null,
      max_drawdown: p.max_drawdown ?? null,
      current_drawdown: p.current_drawdown ?? null,
      avg_duration: p.avg_duration ?? null,
      best_pair: p.best_pair ?? null,
      balance: bot.balance?.total ?? null,
      wins,
      losses,
    };
  });
}

function mergeTimeSummaries(results: TimeSummaryReturnValue[]): TimeSummaryRecord[] {
  const byDate = new Map<string, TimeSummaryRecord>();
  results.forEach((res) => {
    res?.data?.forEach((d) => {
      const existing = byDate.get(d.date);
      if (existing) {
        existing.abs_profit += d.abs_profit;
        existing.trade_count += d.trade_count;
        existing.starting_balance += d.starting_balance;
        existing.fiat_value += d.fiat_value;
        existing.rel_profit = existing.starting_balance
          ? existing.abs_profit / existing.starting_balance
          : existing.rel_profit;
      } else {
        byDate.set(d.date, { ...d });
      }
    });
  });
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const sources: DataSource[] = [
  // ----- Trades -----
  {
    id: 'trades.open',
    label: 'Open trades',
    description: 'Currently open positions with live profit.',
    icon: 'i-mdi-folder-open-outline',
    category: 'Trades',
    displays: ['native', 'table', 'list', 'kpi', 'chart', 'gauge', 'leaderboard', 'pivot'],
    defaultDisplay: 'native',
    defaultSize: { w: 8, h: 6 },
    groupable: true,
    supports: { botScope: true, timeRange: true, filters: ['pair', 'side', 'outcome', 'enterTag'] },
    rows: (ctx) => openTradeRows(ctx.options),
    columns: openTradeColumns,
    list: tradeList,
    kpis: openTradeKpis,
    kpiValues: tradeKpiValues,
    charts: [
      groupChart('byPair', 'Profit by pair', (r) => String(r.pair)),
      groupChart('exposure', 'Stake by pair', (r) => String(r.pair), 'stake_amount'),
      groupChart('bySide', 'Trades by side', (r) => String(r.side), 'count'),
      ...openTradeViews,
    ],
    onRowClick: selectTrade,
    native: native(() => import('@/components/ftbot/TradeList.vue')),
    nativeProps: (ctx) => ({
      trades: ctx.bots.flatMap((b) => b.openTrades),
      activeTrades: true,
      multiBotView: ctx.options.botScope !== 'selected',
      emptyText: 'Currently no open trades.',
    }),
  },
  {
    id: 'trades.closed',
    label: 'Closed trades',
    description: 'Trade history with exit reasons and realized profit.',
    icon: 'i-mdi-folder-lock-outline',
    category: 'Trades',
    displays: ['native', 'table', 'list', 'kpi', 'chart', 'gauge', 'leaderboard', 'pivot'],
    defaultDisplay: 'native',
    defaultSize: { w: 8, h: 8 },
    groupable: true,
    supports: { botScope: true, timeRange: true, filters: TRADE_FILTERS },
    rows: (ctx) => closedTradeRows(ctx.options),
    columns: closedTradeColumns,
    list: tradeList,
    kpis: tradeKpis,
    kpiValues: tradeKpiValues,
    sparkline: (rows) => cumulative([...rows].reverse().map((r) => (r.profit_abs as number) ?? 0)),
    charts: [
      {
        key: 'cumulative',
        label: 'Cumulative profit',
        kinds: ['area', 'line', 'bar'],
        build: (rows) => {
          const sorted = [...rows].reverse();
          return {
            x: sorted.map((r) => r.close_timestamp as number),
            series: [
              {
                name: 'Cumulative profit',
                data: cumulative(sorted.map((r) => (r.profit_abs as number) ?? 0)),
              },
            ],
            timeAxis: true,
            valueFormat: 'stake',
          };
        },
      },
      {
        key: 'perTrade',
        label: 'Profit per trade',
        kinds: ['bar', 'line'],
        build: (rows) => {
          const sorted = [...rows].reverse();
          return {
            x: sorted.map((r) => r.close_timestamp as number),
            series: [{ name: 'Profit', data: sorted.map((r) => (r.profit_abs as number) ?? 0) }],
            timeAxis: true,
            valueFormat: 'stake',
          };
        },
      },
      groupChart('byPair', 'Profit by pair', (r) => String(r.pair)),
      groupChart('byExit', 'Profit by exit reason', (r) => String(r.exit_reason)),
      groupChart('countByExit', 'Trades by exit reason', (r) => String(r.exit_reason), 'count'),
      groupChart(
        'winLoss',
        'Wins vs losses',
        (r) => (((r.profit_abs as number) ?? 0) > 0 ? 'Wins' : 'Losses'),
        'count',
      ),
      ...closedTradeViews,
    ],
    onRowClick: selectTrade,
    native: native(() => import('@/components/ftbot/TradeList.vue')),
    nativeProps: (ctx) => ({
      trades: ctx.bots.flatMap((b) => b.closedTrades),
      activeTrades: false,
      showFilter: true,
      multiBotView: ctx.options.botScope !== 'selected',
      emptyText: 'No closed trades so far.',
    }),
  },
  {
    id: 'trade.detail',
    label: 'Trade detail',
    description: 'Details of the trade selected in a trade list.',
    icon: 'i-mdi-file-document-outline',
    category: 'Trades',
    displays: ['native'],
    defaultDisplay: 'native',
    defaultSize: { w: 12, h: 6 },
    native: native(() => import('@/components/widgets/natives/SelectedTradeDetail.vue')),
  },
  {
    id: 'trades.mobileOpen',
    label: 'Open trades (cards)',
    description: 'Touch-friendly open trade cards, as on the phone layout.',
    icon: 'i-mdi-cards-outline',
    category: 'Trades',
    displays: ['native'],
    defaultDisplay: 'native',
    native: native(() => import('@/components/ftbot/MobileTradesList.vue')),
  },
  {
    id: 'trades.mobileHistory',
    label: 'Trade history (cards)',
    description: 'Touch-friendly closed trade cards, as on the phone layout.',
    icon: 'i-mdi-cards-variant',
    category: 'Trades',
    displays: ['native'],
    defaultDisplay: 'native',
    native: native(() => import('@/components/ftbot/MobileTradesList.vue')),
    nativeProps: () => ({ history: true }),
  },

  // ----- Performance -----
  {
    id: 'profit.summary',
    label: 'Profit summary',
    description: 'Key numbers: profit, win rate, drawdown, balance. One row per bot.',
    icon: 'i-mdi-chart-box-outline',
    category: 'Performance',
    displays: ['kpi', 'table', 'chart', 'list', 'gauge', 'leaderboard'],
    defaultDisplay: 'kpi',
    rank: {
      label: 'botName',
      metrics: [
        { key: 'profit_all_coin', label: 'Total profit', format: 'stake' },
        { key: 'profit_all_ratio', label: 'Total profit %', format: 'percent' },
        { key: 'trade_count', label: 'Trades', format: 'integer' },
        { key: 'winrate', label: 'Win rate', format: 'percent' },
      ],
    },
    defaultSize: { w: 12, h: 3 },
    supports: { botScope: true },
    load: async (ctx) => {
      await Promise.all(ctx.bots.map((b) => b.getProfit().catch(() => undefined)));
      return null;
    },
    refreshMs: 60_000,
    rows: (ctx) => botSummaryRows(ctx.bots),
    columns: [
      { key: 'botName', label: 'Bot', defaultVisible: true },
      {
        key: 'profit_all_coin',
        label: 'Total profit',
        format: 'stake',
        tone: true,
        defaultVisible: true,
      },
      {
        key: 'profit_all_ratio',
        label: 'Total %',
        format: 'percent',
        tone: true,
        defaultVisible: true,
      },
      { key: 'profit_closed_coin', label: 'Closed profit', format: 'stake', tone: true },
      { key: 'trade_count', label: 'Trades', format: 'integer', defaultVisible: true },
      { key: 'open_trades', label: 'Open', format: 'integer', defaultVisible: true },
      { key: 'winrate', label: 'Win rate', format: 'percent', defaultVisible: true },
      { key: 'profit_factor', label: 'Profit factor', format: 'number' },
      { key: 'max_drawdown', label: 'Max drawdown', format: 'percent' },
      { key: 'current_drawdown', label: 'Current drawdown', format: 'percent' },
      { key: 'avg_duration', label: 'Avg duration' },
      { key: 'best_pair', label: 'Best pair' },
      { key: 'balance', label: 'Balance', format: 'stake', defaultVisible: true },
    ],
    list: {
      title: (r) => String(r.botName),
      subtitle: (r) => `${r.trade_count ?? 0} trades · ${r.open_trades} open`,
      value: 'profit_all_coin',
      secondary: 'profit_all_ratio',
    },
    kpis: [
      {
        key: 'profit',
        label: 'Total profit',
        format: 'stake',
        tone: true,
        icon: 'i-mdi-cash-multiple',
        defaultVisible: true,
      },
      {
        key: 'profitRatio',
        label: 'Total profit %',
        format: 'percent',
        tone: true,
        icon: 'i-mdi-percent-outline',
        defaultVisible: true,
      },
      {
        key: 'closedProfit',
        label: 'Closed profit',
        format: 'stake',
        tone: true,
        icon: 'i-mdi-cash-check',
      },
      {
        key: 'trades',
        label: 'Trades',
        format: 'integer',
        icon: 'i-mdi-swap-horizontal',
        defaultVisible: true,
      },
      {
        key: 'open',
        label: 'Open trades',
        format: 'integer',
        icon: 'i-mdi-folder-open-outline',
        defaultVisible: true,
        max: () => openTradeGaugeMax(),
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
        key: 'profitFactor',
        label: 'Profit factor',
        format: 'number',
        icon: 'i-mdi-scale-balance',
      },
      {
        key: 'maxDrawdown',
        label: 'Max drawdown',
        format: 'percent',
        icon: 'i-mdi-arrow-collapse-down',
        defaultVisible: true,
        max: 0.5,
        lowerIsBetter: true,
      },
      {
        key: 'currentDrawdown',
        label: 'Current drawdown',
        format: 'percent',
        icon: 'i-mdi-arrow-down-thin',
        max: 0.5,
        lowerIsBetter: true,
      },
      { key: 'balance', label: 'Balance', format: 'stake', icon: 'i-mdi-bank-outline' },
      { key: 'bestPair', label: 'Best pair', icon: 'i-mdi-star-outline' },
      { key: 'avgDuration', label: 'Avg duration', icon: 'i-mdi-timer-outline' },
    ],
    kpiValues: (rows) => {
      const wins = sum(rows.map((r) => r.wins as number));
      const losses = sum(rows.map((r) => r.losses as number));
      const ratios = rows.map((r) => r.profit_all_ratio as number).filter((v) => v !== null);
      const single = rows.length === 1 ? rows[0] : undefined;
      return {
        profit: sum(rows.map((r) => (r.profit_all_coin as number) ?? 0)),
        profitRatio: ratios.length ? sum(ratios) / ratios.length : null,
        closedProfit: sum(rows.map((r) => (r.profit_closed_coin as number) ?? 0)),
        trades: sum(rows.map((r) => (r.trade_count as number) ?? 0)),
        open: sum(rows.map((r) => r.open_trades as number)),
        winrate: wins + losses ? wins / (wins + losses) : null,
        profitFactor: (single?.profit_factor as number) ?? null,
        maxDrawdown: rows.length
          ? Math.max(...rows.map((r) => (r.max_drawdown as number) ?? 0))
          : null,
        currentDrawdown: rows.length
          ? Math.max(...rows.map((r) => (r.current_drawdown as number) ?? 0))
          : null,
        balance: sum(rows.map((r) => (r.balance as number) ?? 0)),
        bestPair: (single?.best_pair as string) ?? null,
        avgDuration: (single?.avg_duration as string) ?? null,
      };
    },
    sparkline: (_rows, ctx) =>
      cumulative(
        ctx.bots
          .flatMap((b) => b.closedTrades)
          .sort((a, b) => (a.close_timestamp ?? 0) - (b.close_timestamp ?? 0))
          .map((t) => t.profit_abs ?? 0),
      ),
    charts: [
      {
        key: 'perBot',
        label: 'Profit per bot',
        kinds: ['bar', 'pie', 'donut'],
        build: (rows) => ({
          x: rows.map((r) => String(r.botName)),
          series: [{ name: 'Profit', data: rows.map((r) => (r.profit_all_coin as number) ?? 0) }],
          valueFormat: 'stake',
        }),
      },
      radarView,
    ],
  },
  {
    id: 'period.breakdown',
    label: 'Profit by period',
    description: 'Daily, weekly or monthly profit and trade count.',
    icon: 'i-mdi-calendar-month-outline',
    category: 'Performance',
    displays: ['chart', 'table', 'native'],
    defaultDisplay: 'chart',
    defaultSize: { w: 6, h: 6 },
    supports: { botScope: true, period: true },
    load: async (ctx) => {
      const period = ctx.options.period ?? 'daily';
      const results = await Promise.all(
        ctx.bots.map((b) => {
          const p = period !== 'daily' && !b.botFeatures.weeklyMonthlyStats ? 'daily' : period;
          return b
            .getTimeSummary(p as TimeSummaryOptions, { timescale: ctx.options.periodCount ?? 30 })
            .catch(() => undefined);
        }),
      );
      return mergeTimeSummaries(results.filter(Boolean) as TimeSummaryReturnValue[]);
    },
    refreshMs: 120_000,
    rows: (ctx) => ((ctx.loaded as TimeSummaryRecord[] | null) ?? []).map((r) => ({ ...r })),
    columns: [
      { key: 'date', label: 'Date', defaultVisible: true },
      { key: 'abs_profit', label: 'Profit', format: 'stake', tone: true, defaultVisible: true },
      { key: 'rel_profit', label: 'Profit %', format: 'percent', tone: true, defaultVisible: true },
      { key: 'trade_count', label: 'Trades', format: 'integer', defaultVisible: true },
      { key: 'starting_balance', label: 'Starting balance', format: 'stake' },
      { key: 'fiat_value', label: 'Fiat value', format: 'number' },
    ],
    charts: [
      {
        key: 'absProfit',
        label: 'Profit',
        kinds: ['bar', 'line', 'area'],
        build: (rows) => ({
          x: rows.map((r) => String(r.date)),
          series: [{ name: 'Profit', data: rows.map((r) => r.abs_profit as number) }],
          valueFormat: 'stake',
        }),
      },
      {
        key: 'cumulative',
        label: 'Cumulative profit',
        kinds: ['area', 'line', 'bar'],
        build: (rows) => ({
          x: rows.map((r) => String(r.date)),
          series: [
            { name: 'Cumulative', data: cumulative(rows.map((r) => r.abs_profit as number)) },
          ],
          valueFormat: 'stake',
        }),
      },
      {
        key: 'relProfit',
        label: 'Profit %',
        kinds: ['bar', 'line'],
        build: (rows) => ({
          x: rows.map((r) => String(r.date)),
          series: [{ name: 'Profit %', data: rows.map((r) => r.rel_profit as number) }],
          valueFormat: 'percent',
        }),
      },
      {
        key: 'tradeCount',
        label: 'Trade count',
        kinds: ['bar', 'line'],
        build: (rows) => ({
          x: rows.map((r) => String(r.date)),
          series: [{ name: 'Trades', data: rows.map((r) => r.trade_count as number) }],
          valueFormat: 'integer',
        }),
      },
      {
        key: 'calendar',
        label: 'Calendar',
        kinds: ['calendar'],
        build: (rows) => ({
          type: 'calendar',
          days: rows.map((r) => [String(r.date), (r.abs_profit as number) ?? 0]),
          valueFormat: 'stake',
        }),
      },
    ],
    native: native(() => import('@/components/ftbot/PeriodBreakdown.vue')),
    nativeProps: (ctx) => ({ multiBotView: ctx.options.botScope !== 'selected' }),
  },
  aggregateSource(
    'stats.pairs',
    'Performance by pair',
    'Profit, win rate and trade count per pair (from closed trades).',
    'i-mdi-format-list-numbered',
    'Pair',
    (r) => String(r.pair),
  ),
  aggregateSource(
    'stats.exitReasons',
    'Exit reasons',
    'How trades were closed, and how profitable each exit reason is.',
    'i-mdi-exit-run',
    'Exit reason',
    (r) => String(r.exit_reason),
  ),
  aggregateSource(
    'stats.enterTags',
    'Enter tags',
    'Profitability of each entry signal tag.',
    'i-mdi-tag-outline',
    'Enter tag',
    (r) => String(r.enter_tag),
  ),
  {
    id: 'chart.cumProfit',
    label: 'Cumulative profit chart',
    description: 'The classic freqUI cumulative profit chart, including open trades.',
    icon: 'i-mdi-chart-areaspline',
    category: 'Performance',
    displays: ['native'],
    defaultDisplay: 'native',
    supports: { botScope: true },
    native: native(() => import('@/components/charts/CumProfitChart.vue')),
    nativeProps: (ctx) => ({
      trades: ctx.bots.flatMap((b) => b.trades),
      openTrades: ctx.bots.flatMap((b) => b.openTrades),
      showTitle: false,
    }),
  },
  {
    id: 'chart.profitDistribution',
    label: 'Profit distribution',
    description: 'Histogram of trade profits.',
    icon: 'i-mdi-chart-histogram',
    category: 'Performance',
    displays: ['native'],
    defaultDisplay: 'native',
    supports: { botScope: true },
    native: native(() => import('@/components/charts/ProfitDistributionChart.vue')),
    nativeProps: (ctx) => ({ trades: ctx.bots.flatMap((b) => b.trades), showTitle: false }),
  },
  {
    id: 'chart.tradesLog',
    label: 'Trades log chart',
    description: 'Every trade over time, sized by profit.',
    icon: 'i-mdi-chart-scatter-plot',
    category: 'Performance',
    displays: ['native'],
    defaultDisplay: 'native',
    supports: { botScope: true },
    native: native(() => import('@/components/charts/TradesLogChart.vue')),
    nativeProps: (ctx) => ({ trades: ctx.bots.flatMap((b) => b.trades), showTitle: false }),
  },
  {
    id: 'chart.hourly',
    label: 'Hourly profit',
    description: 'Profit and trade count by hour of day.',
    icon: 'i-mdi-clock-time-four-outline',
    category: 'Performance',
    displays: ['native'],
    defaultDisplay: 'native',
    supports: { botScope: true },
    native: native(() => import('@/components/charts/HourlyChart.vue')),
    nativeProps: (ctx) => ({ trades: ctx.bots.flatMap((b) => b.trades), showTitle: false }),
  },
  {
    id: 'chart.tradeDuration',
    label: 'Trade duration',
    description: 'Distribution of trade durations.',
    icon: 'i-mdi-timer-sand',
    category: 'Performance',
    displays: ['native'],
    defaultDisplay: 'native',
    supports: { botScope: true },
    native: native(() => import('@/components/charts/TradeDurationChart.vue')),
    nativeProps: (ctx) => ({ trades: ctx.bots.flatMap((b) => b.closedTrades), showTitle: false }),
  },
  {
    id: 'bots.comparison',
    label: 'Bot comparison',
    description: 'Compare profit and balance of all selected bots.',
    icon: 'i-mdi-robot-outline',
    category: 'Performance',
    displays: ['native'],
    defaultDisplay: 'native',
    defaultSize: { w: 8, h: 6 },
    native: native(() => import('@/components/ftbot/BotComparisonList.vue')),
  },
  {
    id: 'bot.performance',
    label: 'Bot performance tables',
    description: 'Performance by pair, enter tag, exit reason and mix tag (from the bot API).',
    icon: 'i-mdi-table-large',
    category: 'Performance',
    displays: ['native'],
    defaultDisplay: 'native',
    native: native(() => import('@/components/ftbot/BotPerformance.vue')),
  },

  // ----- Account -----
  {
    id: 'balance.currencies',
    label: 'Balance',
    description: 'Wallet balance per currency and total account value.',
    icon: 'i-mdi-bank-outline',
    category: 'Account',
    displays: ['native', 'table', 'chart', 'kpi', 'list'],
    defaultDisplay: 'native',
    defaultSize: { w: 6, h: 7 },
    supports: { botScope: true },
    load: async (ctx) => {
      await Promise.all(ctx.bots.map((b) => b.getBalance().catch(() => undefined)));
      return null;
    },
    refreshMs: 60_000,
    rows: (ctx) =>
      ctx.bots.flatMap((bot) =>
        (bot.balance?.currencies ?? []).map((c) => ({
          botName: bot.uiBotName,
          currency: c.currency,
          free: c.free,
          used: c.used,
          balance: c.balance,
          est_stake: c.est_stake,
          is_position: c.is_position,
        })),
      ),
    columns: [
      { key: 'botName', label: 'Bot' },
      { key: 'currency', label: 'Currency', defaultVisible: true },
      { key: 'free', label: 'Free', format: 'number', defaultVisible: true },
      { key: 'used', label: 'Used', format: 'number' },
      { key: 'balance', label: 'Balance', format: 'number', defaultVisible: true },
      { key: 'est_stake', label: 'Value (stake)', format: 'stake', defaultVisible: true },
    ],
    list: {
      title: (r) => String(r.currency),
      subtitle: (r) => `Free ${formatNumber(r.free as number, 6)}`,
      value: 'est_stake',
    },
    kpis: [
      {
        key: 'total',
        label: 'Total value',
        format: 'stake',
        icon: 'i-mdi-bank-outline',
        defaultVisible: true,
      },
      {
        key: 'totalBot',
        label: 'Bot managed',
        format: 'stake',
        icon: 'i-mdi-robot-outline',
        defaultVisible: true,
      },
      {
        key: 'startingCapital',
        label: 'Starting capital',
        format: 'stake',
        icon: 'i-mdi-flag-outline',
      },
      {
        key: 'change',
        label: 'Change vs start',
        format: 'percent',
        tone: true,
        icon: 'i-mdi-delta',
        defaultVisible: true,
      },
      { key: 'currencies', label: 'Currencies', format: 'integer', icon: 'i-mdi-currency-btc' },
    ],
    kpiValues: (rows, ctx) => {
      const balances = ctx.bots.map((b) => b.balance).filter(Boolean);
      const ratios = balances.map((b) => b.starting_capital_ratio).filter((v) => v !== undefined);
      return {
        total: sum(balances.map((b) => b.total ?? 0)),
        totalBot: sum(balances.map((b) => b.total_bot ?? b.total ?? 0)),
        startingCapital: sum(balances.map((b) => b.starting_capital ?? 0)),
        change: ratios.length ? sum(ratios) / ratios.length : null,
        currencies: rows.length,
      };
    },
    charts: [
      {
        key: 'allocation',
        label: 'Allocation',
        kinds: ['donut', 'pie', 'bar'],
        build: (rows) => {
          const sorted = [...rows].sort(
            (a, b) => (b.est_stake as number) - (a.est_stake as number),
          );
          return {
            x: sorted.map((r) => String(r.currency)),
            series: [{ name: 'Value', data: sorted.map((r) => r.est_stake as number) }],
            valueFormat: 'stake',
          };
        },
      },
    ],
    native: native(() => import('@/components/ftbot/BotBalance.vue')),
  },
  {
    id: 'wallet.history',
    label: 'Wallet history',
    description: 'Balance over time.',
    icon: 'i-mdi-wallet-outline',
    category: 'Account',
    displays: ['native'],
    defaultDisplay: 'native',
    supports: { botScope: true },
    native: native(() => import('@/components/charts/WalletHistoryChart.vue')),
    nativeProps: (ctx) => ({
      walletData: Object.fromEntries(
        ctx.bots.filter((b) => b.balanceHistory).map((b) => [b.botId, b.balanceHistory]),
      ),
      showTitle: false,
    }),
  },

  // ----- Market -----
  {
    id: 'chart.candles',
    label: 'Candle chart',
    description: 'Price chart of the selected pair with trades and indicators.',
    icon: 'i-mdi-chart-line',
    category: 'Market',
    displays: ['native'],
    defaultDisplay: 'native',
    defaultSize: { w: 12, h: 12 },
    native: native(() => import('@/components/widgets/natives/LiveCandleChart.vue')),
  },
  {
    id: 'chart.full',
    label: 'Chart workspace',
    description: 'The full chart page: pair selection, plot configurator and history.',
    icon: 'i-mdi-chart-timeline-variant',
    category: 'Market',
    displays: ['native'],
    defaultDisplay: 'native',
    defaultSize: { w: 12, h: 14 },
    nativeFill: true,
    native: native(() => import('@/components/charts/ChartView.vue')),
  },
  {
    id: 'pairs.summary',
    label: 'Pairs combined',
    description: 'Whitelist with open trades and locks per pair.',
    icon: 'i-mdi-view-list',
    category: 'Market',
    displays: ['native'],
    defaultDisplay: 'native',
    defaultSize: { w: 3, h: 10 },
    native: native(() => import('@/components/widgets/natives/LivePairSummary.vue')),
  },
  {
    id: 'pairlist.live',
    label: 'Pairlist',
    description: 'Current whitelist and blacklist.',
    icon: 'i-mdi-format-list-group',
    category: 'Market',
    displays: ['native', 'list', 'table'],
    defaultDisplay: 'native',
    supports: { botScope: true, filters: ['pair'] },
    rows: (ctx) => {
      const pair = ctx.options.filters?.pair?.toLowerCase();
      return ctx.bots
        .flatMap((b) => b.whitelist.map((p) => ({ pair: p, botName: b.uiBotName })))
        .filter((r) => !pair || r.pair.toLowerCase().includes(pair));
    },
    columns: [
      { key: 'pair', label: 'Pair', defaultVisible: true },
      { key: 'botName', label: 'Bot' },
    ],
    list: { title: (r) => String(r.pair), subtitle: (r) => String(r.botName) },
    native: native(() => import('@/components/ftbot/PairListLive.vue')),
  },
  {
    id: 'locks',
    label: 'Pair locks',
    description: 'Pairs that are currently locked, and why.',
    icon: 'i-mdi-lock-alert-outline',
    category: 'Market',
    displays: ['native', 'table', 'list'],
    defaultDisplay: 'native',
    supports: { botScope: true, filters: ['pair'] },
    rows: (ctx) => {
      const pair = ctx.options.filters?.pair?.toLowerCase();
      return ctx.bots
        .flatMap((b) =>
          b.activeLocks.map((l) => ({
            botName: b.uiBotName,
            pair: l.pair,
            side: l.side ?? '*',
            reason: l.reason,
            lock_timestamp: l.lock_timestamp,
            lock_end_timestamp: l.lock_end_timestamp,
          })),
        )
        .filter((r) => !pair || r.pair.toLowerCase().includes(pair));
    },
    columns: [
      { key: 'botName', label: 'Bot' },
      { key: 'pair', label: 'Pair', defaultVisible: true },
      { key: 'side', label: 'Side', defaultVisible: true },
      { key: 'reason', label: 'Reason', defaultVisible: true },
      { key: 'lock_timestamp', label: 'Since', format: 'date' },
      { key: 'lock_end_timestamp', label: 'Until', format: 'date', defaultVisible: true },
    ],
    list: {
      title: (r) => String(r.pair),
      subtitle: (r) => String(r.reason ?? ''),
      value: 'lock_end_timestamp',
    },
    native: native(() => import('@/components/ftbot/PairLockList.vue')),
  },

  // ----- Bot -----
  {
    id: 'bot.multiPane',
    label: 'Multi pane',
    description: 'Bot controls plus tabs for pairs, status, performance, balance and more.',
    icon: 'i-mdi-tab',
    category: 'Bot',
    displays: ['native'],
    defaultDisplay: 'native',
    defaultSize: { w: 3, h: 20 },
    native: native(() => import('@/components/ftbot/TradeMultiPane.vue')),
  },
  {
    id: 'bot.controls',
    label: 'Bot controls',
    description: 'Start, stop, pause, reload config and force entry.',
    icon: 'i-mdi-gamepad-variant-outline',
    category: 'Bot',
    displays: ['native'],
    defaultDisplay: 'native',
    defaultSize: { w: 4, h: 2 },
    native: native(() => import('@/components/ftbot/BotControls.vue')),
  },
  {
    id: 'bot.status',
    label: 'Bot status',
    description: 'Strategy, timeframe, stake and other bot configuration.',
    icon: 'i-mdi-information-outline',
    category: 'Bot',
    displays: ['native'],
    defaultDisplay: 'native',
    native: native(() => import('@/components/ftbot/BotStatus.vue')),
  },
  {
    id: 'logs',
    label: 'Logs',
    description: 'Latest bot log lines.',
    icon: 'i-mdi-format-list-bulleted',
    category: 'Bot',
    displays: ['native', 'table'],
    defaultDisplay: 'native',
    defaultSize: { w: 12, h: 10 },
    nativeFill: true,
    load: async (ctx) => {
      await Promise.all(ctx.bots.map((b) => b.getLogs().catch(() => undefined)));
      return null;
    },
    refreshMs: 30_000,
    rows: (ctx) =>
      ctx.bots
        .flatMap((b) =>
          b.lastLogs.map((l) => ({ time: l[1], module: l[2], level: l[3], message: l[4] })),
        )
        .reverse(),
    columns: [
      { key: 'time', label: 'Time', format: 'date', defaultVisible: true },
      { key: 'level', label: 'Level', defaultVisible: true },
      { key: 'module', label: 'Module' },
      { key: 'message', label: 'Message', defaultVisible: true },
    ],
    native: native(() => import('@/components/ftbot/LogViewer.vue')),
  },
  {
    id: 'bot.list',
    label: 'Bot list',
    description: 'All configured bots, with login and selection.',
    icon: 'i-mdi-robot-happy-outline',
    category: 'Bot',
    displays: ['native'],
    defaultDisplay: 'native',
    native: native(() => import('@/components/BotList.vue')),
  },
  {
    id: 'app.welcome',
    label: 'Welcome',
    description: 'freqUI welcome page with the bot list.',
    icon: 'i-mdi-home-outline',
    category: 'Bot',
    displays: ['native'],
    defaultDisplay: 'native',
    nativeFill: true,
    native: native(() => import('@/components/WelcomePanel.vue')),
  },

  // ----- Tools -----
  {
    id: 'backtest.workbench',
    label: 'Backtesting',
    description: 'Run backtests, load results and compare them.',
    icon: 'i-mdi-flask-outline',
    category: 'Tools',
    displays: ['native'],
    defaultDisplay: 'native',
    defaultSize: { w: 12, h: 16 },
    nativeFill: true,
    native: native(() => import('@/components/ftbot/BacktestWorkbench.vue')),
  },
  {
    id: 'tools.downloadData',
    label: 'Download data',
    description: 'Download historic candle data from the exchange.',
    icon: 'i-mdi-download',
    category: 'Tools',
    displays: ['native'],
    defaultDisplay: 'native',
    defaultSize: { w: 12, h: 14 },
    nativeFill: true,
    native: native(() => import('@/components/ftbot/DownloadDataMain.vue')),
  },
  {
    id: 'tools.pairlistConfig',
    label: 'Pairlist configurator',
    description: 'Build and test pairlist configurations.',
    icon: 'i-mdi-format-list-numbered-rtl',
    category: 'Tools',
    displays: ['native'],
    defaultDisplay: 'native',
    defaultSize: { w: 12, h: 14 },
    nativeFill: true,
    native: native(() => import('@/components/ftbot/PairlistConfigurator.vue')),
  },
  {
    id: 'analysis.recursive',
    label: 'Recursive analysis',
    description: 'Check strategy indicators for recursive formula issues.',
    icon: 'i-mdi-magnify-scan',
    category: 'Tools',
    displays: ['native'],
    defaultDisplay: 'native',
    defaultSize: { w: 12, h: 14 },
    nativeFill: true,
    native: native(() => import('@/components/ftbot/RecursiveAnalysis.vue')),
  },
  {
    id: 'analysis.lookahead',
    label: 'Lookahead analysis',
    description: 'Check the strategy for lookahead bias.',
    icon: 'i-mdi-chart-timeline-variant-shimmer',
    category: 'Tools',
    displays: ['native'],
    defaultDisplay: 'native',
    defaultSize: { w: 12, h: 14 },
    nativeFill: true,
    native: native(() => import('@/components/ftbot/LookaheadAnalysis.vue')),
  },
];

export const SOURCE_LIST: DataSource[] = [...sources, ...extraSources];

export const SOURCES: Record<string, DataSource> = Object.fromEntries(
  SOURCE_LIST.map((s) => [s.id, s]),
);

export const CATEGORIES = ['Trades', 'Performance', 'Account', 'Market', 'Bot', 'Tools'] as const;

export const DISPLAY_LABELS: Record<string, { label: string; icon: string }> = {
  native: { label: 'Classic', icon: 'i-mdi-application-outline' },
  table: { label: 'Table', icon: 'i-mdi-table' },
  chart: { label: 'Chart', icon: 'i-mdi-chart-bar' },
  kpi: { label: 'Stat tiles', icon: 'i-mdi-numeric' },
  list: { label: 'Cards', icon: 'i-mdi-view-agenda-outline' },
  gauge: { label: 'Gauges', icon: 'i-mdi-gauge' },
  leaderboard: { label: 'Leaderboard', icon: 'i-mdi-podium' },
  feed: { label: 'Activity feed', icon: 'i-mdi-timeline-text-outline' },
  pivot: { label: 'Pivot table', icon: 'i-mdi-table-pivot' },
  note: { label: 'Note', icon: 'i-mdi-note-text-outline' },
};

export const CHART_KIND_LABELS: Record<string, { label: string; icon: string }> = {
  line: { label: 'Line', icon: 'i-mdi-chart-line' },
  area: { label: 'Area', icon: 'i-mdi-chart-areaspline' },
  bar: { label: 'Bar', icon: 'i-mdi-chart-bar' },
  stackedBar: { label: 'Stacked bar', icon: 'i-mdi-chart-bar-stacked' },
  pie: { label: 'Pie', icon: 'i-mdi-chart-pie' },
  donut: { label: 'Donut', icon: 'i-mdi-chart-donut' },
  waterfall: { label: 'Waterfall', icon: 'i-mdi-chart-waterfall' },
  histogram: { label: 'Histogram', icon: 'i-mdi-chart-histogram' },
  boxplot: { label: 'Box plot', icon: 'i-mdi-chart-box-outline' },
  scatter: { label: 'Scatter', icon: 'i-mdi-chart-scatter-plot' },
  bubble: { label: 'Bubble', icon: 'i-mdi-chart-bubble' },
  heatmap: { label: 'Heatmap', icon: 'i-mdi-grid' },
  calendar: { label: 'Calendar', icon: 'i-mdi-calendar-month-outline' },
  gantt: { label: 'Timeline', icon: 'i-mdi-chart-gantt' },
  treemap: { label: 'Treemap', icon: 'i-mdi-chart-tree' },
  sunburst: { label: 'Sunburst', icon: 'i-mdi-chart-donut-variant' },
  sankey: { label: 'Sankey', icon: 'i-mdi-transit-connection-variant' },
  radar: { label: 'Radar', icon: 'i-mdi-radar' },
  band: { label: 'Range bands', icon: 'i-mdi-chart-bell-curve-cumulative' },
};

export type { SourceContext };
