import { IndicatorConfig } from '@/types';
import { BarSeriesOption, LineSeriesOption, ScatterSeriesOption } from 'echarts';
import randomColor from '../randomColor';

export type SupportedSeriesTypes = LineSeriesOption | BarSeriesOption | ScatterSeriesOption;

export function generateCandleSeries(
  colDate: number,
  col: number,
  key: string,
  value: IndicatorConfig,
  axis = 0,
): SupportedSeriesTypes {
  const sp: SupportedSeriesTypes = {
    name: key,
    type: value.type || 'line',
    xAxisIndex: axis,
    yAxisIndex: axis,
    itemStyle: {
      color: value.color || randomColor(),
    },
    encode: {
      x: colDate,
      y: col,
    },
    showSymbol: false,
  };
  return sp;
}
