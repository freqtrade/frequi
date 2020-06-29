export interface DailyInterface {
  timescale: number;
}

export interface Trade {
  trade_id: number;
  pair: string;
  is_open: boolean;
  amount: number;
  timeframe: string;
  open_rate: number;
  fee_open: number;
  fee_open_cost?: number;
  fee_open_currency?: string;

  close_rate?: number;
  close_profit?: number;
  fee_close?: number;
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
