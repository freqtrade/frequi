import { IndicatorConfig } from '@/types';
import { SeriesOption } from 'echarts';
import randomColor from '../randomColor';

export function generateCandleSeries(
  colDate: number,
  col: number,
  key: string,
  value: IndicatorConfig,
  axis = 0,
): SeriesOption {
  const sp: SeriesOption = {
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
