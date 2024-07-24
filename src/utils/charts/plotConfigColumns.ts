import { PlotConfig } from '@/types';

/** Function to extract required indicator names from a plot configuration */
export function plotConfigColumns(plotConfig: Partial<PlotConfig>): string[] {
  const cols: string[] = [];
  for (const key in plotConfig.main_plot) {
    cols.push(key);
  }
  for (const key in plotConfig.subplots) {
    for (const subkey in plotConfig.subplots[key]) {
      cols.push(subkey);
    }
  }
  // Make list unique
  return [...new Set(cols)].sort();
}
