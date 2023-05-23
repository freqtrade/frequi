export interface BalanceRecords {
  balance: number;
  currency: string;
  est_stake: number;
  est_stake_bot?: number;
  free: number;
  used: number;
  bot_owned?: number;
  stake: string;
  // Properties added in v 2.x
  side: string;
  leverage: number;
  is_position: boolean;
  position: number;
  is_bot_managed?: boolean;
}

export interface BalanceInterface {
  currencies: BalanceRecords[];
  note: string;
  /** Stake currency used */
  stake: string;
  /** Fiat symbol used */
  symbol: string;
  /** Total Account Balance in stake currency */
  total: number;
  /** Total Bot Balance in stake currency */
  total_bot?: number;
  /** Account Balance in FIAT currency */
  value: number;
  /** Bot Balance in FIAT currency */
  value_bot?: number;
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

export interface BalanceValues {
  [key: string]: number | string;
  balance: number;
  currency: string;
  est_stake: number;
  free: number;
  used: number;
  stake: string;
}
