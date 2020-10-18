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
  /** Timeframe in milliseconds */
  timeframe_ms: number;
  /** Timeframe in Minutes */
  timeframe_min: number;

  trailing_only_offset_is_reached: boolean;
  trailing_stop: boolean;
  trailing_stop_positive: number;
  trailing_stop_positive_offset: number;
}

export interface StrategyListResult {
  strategies: Array<string>;
}

export interface StrategyResult {
  /** Strategy name */
  strategy: string;
  /** Code of the strategy class */
  code: string;
}

export interface AvailablePairPayload {
  timeframe?: string;
  stake_currency?: string;
}

export interface AvailablePairResult {
  pairs: Array<string>;
  /**
   * List of lists, as [pair, timeframe]
   */
  pair_interval: Array<Array<string>>;
  length: number;
}

export interface PairCandlePayload {
  pair: string;
  timeframe: string;
  limit: number;
}

export interface PairHistoryPayload {
  pair: string;
  timeframe: string;
  timerange: string;
  strategy: string;
}

export interface PairHistory {
  strategy: string;
  pair: string;
  timeframe: string;
  timeframe_ms: number;
  columns: string[];
  data: number[];
  length: number;
  /** Number of buy signals in this response */
  buy_signals: number;
  /** Number of sell signals in this response */
  sell_signals: number;
  last_analyzed: number;
  /** Data start date in as millisecond timestamp */
  data_start_ts: number;
  /** Data start date in in the format YYYY-MM-DD HH24:MI:SS+00:00 */
  data_start: string;
  /** End date in in the format YYYY-MM-DD HH24:MI:SS+00:00 */
  data_stop: string;
  /** Data end date in as millisecond timestamp */
  data_stop_ts: number;
}
