export interface BlacklistPayload {
  blacklist: Array<string>;
}

export interface BlacklistErrMsg {
  error_msg: string;
}

export interface BlacklistResponse {
  method: Array<string>;
  length: number;
  blacklist: Array<string>;
  errors: Record<string, BlacklistErrMsg>;
}

export interface WhitelistResponse {
  method: Array<string>;
  length: number;
  whitelist: Array<string>;
}
