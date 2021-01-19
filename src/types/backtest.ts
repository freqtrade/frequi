import { Lock } from './locks';
import { Trade } from './trades';

export interface BacktestPayload {
  strategy: string;
  timerange: string;
  timeframe?: string;
  max_open_trades?: number;
  stake_amount?: number;
  enable_protections?: boolean;
}

export interface PairResult {
  draws: number;
  duration_avg: string;
  key: string;
  losses: number;
  profit_mean: number;
  profit_mean_pct: number;
  profit_sum: number;
  profit_sum_pct: number;
  profit_total_abs: number;
  profit_total_pct: number;
  profit_total: number;
  trades: number;
  wins: number;
}

export interface SellReasonResults {
  draws: number;
  losses: number;
  profit_mean: number;
  profit_mean_pct: number;
  profit_sum: number;
  profit_sum_pct: number;
  profit_total_abs: number;
  /** Total profit as ratio */
  profit_total: number;
  /** Total profit in percent */
  profit_total_pct: number;
  trades: number;
  wins: number;
}

export interface StrategyBacktestResult {
  trades: Trade[];
  locks: Lock[];
  best_pair: PairResult;
  worst_pair: PairResult;
  results_per_pair: Array<PairResult>;
  sell_reason_summary: Array<SellReasonResults>;
  left_open_trades: Trade[];
  total_trades: number;
  profit_mean: number;
  profit_total: number;
  profit_total_abs: number;

  backtest_end: string;
  backtest_end_ts: number;
  backtest_start: string;
  backtest_start_ts: number;
  backtest_days: number;
  backtest_best_day: number;
  backtest_worst_day: number;

  trades_per_day: number;
  market_change: number;
  pairlist: string[];
  stake_amount: number;
  stake_currency: string;
  max_open_trades: number;
  timeframe: string;
  timerange: string;
  strategy_name: string;
  enable_protections: boolean;
  stoploss: number;
  trailing_stop: boolean;
  trailing_stop_positive?: number;
  trailing_stop_positive_offset?: number;
  trailing_only_offset_is_reached: boolean;
  use_custom_stoploss: boolean;
  minimal_roi: Record<string, number>;
  use_sell_signal: boolean;
  sell_profit_only: boolean;
  sell_profit_offset: number;
  // Daily stats ...
  draw_days: number;
  drawdown_end: string;
  drawdown_end_ts: number;
  drawdown_start: string;
  drawdown_start_ts: number;
  loser_holding_avg: number;
  losing_days: number;
  max_drawdown: number;

  winner_holding_avg: number;
  winning_days: number;

  /** Start time of the backtest run */
  backtest_run_start_ts: number;
  /** End time of the backtest run */
  backtest_run_end_ts: number;
}

export interface BacktestResult {
  strategy: Record<string, StrategyBacktestResult>;
  strategy_comparison: Array<Record<string, string | number>>;
}
