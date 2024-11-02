import { MarginMode, TradingMode } from './types';

export interface DownloadDataPayload {
  pairs: string[];
  exchange?: string;
  trading_mode?: TradingMode;
  margin_mode?: MarginMode;
  stake_currency: string;
  timeframes: string[];
  timerange?: string;
  days?: number;
}
