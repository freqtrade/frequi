import type { ExchangeSelectPayload, MarginMode, TradingMode } from './types';

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

export interface MarketsPayload extends ExchangeSelectPayload {
  quote?: string;
  base?: string;
}

export interface Market {
  symbol: string;
  base: string;
  quote: string;
  spot: boolean;
  swap: boolean;
}

export interface Markets {
  markets: Record<string, Market>;
  exchange_id: string;
}
