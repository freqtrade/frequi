import { PlotConfig, EMPTY_PLOTCONFIG, PlotConfigStorage } from '@/types';
// TODO: Outdated, this module can be removed
const PLOT_CONFIG = 'ft_custom_plot_config';
const PLOT_CONFIG_NAME = 'ft_selected_plot_config';

export function getPlotConfigName(): string {
  return localStorage.getItem(PLOT_CONFIG_NAME) || 'default';
}

export function storePlotConfigName(plotConfigName: string): void {
  localStorage.setItem(PLOT_CONFIG_NAME, plotConfigName);
}

export function getAllCustomPlotConfig(): PlotConfig {
  return JSON.parse(localStorage.getItem(PLOT_CONFIG) || '{}');
}

export function getAllPlotConfigNames(): Array<string> {
  return Object.keys(getAllCustomPlotConfig());
}

export function getCustomPlotConfig(configName: string): PlotConfig {
  const configs = getAllCustomPlotConfig();
  return configName in configs ? configs[configName] : { ...EMPTY_PLOTCONFIG };
}

export function storeCustomPlotConfig(plotConfig: PlotConfigStorage) {
  const existingConfig = getAllCustomPlotConfig();
  // Merge existing with new config
  const finalPlotConfig = { ...existingConfig, ...plotConfig };

  localStorage.setItem(PLOT_CONFIG, JSON.stringify(finalPlotConfig));
  // Store new config name as default
  storePlotConfigName(Object.keys(plotConfig)[0]);
}
