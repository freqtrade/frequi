export interface IndicatorConfig {
  color?: string;
  type?: string;
}

export interface PlotConfig {
  main_plot: Record<string, IndicatorConfig>;
  subplots: Record<string, Record<string, IndicatorConfig>>;
}

export interface PlotConfigStorage {
  [key: string]: PlotConfig;
}

// eslint-disable-next-line @typescript-eslint/camelcase
export const EMPTY_PLOTCONFIG: PlotConfig = { main_plot: {}, subplots: {} };
