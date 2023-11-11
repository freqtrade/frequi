export interface PerformanceEntry {
  count: number;
  pair: string;
  profit: number;
  // TODO: profit_abs is mandatory after 2021.5
  profit_abs?: number;
}
