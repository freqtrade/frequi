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
  /** Current profit as ratio */
  profit_ratio: number;
  /** Current profit in % */
  profit_pct: number;
  /** Current absolute profit */
  profit_abs: number;
  /** Deprecated */
  current_profit?: number;
  /** Deprecated */
  current_profit_abs?: number;
  /** Deprecated */
  current_profit_pct?: number;

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

  stoploss_current_dist?: number;
  stoploss_current_dist_ratio?: number;
  stoploss_current_dist_pct?: number;
  open_order_id?: string;
}

export interface ClosedTrade extends Trade {
  fee_open_cost: number;
  fee_open_currency: string;

  /** Close date in the format Y-M-d HH:mm:ss */
  close_date: string;
  close_timestamp: number;
  close_rate: number;
  /** Deprecated */
  close_profit: number;
  /** Deprecated */
  close_profit_abs: number;
  fee_close: number;
  fee_close_cost?: number;
  fee_close_currency?: string;

  sell_reason: string;
  min_rate: number;
  max_rate: number;
}

export interface Lock {
  pair: string;
  /** Lock insertion time in the format Y-M-d HH:mm:ss */
  lock_time: string;
  /** Time of lock insertion */
  lock_timestamp: number;

  /** Lock end time in the format Y-M-d HH:mm:ss */
  lock_end_time: string;
  /** Time of lock end - will be rounded up to the next candle */
  lock_end_timestamp: number;
  reason: string;
  active: boolean;
}

export interface LockResponse {
  lock_count: number;
  locks: Lock[];
}
