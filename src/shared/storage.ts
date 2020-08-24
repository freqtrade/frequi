import { PlotConfig, EMPTY_PLOTCONFIG, PlotConfigStorage } from '@/types';

const PLOT_CONFIG = 'ft_custom_plot_config';
const PLOT_CONFIG_NAME = 'ft_selected_plot_config';

export function loadPlotConfigName(): string {
  return localStorage.getItem(PLOT_CONFIG_NAME) || '';
}

export function storePlotConfigName(plotConfigName: string): void {
  localStorage.setItem(PLOT_CONFIG_NAME, plotConfigName);
}

export function loadAllCustomPlotConfig(): PlotConfig {
  return JSON.parse(localStorage.getItem(PLOT_CONFIG) || JSON.stringify(EMPTY_PLOTCONFIG));
}

export function loadCustomPlotConfig(configName: string): PlotConfig {
  const configs = loadAllCustomPlotConfig();
  return configName in configs ? configs[configName] : { ...EMPTY_PLOTCONFIG };
}

export function storeCustomPlotConfig(plotConfig: PlotConfigStorage) {
  const existingConfig = loadAllCustomPlotConfig();
  // Merge existing with new config
  const finalPlotConfig = { ...existingConfig, ...plotConfig };

  localStorage.setItem(PLOT_CONFIG, JSON.stringify(finalPlotConfig));
  // Store new config name as default
  storePlotConfigName(Object.keys(plotConfig)[0]);
}
