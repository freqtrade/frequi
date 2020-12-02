export interface BalanceRecords {
  balance: number;
  currency: string;
  est_stake: number;
  free: number;
  used: number;
  stake: string;
}

export interface BalanceInterface {
  currencies: Array<BalanceRecords>;
  note: string;
  /** Stake currency used */
  stake: string;
  /** Fiat symbol used */
  symbol: string;
  /** Total Balance in stake currency */
  total: number;
  /** Balance in FIAT currency */
  value: number;
}
