export interface LookaheadAnalysisPayload {
  strategy: string;
  timeframe?: string;
  timerange?: string;
  minimum_trade_amount: number;
  targeted_trade_amount: number;
  lookahead_allow_limit_orders: boolean;
}

export interface LookaheadAnalysis {
  status: string;
  running: boolean;
  status_msg: string;
  result: LookaheadResult;
}

export interface LookaheadResult {
  strategy: string;
  has_bias: boolean;
  total_signals: number;
  biased_entry_signals: number;
  biased_exit_signals: number;
  biased_indicators: string[];
}

export interface RecursiveAnalysisPayload {
  strategy: string;
  timeframe?: string;
  timerange?: string;
  startup_candle?: number[];
}

export interface RecursiveAnalysis {
  status: string;
  running: boolean;
  status_msg: string;
  result: RecursiveResult;
}

export interface RecursiveResult {
  strategy: string;
  startup_candles: number[];
  strategy_scc: number;
  results: RecursiveResults;
}

export interface RecursiveResults {
  // {Indicator: {
  //   "candleCount": number,
  // }}
  [key: string]: { [key: string]: number };
}
