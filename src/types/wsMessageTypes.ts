export enum FtWsMessageTypes {
  exception = 'exception',

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

export interface FtBaseEntryExitFillMessage extends FtBaseWsMessage {
  pair: string;
  open_rate: number;
  amount: number;
  direction: string;
  // ...
}

export interface FtWhitelistMessage extends FtBaseWsMessage {
  type: FtWsMessageTypes.whitelist;
  data: string[];
}

export interface FtEntryFillMessage extends FtBaseEntryExitFillMessage {
  type: FtWsMessageTypes.entryFill;
}

export interface FtExitFillMessage extends FtBaseEntryExitFillMessage {
  type: FtWsMessageTypes.exitFill;
}

export interface FTEntryCancelMessage extends FtBaseEntryExitFillMessage {
  type: FtWsMessageTypes.entryCancel;
  reason: string;
  // ...
}

export interface FTExitCancelMessage extends FtBaseEntryExitFillMessage {
  type: FtWsMessageTypes.exitCancel;
  reason: string;
  // ...
}

export interface FtNewCandleMessage extends FtBaseWsMessage {
  type: FtWsMessageTypes.newCandle;
  /** Pair, timeframe, candletype*/
  data: [string, string, string];
  // ...
}

export interface FtErrorMessage extends FtBaseWsMessage {
  type: FtWsMessageTypes.exception;
  data: string;
}

export type FTWsMessage =
  | FtErrorMessage
  | FtWhitelistMessage
  | FtEntryFillMessage
  | FTEntryCancelMessage
  | FtExitFillMessage
  | FTExitCancelMessage
  | FtNewCandleMessage;
