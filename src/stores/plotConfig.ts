import { EMPTY_PLOTCONFIG, PlotConfig, PlotConfigStorage } from '@/types';
import { defineStore } from 'pinia';

const FT_PLOT_CONFIG_KEY = 'ftPlotConfig';

function migratePlotConfigs() {
  // Legacy config names
  const PLOT_CONFIG = 'ft_custom_plot_config';
  const PLOT_CONFIG_NAME = 'ft_selected_plot_config';

  const allConfigs = JSON.parse(localStorage.getItem(PLOT_CONFIG) || '{}');
  if (Object.keys(allConfigs).length > 0) {
    console.log('migrating plot configs');
    const res = {
      customPlotConfigs: allConfigs,
      plotConfigName: localStorage.getItem(PLOT_CONFIG_NAME) || 'default',
    };
    localStorage.setItem(FT_PLOT_CONFIG_KEY, JSON.stringify(res));
    // TODO: Remove old settings to avoid constant migration
    // localStorage.removeItem(PLOT_CONFIG);
    // localStorage.removeItem(PLOT_CONFIG_NAME);
  }
}
// migratePlotConfigs();

export const usePlotConfigStore = defineStore('plotConfig', {
  state: () => {
    return {
      customPlotConfigs: {} as PlotConfigStorage,
      plotConfigName: 'default',
      isEditing: false,
      editablePlotConfig: { ...EMPTY_PLOTCONFIG } as PlotConfig,
    };
  },
  getters: {
    availablePlotConfigNames: (state) => Object.keys(state.customPlotConfigs),
    plotConfig: (state) =>
      (state.isEditing
        ? state.editablePlotConfig
        : state.customPlotConfigs[state.plotConfigName]) || { ...EMPTY_PLOTCONFIG },
    // plotConfig: (state) => state.customPlotConfig[state.plotConfigName] || { ...EMPTY_PLOTCONFIG },
  },
  actions: {
    saveCustomPlotConfig(name: string, plotConfig: PlotConfig) {
      // This will autosave to storage due to pinia-persist
      this.customPlotConfigs[name] = plotConfig;
    },
    plotConfigChanged(plotConfigName = '') {
      if (plotConfigName) {
        this.plotConfigName = plotConfigName;
      }
    },
  },
  persist: {
    key: FT_PLOT_CONFIG_KEY,
    paths: ['plotConfigName', 'customPlotConfigs'],
  },
});
