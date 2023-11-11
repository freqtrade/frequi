export interface PerformanceEntry {
  count: number;
  pair: string;
  profit: number;
  // TODO: profit_abs is mandatory after 2021.5
  profit_abs?: number;
}

export interface EntryStats {
  enter_tag: string;
  profit_ratio: number;
  profit_pct: number;
  profit_abs: number;
  count: number;
}

export interface ExitStats {
  exit_reason: string;
  profit_ratio: number;
  profit_pct: number;
  profit_abs: number;
  count: number;
}

export interface MixTagStats {
  mix_tag: string;
  profit: number;
  profit_pct: number;
  profit_abs: number;
  count: number;
}
