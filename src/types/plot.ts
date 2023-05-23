export enum ChartType {
  line = 'line',
  bar = 'bar',
  scatter = 'scatter',
}

export interface IndicatorConfig {
  color?: string;
  type?: ChartType;
  fill_to?: string;
}

export interface PlotConfig {
  main_plot: Record<string, IndicatorConfig>;
  subplots: Record<string, Record<string, IndicatorConfig>>;
}

export interface PlotConfigStorage {
  [key: string]: PlotConfig;
}

export const EMPTY_PLOTCONFIG: PlotConfig = { main_plot: {}, subplots: {} };
