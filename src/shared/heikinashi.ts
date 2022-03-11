export default function heikinAshiDataset(columns: string[], data: Array<number[]>) {
  const openIdx = columns.indexOf('open');
  const closeIdx = columns.indexOf('close');
  const highIdx = columns.indexOf('high');
  const lowIdx = columns.indexOf('low');

  return data.map((original, idx, candles) => {
    // Prevent mutation of original data
    const candle = original.slice();

    if (idx === 0) {
      const close = (candle[openIdx] + candle[highIdx] + candle[lowIdx] + candle[closeIdx]) / 4;
      const open = (candle[openIdx] + candle[closeIdx]) / 2;

      candle[openIdx] = open;
      candle[closeIdx] = close;

      return candle;
    }

    const prevCandle = candles[idx - 1];
    const close = (candle[openIdx] + candle[highIdx] + candle[lowIdx] + candle[closeIdx]) / 4;
    const open = (prevCandle[openIdx] + prevCandle[closeIdx]) / 2;
    const high = Math.max(candle[highIdx], candle[openIdx], candle[closeIdx]);
    const low = Math.min(candle[lowIdx], candle[openIdx], candle[closeIdx]);

    candle[openIdx] = open;
    candle[closeIdx] = close;
    candle[highIdx] = high;
    candle[lowIdx] = low;

    return candle;
  });
}
