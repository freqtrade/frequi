interface BaseStatsModel {
  profit_ratio: number;
  profit_pct: number;
  profit_abs: number;
  count: number;
}

export interface PerformanceEntry extends BaseStatsModel {
  pair: string;
  profit: number;
}

export interface EntryStats extends BaseStatsModel {
  enter_tag: string;
}

export interface ExitStats extends BaseStatsModel {
  exit_reason: string;
}

export interface MixTagStats extends BaseStatsModel {
  mix_tag: string;
}
