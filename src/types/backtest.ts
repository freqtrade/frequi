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
  best_pair: PairResult;
  worst_pair: PairResult;
  left_open_trades: Trade[];
  backtest_best_day: number;
  backtest_days: number;
  backtest_end: string;
  backtest_end_ts: number;
  backtest_start: string;
  backtest_start_ts: number;
  backtest_worst_day: number;
  draw_days: number;
  drawdown_end: string;
  drawdown_end_ts: number;
  drawdown_start: string;
  drawdown_start_ts: number;
  loser_holding_avg: number;
  losing_days: number;
  market_change: number;
  max_drawdown: number;
  pairlist: string[];
  results_per_pair: Array<PairResult>;
  sell_reason_summary: Array<SellReasonResults>;
  stake_amount: number;
  stake_currency: string;
  max_open_trades: number;
  timeframe: string;
  total_trades: number;
  profit_mean: number;
  profit_total: number;
  profit_total_abs: number;
  trades_per_day: number;
  winner_holding_avg: number;
  winning_days: number;
}

export interface BacktestResult {
  strategy: Record<string, StrategyBacktestResult>;
  strategy_comparison: Array<Record<string, string | number>>;
}
