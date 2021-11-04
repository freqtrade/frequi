export interface ProfitInterface {
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
  first_trade_timestamp: number;
  latest_trade_date: string;
  latest_trade_timestamp: number;
  avg_duration: string;
  best_pair: string;
  best_rate: number;
  winning_trades: number;
  losing_trades: number;
}
