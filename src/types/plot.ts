export enum ChartType {
  line = 'line',
  bar = 'bar',
  scatter = 'scatter',
}

export type ChartTypeString = keyof typeof ChartType;

export interface IndicatorConfig {
  color?: string;
  type?: ChartType | ChartTypeString;
  fill_to?: string;
  scatterSymbolSize?: number;
}

export interface PlotConfig {
  main_plot: Record<string, IndicatorConfig>;
  subplots: Record<string, Record<string, IndicatorConfig>>;
}

export interface PlotConfigStorage {
  [key: string]: PlotConfig;
}

export interface PlotConfigTemplate {
  [key: string]: Partial<PlotConfig>;
}

export const EMPTY_PLOTCONFIG: PlotConfig = { main_plot: {}, subplots: {} };
