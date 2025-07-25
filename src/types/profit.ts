export interface ProfitStats {
  profit_closed_coin: number;
  profit_closed_percent_mean: number;
  profit_closed_ratio_mean: number;
  /** Deprecated, (wrong calculation) do not use */
  profit_closed_percent_sum: number;
  /** Deprecated, (wrong calculation) do not use */
  profit_closed_ratio_sum: number;
  profit_closed_fiat: number;
  /** Closed profit ratio - calculated against starting balance */
  profit_closed_ratio: number;
  /** Closed profit percent - calculated against starting balance */
  profit_closed_percent: number;
  profit_all_coin: number;
  profit_all_percent_mean: number;
  profit_all_ratio_mean: number;
  /** Deprecated, (wrong calculation) do not use */
  profit_all_percent_sum: number;
  /** Deprecated, (wrong calculation) do not use */
  profit_all_ratio_sum: number;
  /** all profit ratio - calculated against starting balance */
  profit_all_ratio: number;
  /** all profit percent - calculated against starting balance */
  profit_all_percent: number;
  profit_all_fiat: number;
  trade_count: number;
  closed_trade_count: number;
  first_trade_date: string;
  first_trade_humanized: string;
  first_trade_timestamp: number;
  latest_trade_date: string;
  latest_trade_humanized: string;
  latest_trade_timestamp: number;
  avg_duration: string;
  best_pair: string;
  /** DO NOT USE, this is rounded pct */
  best_rate: number;
  best_pair_profit_ratio: number;

  best_pair_profit_abs?: number;
  winning_trades: number;
  losing_trades: number;
  profit_factor?: number;
  max_drawdown?: number;
  max_drawdown_abs?: number;
  max_drawdown_start?: string;
  max_drawdown_start_timestamp?: number;
  max_drawdown_end?: string;
  max_drawdown_end_timestamp?: number;
  /** Current drawdown we're in */
  current_drawdown?: number;
  current_drawdown_abs?: number;
  current_drawdown_high?: number;
  current_drawdown_start?: string;
  current_drawdown_start_timestamp?: number;
  trading_volume?: number;
  /** Initial bot start date*/
  bot_start_timestamp?: number;
  bot_start_date?: string;
  winrate?: number;
  expectancy?: number;
  expectancy_ratio?: number;
}

export interface AllProfitStats {
  all: ProfitStats;
  short?: ProfitStats;
  long?: ProfitStats;
}
