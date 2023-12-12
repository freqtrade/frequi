export const ROUND_UP = 2;
export const ROUND_DOWN = 3;
/** Rounds to the closer candle starting time */
export const ROUND_CLOSER = 4;

/**
 *
 * @param timeframems timeframe in milliseconds
 * @param timestamp timestamp in milliseconds
 * @param direction Direction (see ROUND_* constants)
 * @returns timestamp in ms rounded to the timeframe
 */
export function roundTimeframe(
  timeframems: number,
  timestamp: number,
  direction: number = ROUND_DOWN,
) {
  const offset = timestamp % timeframems;
  let up = direction === ROUND_UP;
  if (direction === ROUND_CLOSER) {
    up = offset > timeframems / 2;
  }
  return timestamp - offset + (up ? timeframems : 0);
}

export default {
  ROUND_UP,
  ROUND_DOWN,
  roundTimeframe,
};
