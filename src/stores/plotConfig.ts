import type { PlotConfig, PlotConfigStorage } from '@/types';
import { EMPTY_PLOTCONFIG } from '@/types';

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
    localStorage.removeItem(PLOT_CONFIG);
    localStorage.removeItem(PLOT_CONFIG_NAME);
  }
}
migratePlotConfigs();

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
    usedColumns() {
      return plotConfigColumns(this.plotConfig as unknown as PlotConfig);
    },
  },
  actions: {
    saveCustomPlotConfig(name: string, plotConfig: PlotConfig) {
      // This will autosave to storage due to pinia-persist
      this.customPlotConfigs[name] = plotConfig;
    },
    deletePlotConfig(plotConfigName: string) {
      delete this.customPlotConfigs[plotConfigName];
      if (this.plotConfigName === plotConfigName) {
        const configName = this.availablePlotConfigNames[this.availablePlotConfigNames.length - 1];
        if (!configName) return;
        this.plotConfigName = configName;
      }
    },
    renamePlotConfig(oldName: string, newName: string) {
      const oldConfig = this.customPlotConfigs[oldName];
      if (!oldConfig) return;
      this.customPlotConfigs[newName] = oldConfig;
      delete this.customPlotConfigs[oldName];
      this.plotConfigName = newName;
    },
    newPlotConfig(plotConfigName: string) {
      this.editablePlotConfig = deepClone(EMPTY_PLOTCONFIG);
      this.saveCustomPlotConfig(plotConfigName, this.editablePlotConfig);
      this.plotConfigName = plotConfigName;
    },

    plotConfigChanged(plotConfigName = '') {
      if (plotConfigName) {
        this.plotConfigName = plotConfigName;
      }

      if (this.isEditing) {
        const oldConfig = this.customPlotConfigs[this.plotConfigName];
        if (!oldConfig) return;
        this.editablePlotConfig = deepClone(oldConfig);
      }
    },
    duplicatePlotConfig(oldName: string, newName: string) {
      console.log(oldName, newName);
      const oldConfig = this.customPlotConfigs[oldName];
      if (!oldConfig) return;
      this.customPlotConfigs[newName] = deepClone(oldConfig);
      this.plotConfigChanged(newName);
    },
  },
  persist: {
    key: FT_PLOT_CONFIG_KEY,
    pick: ['plotConfigName', 'customPlotConfigs'],
    afterHydrate: (context) => {
      // Ensure default plot config exists
      if (Object.keys(context.store.customPlotConfigs).length === 0) {
        console.log('Initialized plotconfig');
        context.store.customPlotConfigs = { default: deepClone(EMPTY_PLOTCONFIG) };
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlotConfigStore, import.meta.hot));
}
