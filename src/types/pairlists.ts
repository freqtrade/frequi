import { BackgroundTaskResult } from './backgroundtasks';
import { WhitelistResponse } from './blacklist';
import { MarginMode, TradingMode } from './types';

export interface PairlistsResponse {
  pairlists: Pairlist[];
}

export interface PairlistEvalResponse extends BackgroundTaskResult {
  result: WhitelistResponse;
}

export interface Pairlist {
  id?: string;
  is_pairlist_generator: boolean;
  name: string;
  description: string;
  params: Record<string, PairlistParameter>;
}

export interface PairlistConfig {
  name: string;
  blacklist: string[];
  pairlists: Pairlist[];
}

export enum PairlistParamType {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  option = 'option',
}

export interface PairlistParameter {
  description: string;
  help: string;
  type: PairlistParamType;
  value?: string;
  default: string;
  options?: string[];
}

export interface PairlistPayloadItem {
  method: string;
  [key: string]: string | number | boolean;
}

export interface PairlistsPayload {
  pairlists: PairlistPayloadItem[];
  blacklist: string[];
  stake_currency: string;
  exchange?: string;
  trading_mode?: TradingMode;
  margin_mode?: MarginMode;
}
