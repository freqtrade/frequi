export interface Lock {
  id: string;
  pair: string;
  /** Lock insertion time in the format Y-M-d HH:mm:ss */
  lock_time: string;
  /** Time of lock insertion */
  lock_timestamp: number;

  /** Lock end time in the format Y-M-d HH:mm:ss */
  lock_end_time: string;
  /** Time of lock end - will be rounded up to the next candle */
  lock_end_timestamp: number;
  reason: string;
  /** Lock side, can be long, short or '*' */
  side?: string;
  active: boolean;
}

export interface LockResponse {
  lock_count: number;
  locks: Lock[];
}
