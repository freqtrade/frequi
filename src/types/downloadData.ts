import type { MarginMode, TradingMode } from './types';

export interface DownloadDataPayload {
  pairs: string[];
  exchange?: string;
  trading_mode?: TradingMode;
  margin_mode?: MarginMode;
  timeframes: string[];
  timerange?: string;
  days?: number;
  erase?: boolean;
  download_trades?: boolean;
}
