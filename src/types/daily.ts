export enum TimeSummaryOptions {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
}
export interface TimeSummaryPayload {
  timescale?: number;
}

export interface TimeSummaryRecord {
  /** Date in the format yyyy-mm-dd */
  [key: string]: string | number;
  date: string;
  abs_profit: number;
  /** added in  2.16*/
  rel_profit: number;
  starting_balance_profit: number;
  fiat_value: number;
  trade_count: number;
}

export interface TimeSummaryReturnValue {
  data: TimeSummaryRecord[];
  fiat_display_currency: string;
  stake_currency: string;
}
