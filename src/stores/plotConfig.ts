import {
  getAllPlotConfigNames,
  getCustomPlotConfig,
  getPlotConfigName,
  storeCustomPlotConfig,
  storePlotConfigName,
} from '@/shared/storage';
import { PlotConfigStorage, EMPTY_PLOTCONFIG } from '@/types';
import { defineStore } from 'pinia';

export const usePlotConfigStore = defineStore('plotConfig', {
  state: () => {
    return {
      customPlotConfig: {} as PlotConfigStorage,
      plotConfigName: getPlotConfigName(),
      availablePlotConfigNames: getAllPlotConfigNames(),
      plotConfig: { ...EMPTY_PLOTCONFIG },
    };
  },
  getters: {
    // plotConfig: (state) => state.customPlotConfig[state.plotConfigName] || { ...EMPTY_PLOTCONFIG },
  },
  actions: {
    saveCustomPlotConfig(plotConfig: PlotConfigStorage) {
      this.customPlotConfig = plotConfig;
      storeCustomPlotConfig(plotConfig);
      this.availablePlotConfigNames = getAllPlotConfigNames();
    },
    setPlotConfigName(plotConfigName: string) {
      this.plotConfigName = plotConfigName;
      storePlotConfigName(plotConfigName);
    },
    plotConfigChanged() {
      console.log('plotConfigChanged');
      this.plotConfig = getCustomPlotConfig(this.plotConfigName);
      this.setPlotConfigName(this.plotConfigName);
    },
  },
});
