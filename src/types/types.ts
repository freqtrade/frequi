export enum OrderSides {
  long = 'long',
  short = 'short',
}

export interface ForceEnterPayload {
  pair: string;
  side?: OrderSides;
  price?: number;
  ordertype?: string;
  stakeamount?: number;
}

export interface ForceSellPayload {
  tradeid: string;
  ordertype?: string;
}

/** Interface only used internally to ensure the right bot is being called in a multibot environment. */
export interface MultiForcesellPayload extends ForceSellPayload {
  botId: string;
}

/** Interface only used internally to ensure the right bot is being called in a multibot environment. */
export interface MultiDeletePayload {
  tradeid: string;
  botId: string;
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

export interface UnfilledTimeout {
  buy: number;
  sell: number;
  unit: string;
  exit_timeout_count: number;
}

export interface OrderTypes {
  buy: string;
  sell: string;
  emergencysell?: string;
  forcesell?: string;
  forcebuy?: string;
  stoploss: string;
  stoploss_on_exchange: boolean;
  stoploss_on_exchange_interval: number;
}

export interface PriceBase {
  price_side: string;
  use_order_book: boolean;
  order_book_top: number;
}

export interface AskStrategy extends PriceBase {
  bid_last_balance?: number;
}

export interface BidStrategy extends PriceBase {
  ask_last_balance?: number;
  check_depth_of_market: object;
}

export interface BotState {
  version: string;
  strategy_version?: string;
  /** Api version - was not provided prior to 1.1 (or 2021.11) */
  api_version?: number;
  dry_run: boolean;
  trading_mode?: string;
  short_allowed?: boolean;
  state: BotStates;
  runmode: RunModes;
  bid_strategy: BidStrategy;
  ask_strategy: AskStrategy;
  unfilledtimeout: UnfilledTimeout;
  order_types: OrderTypes;
  exchange: string;
  forcebuy_enabled: boolean;
  max_open_trades: number;
  minimal_roi: object;
  stake_amount: string;
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

  position_adjustment_enable?: boolean;
  max_entry_position_adjustment?: number;
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
  limit?: number;
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

  /** Number of long entry signals in this response */
  enter_long_signals?: number;
  /** Number of long exit signals in this response */
  exit_long_signals?: number;
  /** Number of short entry signals in this response */
  enter_short_signals?: number;
  /** Number of short exit signals in this response */
  exit_short_signals?: number;

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

export interface HealthResponse {
  last_process: string;
  last_process_ts: number;
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

export interface UiVersion {
  version: string;
}

export type LoadingStatus = 'loading' | 'success' | 'error';
