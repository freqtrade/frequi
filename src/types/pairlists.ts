export interface PairlistsResponse {
  pairlists: Pairlist[];
}

export interface PairlistEvalResponse {
  error?: string;
  status: string;
  result?: {
    method: string[];
    whitelist: string[];
  };
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
}
