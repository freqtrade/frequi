export interface ForcebuyPayload {
  pair: string;
  price?: number;
}

export interface PerformanceEntry {
  count: number;
  pair: string;
  profit: number;
  // TODO: profit_abs is mandatory after 2021.5
  profit_abs?: number;
}

export type LogLine = Array<[string, number, string, string, string]>;

export interface Logs {
  /**
   * Array of Logs
   * Log format:
   * [Formatted datetime, timestamp, Module, LogLevel, Message]
   */
  logs: LogLine[];
  log_count: number;
}

/** Values for BotState.state */
export enum BotStates {
  RUNNING = 'running',
  STOPPED = 'stopped',
  RELOAD_CONFIG = 'reload_config',
}

export enum RunModes {
  LIVE = 'live',
  DRY_RUN = 'dry_run',
  BACKTEST = 'backtest',
  EDGE = 'edge',
  HYPEROPT = 'hyperopt',
  UTIL_EXCHANGE = 'util_exchange',
  UTIL_NO_EXCHANGE = 'util_no_exchange',
  PLOT = 'plot',
  WEBSERVER = 'webserver',
  OTHER = 'other',
}

export interface BotState {
  state: BotStates;
  runmode: RunModes;
  bid_strategy: object;
  ask_strategy: object;
  dry_run: boolean;
  exchange: string;
  forcebuy_enabled: boolean;
  max_open_trades: number;
  minimal_roi: object;
  stake_amount: number;
  stake_currency: string;
  stake_currency_decimals?: number;
  available_balance?: number;
  stoploss: number;
  strategy: string;
  /** Timeframe in readable form (e.g. 5m) */
  timeframe: string;
  /** Timeframe in milliseconds */
  timeframe_ms: number;
  /** Timeframe in Minutes */
  timeframe_min: number;
  /** Given name of the bot */
  bot_name: string;

  trailing_only_offset_is_reached: boolean;
  trailing_stop: boolean;
  trailing_stop_positive: number;
  trailing_stop_positive_offset: number;
}

export interface StrategyListResult {
  strategies: string[];
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
  pairs: string[];
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

export interface SysInfoResponse {
  cpu_pct: number[];
  ram_pct: number;
}

export interface StatusResponse {
  status: string;
}

export interface DeleteTradeResponse {
  cancel_order_count: number;
  result: string;
  result_msg: string;
  trade_id: number;
}
