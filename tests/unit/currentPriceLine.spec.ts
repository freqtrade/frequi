import { describe, expect, it } from 'vitest';
import type { ScatterSeriesOption } from 'echarts';

import { appendCurrentPriceLine } from '@/utils/charts/tradeChartData';

function seriesWithStoploss(): ScatterSeriesOption {
  return {
    type: 'scatter',
    markLine: {
      symbol: 'none',
      data: [[{ name: 'Stoploss', yAxis: 90 }, { yAxis: 90 }]],
    },
  };
}

describe('appendCurrentPriceLine', () => {
  it('leaves the series unchanged when there is no rate', () => {
    const series: ScatterSeriesOption = { type: 'scatter' };
    appendCurrentPriceLine(series, undefined);
    appendCurrentPriceLine(series, Number.NaN);
    expect(series.markLine).toBeUndefined();
  });

  it('adds a horizontal line at the current rate', () => {
    const series: ScatterSeriesOption = { type: 'scatter' };
    appendCurrentPriceLine(series, 101.5);
    expect(series.markLine?.data).toEqual([
      expect.objectContaining({ name: 'Current price', yAxis: 101.5 }),
    ]);
  });

  it('keeps an existing stoploss line', () => {
    const series = seriesWithStoploss();
    appendCurrentPriceLine(series, 110);
    expect(series.markLine?.data).toHaveLength(2);
    expect(series.markLine?.data?.[0]).toEqual([{ name: 'Stoploss', yAxis: 90 }, { yAxis: 90 }]);
    expect(series.markLine?.data?.[1]).toEqual(
      expect.objectContaining({ name: 'Current price', yAxis: 110 }),
    );
  });
});
