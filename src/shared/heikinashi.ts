export default function heikinAshiDataset(columns: string[], data: Array<number[]>) {
  const openIdx = columns.indexOf('open');
  const closeIdx = columns.indexOf('close');
  const highIdx = columns.indexOf('high');
  const lowIdx = columns.indexOf('low');

  let prevCandle: number[];
  return data.map((original, idx) => {
    // Prevent mutation of original data
    const candle = original.slice();
    const open =
      idx === 0
        ? (candle[openIdx] + candle[closeIdx]) / 2
        : (prevCandle[openIdx] + prevCandle[closeIdx]) / 2;
    const close = (candle[openIdx] + candle[highIdx] + candle[lowIdx] + candle[closeIdx]) / 4;
    const high = Math.max(candle[highIdx], candle[openIdx], candle[closeIdx]);
    const low = Math.min(candle[lowIdx], candle[openIdx], candle[closeIdx]);

    candle[openIdx] = open;
    candle[closeIdx] = close;
    candle[highIdx] = high;
    candle[lowIdx] = low;

    prevCandle = candle.slice();

    return candle;
  });
}
