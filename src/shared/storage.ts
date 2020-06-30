import { PlotConfig, EMPTY_PLOTCONFIG } from '@/types';

const PLOT_CONFIG = 'ft_custom_plot_config';

export function saveCustomPlotConfig(plotConfig: PlotConfig) {
  localStorage.setItem(PLOT_CONFIG, JSON.stringify(plotConfig));
}

export function loadCustomPlotConfig() {
  console.log('load_custom');
  return JSON.parse(localStorage.getItem(PLOT_CONFIG) || JSON.stringify(EMPTY_PLOTCONFIG));
}
