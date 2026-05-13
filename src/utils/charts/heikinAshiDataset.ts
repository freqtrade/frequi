export function heikinAshiDataset(columns: string[], data: Array<number[]>): number[][] {
  const openIdx = columns.indexOf('open');
  const closeIdx = columns.indexOf('close');
  const highIdx = columns.indexOf('high');
  const lowIdx = columns.indexOf('low');

  let prevCandle: number[];
  return data.map((original, idx) => {
    // Prevent mutation of original data
    const candle = original.slice();
    const open = candle[openIdx] ?? 0;
    const close = candle[closeIdx] ?? 0;
    const high = candle[highIdx] ?? 0;
    const low = candle[lowIdx] ?? 0;

    const hopen =
      idx === 0
        ? (open + close) / 2
        : ((prevCandle[openIdx] ?? 0) + (prevCandle[closeIdx] ?? 0)) / 2;
    const hclose = (open + high + low + close) / 4;
    const hhigh = Math.max(high, open, close);
    const hlow = Math.min(low, open, close);

    candle[openIdx] = hopen;
    candle[closeIdx] = hclose;
    candle[highIdx] = hhigh;
    candle[lowIdx] = hlow;

    prevCandle = candle.slice();

    return candle;
  });
}
