export interface ComparisonTableItems {
  botId: string | undefined;
  botName: string;
  trades?: string;
  profitClosed: number;
  profitClosedRatio: number;
  profitOpen: number;
  profitOpenRatio: number;
  stakeCurrency: string;
  wins: number;
  losses: number;
  balance?: number;
  stakeCurrencyDecimals?: number;
}
