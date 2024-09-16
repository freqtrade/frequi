import { MarginMode, TradingMode } from './types';

export interface TradeMode {
  trading_mode: TradingMode;
  margin_mode: MarginMode;
}

export interface Exchange {
  name: string;
  valid: boolean;
  supported: boolean;
  comment: string;
  dex?: boolean;
  trade_modes: TradeMode[];
  is_alias?: boolean;
  alias_for?: string | null;
  classname?: string;
}

export interface ExchangeListResult {
  exchanges: Exchange[];
}

export interface ExchangeSelection {
  exchange: string;
  trade_mode: Partial<TradeMode>;
}
