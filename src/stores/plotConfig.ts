import { deepClone } from '@/shared/deepClone';
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
        : state.customPlotConfigs[state.plotConfigName]) || deepClone(EMPTY_PLOTCONFIG),
    // plotConfig: (state) => state.customPlotConfig[state.plotConfigName] || { ...EMPTY_PLOTCONFIG },
  },
  actions: {
    saveCustomPlotConfig(name: string, plotConfig: PlotConfig) {
      // This will autosave to storage due to pinia-persist
      this.customPlotConfigs[name] = plotConfig;
    },
    deletePlotConfig(plotConfigName: string) {
      delete this.customPlotConfigs[plotConfigName];
    },
    renamePlotConfig(oldName: string, newName: string) {
      this.customPlotConfigs[newName] = this.customPlotConfigs[oldName];
      delete this.customPlotConfigs[oldName];
      this.plotConfigName = newName;
    },
    newPlotConfig(plotConfigName: string) {
      this.editablePlotConfig = deepClone(EMPTY_PLOTCONFIG);
      this.plotConfigName = plotConfigName;
    },

    plotConfigChanged(plotConfigName = '') {
      if (plotConfigName) {
        this.plotConfigName = plotConfigName;
      }
      console.log('plotConfigChanged', this.plotConfigName);
      if (this.isEditing) {
        this.editablePlotConfig = deepClone(this.customPlotConfigs[this.plotConfigName]);
      }
    },
  },
  persist: {
    key: FT_PLOT_CONFIG_KEY,
    paths: ['plotConfigName', 'customPlotConfigs'],
  },
});
