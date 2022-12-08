export enum FtWsMessageTypes {
  whitelist = 'whitelist',
  entryFill = 'entry_fill',
  entryCancel = 'entry_cancel',

  exitFill = 'exit_fill',
  exitCancel = 'exit_cancel',
  newCandle = 'new_candle',
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

export interface FTEntryCancelMessage extends FtBaseWsMessage {
  type: FtWsMessageTypes.entryCancel;
  pair: string;
  reason: string;
  direction: string;
  // ...
}

export interface FTExitCancelMessage extends FtBaseWsMessage {
  type: FtWsMessageTypes.exitCancel;
  pair: string;
  reason: string;
  direction: string;
  // ...
}

export interface FtNewCandleMessage extends FtBaseWsMessage {
  type: FtWsMessageTypes.newCandle;
  /** Pair, timeframe, candletype*/
  data: [string, string, string];
  // ...
}

export type FTWsMessage =
  | FtWhitelistMessage
  | FtEntryFillMessage
  | FTEntryCancelMessage
  | FtExitFillMessage
  | FTExitCancelMessage
  | FtNewCandleMessage;
