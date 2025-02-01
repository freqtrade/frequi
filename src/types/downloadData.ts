import type { ExchangeSelectPayload } from './types';

export interface DownloadDataPayload extends ExchangeSelectPayload {
  pairs: string[];
  timeframes: string[];
  timerange?: string;
  days?: number;
  erase?: boolean;
  download_trades?: boolean;
}
