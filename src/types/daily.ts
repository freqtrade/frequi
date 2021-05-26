export interface DailyPayload {
  timescale?: number;
}

export interface DailyRecord {
  /** Date in the format yyyy-mm-dd */
  [key: string]: string | number;
  date: string;
  abs_profit: number;
  fiat_value: number;
  trade_count: number;
}

export interface DailyReturnValue {
  data: DailyRecord[];
  fiat_display_currency: string;
  stake_currency: string;
}
