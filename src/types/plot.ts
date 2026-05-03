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
  options?: {
    showTags?: boolean;
    markAreaZIndex?: number;
  };
}

export interface PlotConfigStorage {
  [key: string]: PlotConfig;
}

export interface PlotConfigTemplate {
  [key: string]: Partial<PlotConfig>;
}

export const EMPTY_PLOTCONFIG: PlotConfig = {
  main_plot: {},
  subplots: {
    Trend: {
      trend_slope_20: { color: '#f59e0b', type: ChartType.line },
      trend_zero: { color: '#64748b', type: ChartType.line },
    },
  },
};
