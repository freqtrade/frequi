export enum FtWsMessageTypes {
  whitelist = 'whitelist',
  entryFill = 'entry_fill',
  exitFill = 'exit_fill',
  newCandle = 'newCandle',
}

export interface FtBaseWsMessage {
  type: FtWsMessageTypes;
}

export interface FtWhitelistMessage extends FtBaseWsMessage {
  type: FtWsMessageTypes.whitelist;
  data: string[];
}

export interface FtEntryFillMessage extends FtBaseWsMessage {
  type: FtWsMessageTypes.entryFill;
  pair: string;
  open_rate: number;
  amount: number;
  // ...
}
export interface FtExitFillMessage extends FtBaseWsMessage {
  type: FtWsMessageTypes.exitFill;
  pair: string;
  open_rate: number;
  amount: number;
  // ...
}

export interface FtNewCandleMessage extends FtBaseWsMessage {
  type: FtWsMessageTypes.newCandle;
  // ...
}

export type FTWsMessage =
  | FtWhitelistMessage
  | FtEntryFillMessage
  | FtExitFillMessage
  | FtNewCandleMessage;
