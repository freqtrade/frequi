export interface ForcebuyPayload {
  pair: string;
  price?: number;
}

export interface PerformanceEntry {
  count: number;
  pair: string;
  profit: number;
}

export interface BalanceRecords {
  balance: number;
  currency: string;
  est_stake: number;
  free: number;
  used: number;
  stake: string;
}

export interface Logs {
  /**
   * Array of Logs
   * Log format:
   * [Formatted datetime, timestamp, Module, LogLevel, Message]
   */
  logs: Array<[string, number, string, string, string]>;
  log_count: number;
}

export interface BalanceInterface {
  currencies: Array<BalanceRecords>;
  note: string;
  /** Stake currency used */
  stake: string;
  /** Fiat symbol used */
  symbol: string;
  /** Total Balance in stake currency */
  total: number;
  /** Balance in FIAT currency */
  value: number;
}

export interface BotState {
  bid_strategy: object;
  ask_strategy: object;
  dry_run: boolean;
  exchange: string;
  forcebuy_enabled: boolean;
  max_open_trades: number;
  minimal_roi: object;
  stake_amount: number;
  stake_currency: string;
  state: string;
  stoploss: number;
  strategy: string;
  /** Timeframe in readable form (e.g. 5m) */
  timeframe: string;
  /** Timeframe in Milliseconds */
  timeframe_ms: number;

  trailing_only_offset_is_reached: boolean;
  trailing_stop: boolean;
  trailing_stop_positive: number;
  trailing_stop_positive_offset: number;
}

export interface Trade {
  trade_id: number;
  pair: string;
  is_open: boolean;
  amount: number;
  timeframe: string;
  open_rate: number;
  /** Open date in the format Y-M-d HH:mm:ss */
  open_date: string;
  open_timestamp: number;
  fee_open: number;
  fee_open_cost?: number;
  fee_open_currency?: string;

  /** Close date in the format Y-M-d HH:mm:ss */
  close_date?: string;
  close_timestamp?: number;
  close_rate?: number;
  close_profit?: number;
  close_profit_abs?: number;
  fee_close?: number;
  fee_close_cost?: number;
  fee_close_currency?: string;

  current_rate?: number;
  current_profit?: number;
  sell_reason?: string;
  min_rate?: number;
  max_rate?: number;

  stop_loss_abs: number;
  stop_loss_ratio: number;
  stop_loss_pct: number;
  stoploss_order_id?: string;
  stoploss_last_update?: string;
  stoploss_last_update_timestamp?: number;
  initial_stop_loss_abs?: number;
  initial_stop_loss_ratio?: number;
  initial_stop_loss_pct?: number;
  open_order_id?: string;
}

export interface ClosedTrade extends Trade {
  fee_open_cost: number;
  fee_open_currency: string;

  /** Close date in the format Y-M-d HH:mm:ss */
  close_date: string;
  close_timestamp: number;
  close_rate: number;
  close_profit: number;
  close_profit_abs: number;
  fee_close: number;
  fee_close_cost?: number;
  fee_close_currency?: string;

  current_rate?: number;
  sell_reason?: string;
  min_rate?: number;
  max_rate?: number;

  stop_loss_abs: number;
  stop_loss_ratio: number;
  stop_loss_pct: number;
  stoploss_order_id?: string;
  stoploss_last_update?: string;
  stoploss_last_update_timestamp?: number;
  initial_stop_loss_abs?: number;
  initial_stop_loss_ratio?: number;
  initial_stop_loss_pct?: number;
  open_order_id?: string;
}

export interface PairCandlePayload {
  pair: string;
  timeframe: string;
  limit: number;
}

export interface PairHistoryPayload extends PairCandlePayload {
  timerange: string;
}

export interface PairHistory {
  pair: string;
  columns: string[];
  data: number[];
  length: number;
  last_analyzed: number;
}

export interface IndicatorConfig {
  color?: string;
  type?: string;
}

export interface PlotConfig {
  main_plot: Record<string, IndicatorConfig>;
  subplots: Record<string, Record<string, IndicatorConfig>>;
}

// eslint-disable-next-line @typescript-eslint/camelcase
export const EMPTY_PLOTCONFIG: PlotConfig = { main_plot: {}, subplots: {} };
