import { PlotConfig } from '@/types';

/**
 * Calculate diff over 2 dataset columns and adds it to the end of the dataset
 * modifies the incomming dataset array inplace!
 */
export function calculateDiff(
  columns: string[],
  data: Array<number[]>,
  colFrom: string,
  colTo: string,
): number[][] {
  const fromIdx = columns.indexOf(colFrom);
  const toIdx = columns.indexOf(colTo);
  columns.push(`${colFrom}-${colTo}`);

  return data.map((original, idx) => {
    // Prevent mutation of original data
    const candle = original.slice();
    const diff = idx === 0 ? 0 : candle[toIdx] - candle[fromIdx];
    candle.push(diff);
    return candle;
  });
}

export function getDiffColumnsFromPlotConfig(plotConfig: PlotConfig): string[][] {
  const result: string[][] = [];
  if ('main_plot' in plotConfig) {
    Object.entries(plotConfig.main_plot).forEach(([key, value]) => {
      if (value.fill_to) {
        result.push([key, value.fill_to]);
      }
    });
  }
  if ('subplots' in plotConfig) {
    Object.values(plotConfig.subplots).forEach((subplots) => {
      Object.entries(subplots).forEach(([key, value]) => {
        if (value.fill_to) {
          result.push([key, value.fill_to]);
        }
      });
    });
  }
  return result;
}
