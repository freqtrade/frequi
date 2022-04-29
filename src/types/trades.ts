import { TradingMode } from './types';

export interface Order {
  pair: string;
  order_id: string;
  status: string;
  remaining: number;
  amount: number;
  safe_price: number;
  cost: number;
  filled: number;
  ft_order_side: string;
  order_type: string;
  is_open: boolean;
  order_timestamp?: number;
  order_filled_timestamp?: number;
}

export interface Trade {
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
  strategy?: string;
  exchange?: string;
  /** @deprecated - Replaced by enter_tag with 2.x */
  buy_tag?: string;
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

  current_rate?: number;
  /** Current profit as ratio */
  profit_ratio: number;
  /** Current profit in % */
  profit_pct: number | null;
  /** Current absolute profit */
  profit_abs?: number;

  /** @deprecated - replaced by exit reason 2.x */
  sell_reason?: string;
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

  stoploss_current_dist?: number;
  stoploss_current_dist_ratio?: number;
  stoploss_current_dist_pct?: number;
  open_order_id?: string;
  /** Short properties - only available in API versions 2.x and up */
  is_short?: boolean;
  leverage?: number;
  interest_rate?: number;
  funding_fees?: number;
  trading_mode?: TradingMode;
  orders?: Order[];
}

export interface ClosedTrade extends Trade {
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
  /** Trades count for this response */
  trades_count: number;
  /** Total trade count */
  total_trades: number;
}
