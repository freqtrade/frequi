import type { BackgroundTaskResult } from './backgroundtasks';
import type { WhitelistResponse } from './blacklist';
import type { ExchangeSelectPayload } from './types';

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
  showParameters: boolean;
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
  list = 'list',
}

export type PairlistParamValue = string | number | boolean | string[];

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

export interface ListPairlistParameter extends PairlistParameterBase {
  type: PairlistParamType.list;
  value?: string[];
  default: string;
}

export type PairlistParameter =
  | StringPairlistParameter
  | NumberPairlistParameter
  | BooleanPairlistParameter
  | OptionPairlistParameter
  | ListPairlistParameter;

export interface PairlistPayloadItem {
  method: string;
  [key: string]: string | number | boolean;
}

export interface PairlistsPayload extends ExchangeSelectPayload {
  pairlists: PairlistPayloadItem[];
  blacklist: string[];
  stake_currency: string;
}
