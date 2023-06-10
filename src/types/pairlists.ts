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

export type PairlistParamValue = string | number | boolean;

interface PairlistParameterBase {
  description: string;
  help: string;
  type: PairlistParamType;
}

export interface StringPairlistParameter extends PairlistParameterBase {
  type: PairlistParamType.string;
  value?: string;
  default: string;
}

export interface NumberPairlistParameter extends PairlistParameterBase {
  type: PairlistParamType.number;
  value?: number;
  default: number;
}

export interface BooleanPairlistParameter extends PairlistParameterBase {
  type: PairlistParamType.boolean;
  value?: boolean;
  default: boolean;
}

export interface OptionPairlistParameter extends PairlistParameterBase {
  type: PairlistParamType.option;
  options: string[];
  value?: string;
  default: string;
}

export type PairlistParameter =
  | StringPairlistParameter
  | NumberPairlistParameter
  | BooleanPairlistParameter
  | OptionPairlistParameter;

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
