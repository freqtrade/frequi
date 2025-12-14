export type ThemeName = 'bootstrap' | 'bootstrap_dark' | 'light' | 'dark';

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
  entry_tag?: string;
  leverage?: number;
}

export interface ForceExitPayload {
  tradeid: string | number;
  ordertype?: string;
  amount?: number;
  /* Available starting with v2.44 */
  price?: number;
}

/** Interface only used internally to ensure the right bot is being called in a multibot environment. */
export interface MultiForceExitPayload extends ForceExitPayload {
  botId: string;
}

/** Interface only used internally to ensure the right bot is being called in a multibot environment. */
export interface MultiBotIdPayload {
  tradeid: string;
  botId: string;
}

export type MultiDeletePayload = MultiBotIdPayload;
export type MultiReloadTradePayload = MultiBotIdPayload;
export type MultiCancelOpenOrderPayload = MultiBotIdPayload;

/**
 * Response from the Logs endpoint
 * [0] FormattedDate
 * [1] Timestamp
 * [2] Module
 * [3] LogLevel
 * [4] Message
 */
export type LogLine = [string, number, string, string, string];

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

export enum TradingMode {
  SPOT = 'spot',
  MARGIN = 'margin',
  FUTURES = 'futures',
}

export enum MarginMode {
  NONE = '',
  ISOLATED = 'isolated',
  // CROSS = 'cross',
}

export interface UnfilledTimeout {
  /** @deprecated replaced by entry in 2.x */
  buy?: number;
  entry?: number;
  /** @deprecated replaced by exit in 2.x */
  sell?: number;
  exit?: number;
  unit: string;
  exit_timeout_count: number;
}

export interface OrderTypes {
  /** @deprecated Replaced by entry in 2.x */
  buy?: string;
  /** @deprecated Replaced by exit in 2.x */
  sell?: string;
  forcesell?: string;
  forcebuy?: string;
  emergencysell?: string;
  entry?: string;
  exit?: string;
  emergency_exit?: string;
  force_exit?: string;
  force_entry?: string;
  stoploss: string;
  stoploss_on_exchange: boolean;
  stoploss_on_exchange_interval: number;
}

export interface PriceBase {
  price_side: string;
  use_order_book: boolean;
  order_book_top: number;
  price_last_balance?: number;
}

export type ExitPricing = PriceBase;

export interface EntryPricing extends PriceBase {
  check_depth_of_market: object;
}

export interface BotState {
  version: string;
  strategy_version?: string;
  api_version: number;
  dry_run: boolean;
  /** Futures, margin or spot */
  trading_mode?: TradingMode;
  margin_mode?: MarginMode;
  short_allowed?: boolean;
  state: BotStates;
  runmode: RunModes;
  bid_strategy?: EntryPricing;
  ask_strategy?: ExitPricing;
  entry_pricing?: EntryPricing;
  exit_pricing?: ExitPricing;
  unfilledtimeout: UnfilledTimeout;
  order_types: OrderTypes;
  exchange: string;
  force_entry_enable?: boolean;
  max_open_trades: number;
  minimal_roi: object;
  stake_amount: string;
  stake_currency: string;
  stake_currency_decimals?: number;
  available_balance?: number;
  strategy: string;
  /** Timeframe in readable form (e.g. 5m) */
  timeframe: string;
  /** Timeframe in milliseconds */
  timeframe_ms: number;
  /** Timeframe in Minutes */
  timeframe_min: number;
  /** Given name of the bot */
  bot_name: string;

  stoploss: number;
  stoploss_on_exchange?: boolean;
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
  timeframe: string;
}

export interface FreqAIModelListResult {
  freqaimodels: string[];
}

export interface HyperoptLossObj {
  name: string;
  description: string;
}

export interface HyperoptLossListResponse {
  loss_functions: HyperoptLossObj[];
}

export interface SysInfoResponse {
  cpu_pct: number[];
  ram_pct: number;
}

export interface HealthResponse {
  last_process: string;
  last_process_ts: number;
  bot_start: string;
  bot_start_ts: number;
  bot_startup: string;
  bot_startup_ts: number;
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

export enum LoadingStatus {
  not_loaded,
  loading,
  success,
  error,
}

export interface ExchangeSelectPayload {
  exchange?: string;
  trading_mode?: TradingMode;
  margin_mode?: MarginMode;
}
