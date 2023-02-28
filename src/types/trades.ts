import { TradingMode } from './types';

export interface BTOrder {
  amount: number;
  safe_price: number;
  ft_order_side: string;
  order_filled_timestamp?: number;
  ft_is_entry: boolean;
}

export interface Order extends BTOrder {
  pair: string;
  order_id: string;
  status: string;
  remaining: number | null;
  cost: number;
  filled: number | null;
  order_type: string;
  is_open: boolean;
  order_timestamp?: number;
}

interface TradeBase {
  /**
   * corresponds to the UI (ftbot.1) - does NOT relate to the backend!
   */
  botId: string;
  /**
   * Corresponds to the UI botID + tradeid. Does not relate to backend!
   */
  botTradeId: string;
  /**
   * Given bot Name (in the UI). Does not relate to backend!
   */
  botName: string;
  trade_id: number;
  pair: string;
  base_currency?: string;
  quote_currency?: string;
  is_open: boolean;
  amount: number;
  amount_requested?: number;
  stake_amount: number;
  /** Maximum invested capital. Aggregated entry-orders without subtracting. */
  max_stake_amount?: number | null;
  strategy?: string;
  exchange?: string;
  /** Replaces buy_tag with version 2.x */
  enter_tag?: string;

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
  fee_close?: number;
  fee_close_cost?: number;
  fee_close_currency?: string;

  /** Current profit as ratio */
  profit_ratio: number;
  /** Current profit in % */
  profit_pct: number | null;
  /** Current absolute profit */
  profit_abs?: number;
  /** Absolute, realized profit */
  realized_profit?: number;

  exit_reason?: string;
  exit_order_status?: string;
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
  /** Short properties - only available in API versions 2.x and up */
  is_short?: boolean;
  leverage?: number;
  interest_rate?: number;
  liquidation_price?: number;
  funding_fees?: number;
  trading_mode?: TradingMode;
  orders?: Order[];
}

/** Open trade (and backesting) */
export interface Trade extends TradeBase {
  stoploss_current_dist?: number;
  stoploss_current_dist_ratio?: number;
  stoploss_current_dist_pct?: number;
  stoploss_entry_dist?: number;
  stoploss_entry_dist_ratio?: number;
  current_rate?: number;

  total_profit_abs?: number;
  total_profit_fiat?: number;
}

export interface ClosedTrade extends TradeBase {
  fee_open_cost: number;
  fee_open_currency: string;

  /** Close date in the format Y-M-d HH:mm:ss */
  close_date: string;
  close_timestamp: number;
  close_rate: number;

  fee_close: number;
  fee_close_cost?: number;
  fee_close_currency?: string;

  sell_reason: string;
  min_rate: number;
  max_rate: number;
}

export interface TradeResponse {
  trades: ClosedTrade[];
  offset: number;
  /** Trades count for this response */
  trades_count: number;
  /** Total trade count */
  total_trades: number;
}
