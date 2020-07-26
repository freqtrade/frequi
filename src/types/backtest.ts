import { Trade } from './trades';

export interface BacktestPayload {
  strategy: string;
  timerange: string;
}

export interface BacktestResult {
  trades: Trade[];
}
