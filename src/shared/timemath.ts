const ROUND_UP = 2;
const ROUND_DOWN = 3;

export function roundTimeframe(
  timeframems: number,
  timestamp: number,
  direction: number = ROUND_DOWN,
) {
  const offset = timestamp % timeframems;
  return timestamp - offset + (direction === ROUND_UP ? timeframems : 0);
}

export default {
  ROUND_UP,
  ROUND_DOWN,
  roundTimeframe,
};
