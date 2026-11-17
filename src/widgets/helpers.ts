import type { BotSubStore } from '@/stores/ftbotwrapper';
import type { ClosedTrade, Trade } from '@/types';
import type { Row, TimeRange, ValueFormat, WidgetFilters, WidgetOptions } from './types';

export const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'ytd', label: 'Year to date' },
];

const DAY = 24 * 60 * 60 * 1000;

/** Start timestamp (ms) of a time range, or 0 for "all". */
export function timeRangeStart(range: TimeRange, now = Date.now()): number {
  switch (range) {
    case '24h':
      return now - DAY;
    case '7d':
      return now - 7 * DAY;
    case '30d':
      return now - 30 * DAY;
    case '90d':
      return now - 90 * DAY;
    case 'ytd':
      return new Date(new Date(now).getFullYear(), 0, 1).getTime();
    default:
      return 0;
  }
}

export function defaultOptions(partial: Partial<WidgetOptions> = {}): WidgetOptions {
  return {
    botScope: 'selected',
    timeRange: 'all',
    filters: {},
    ...partial,
  };
}

/** Bots a widget reads from, based on its scope. */
export function resolveBots(options: WidgetOptions): BotSubStore[] {
  const botStore = useBotStore();
  if (options.botScope === 'all') {
    return Object.values(botStore.botStores).filter((b) => b.isSelected);
  }
  if (options.botScope === 'bot' && options.botId && botStore.botStores[options.botId]) {
    return [botStore.botStores[options.botId] as BotSubStore];
  }
  return botStore.activeBot ? [botStore.activeBot] : [];
}

function tradeProfitAbs(t: Trade | ClosedTrade): number {
  return t.profit_abs ?? 0;
}

/** Flattens a trade into a table row, keeping the original for actions. */
export function tradeToRow(t: Trade | ClosedTrade, bot: BotSubStore): Row {
  const now = Date.now();
  const end = t.close_timestamp ?? now;
  return {
    _trade: t,
    _botId: bot.botId,
    botName: bot.uiBotName,
    trade_id: t.trade_id,
    pair: t.pair,
    side: t.is_short ? 'Short' : 'Long',
    amount: t.amount,
    stake_amount: t.stake_amount,
    max_stake_amount: t.max_stake_amount ?? t.stake_amount,
    leverage: t.leverage ?? 1,
    open_rate: t.open_rate,
    current_rate: (t as Trade).current_rate ?? null,
    close_rate: t.close_rate ?? null,
    profit_ratio: t.profit_ratio,
    profit_abs: tradeProfitAbs(t),
    enter_tag: t.enter_tag ?? '',
    exit_reason: t.exit_reason ?? '',
    open_timestamp: t.open_timestamp,
    close_timestamp: t.close_timestamp ?? null,
    duration: Math.max(0, (end - t.open_timestamp) / 1000),
    stop_loss_abs: t.stop_loss_abs,
  };
}

export function applyTradeFilters(rows: Row[], options: WidgetOptions, timeKey: string): Row[] {
  const start = timeRangeStart(options.timeRange);
  const f: WidgetFilters = options.filters ?? {};
  const pair = f.pair?.trim().toLowerCase();
  const exitReason = f.exitReason?.trim().toLowerCase();
  const enterTag = f.enterTag?.trim().toLowerCase();
  return rows.filter((r) => {
    if (start && ((r[timeKey] as number | null) ?? 0) < start) return false;
    if (pair && !String(r.pair).toLowerCase().includes(pair)) return false;
    if (f.side === 'long' && r.side !== 'Long') return false;
    if (f.side === 'short' && r.side !== 'Short') return false;
    const profit = (r.profit_abs as number) ?? 0;
    if (f.outcome === 'win' && profit <= 0) return false;
    if (f.outcome === 'loss' && profit >= 0) return false;
    if (exitReason && !String(r.exit_reason).toLowerCase().includes(exitReason)) return false;
    if (enterTag && !String(r.enter_tag).toLowerCase().includes(enterTag)) return false;
    return true;
  });
}

export function openTradeRows(options: WidgetOptions): Row[] {
  const rows = resolveBots(options).flatMap((bot) => bot.openTrades.map((t) => tradeToRow(t, bot)));
  return applyTradeFilters(rows, options, 'open_timestamp');
}

export function closedTradeRows(options: WidgetOptions): Row[] {
  const rows = resolveBots(options).flatMap((bot) =>
    bot.closedTrades.map((t) => tradeToRow(t, bot)),
  );
  return applyTradeFilters(rows, options, 'close_timestamp').sort(
    (a, b) => ((b.close_timestamp as number) ?? 0) - ((a.close_timestamp as number) ?? 0),
  );
}

/** Groups rows by a key and sums profit / counts wins. */
export function aggregateRows(rows: Row[], key: (r: Row) => string): Row[] {
  const groups = new Map<
    string,
    { profit_abs: number; count: number; wins: number; ratio: number }
  >();
  rows.forEach((r) => {
    const k = key(r) || '(none)';
    const g = groups.get(k) ?? { profit_abs: 0, count: 0, wins: 0, ratio: 0 };
    const p = (r.profit_abs as number) ?? 0;
    g.profit_abs += p;
    g.count += 1;
    g.wins += p > 0 ? 1 : 0;
    g.ratio += (r.profit_ratio as number) ?? 0;
    groups.set(k, g);
  });
  return [...groups.entries()]
    .map(([group, g]) => ({
      group,
      profit_abs: g.profit_abs,
      count: g.count,
      wins: g.wins,
      losses: g.count - g.wins,
      winrate: g.count ? g.wins / g.count : 0,
      avg_profit_ratio: g.count ? g.ratio / g.count : 0,
    }))
    .sort((a, b) => b.profit_abs - a.profit_abs);
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

export function cumulative(values: number[]): number[] {
  let acc = 0;
  return values.map((v) => (acc += v));
}

/** Formats a value for display. */
export function formatValue(value: unknown, format: ValueFormat = 'text', stake = ''): string {
  if (value === null || value === undefined || value === '') return '–';
  switch (format) {
    case 'number':
      return formatNumber(value as number, 4);
    case 'integer':
      return formatNumber(value as number, 0);
    case 'price':
      return formatPrice(value as number);
    case 'stake':
      return formatPriceCurrency(value as number, stake, 3);
    case 'percent':
      return formatPercent(value as number, 2);
    case 'date':
      return timestampms(value as number);
    case 'duration':
      return humanizeDurationFromSeconds(value as number);
    default:
      return String(value);
  }
}

/** CSS color for a signed value (uses the user's profit / loss colors). */
export function toneColor(value: unknown): string | undefined {
  if (typeof value !== 'number' || value === 0) return undefined;
  return value > 0 ? 'var(--color-profit)' : 'var(--color-loss)';
}
