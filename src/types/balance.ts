export interface BalanceRecords {
  [key: string]: string | number;
  balance: number;
  currency: string;
  est_stake: number;
  free: number;
  used: number;
  stake: string;
}

export interface BalanceInterface {
  currencies: BalanceRecords[];
  note: string;
  /** Stake currency used */
  stake: string;
  /** Fiat symbol used */
  symbol: string;
  /** Total Balance in stake currency */
  total: number;
  /** Balance in FIAT currency */
  value: number;
  /** Assumed starting capital */
  starting_capital: number;
  /** Change between starting capital and current value */
  starting_capital_ratio: number;
  starting_capital_pct: number;
  /** Assumed starting capital in FIAT currency */
  starting_capital_fiat: number;
  /** Change between starting capital and current value in fiat */
  starting_capital_fiat_ratio: number;
  starting_capital_fiat_pct: number;
}
