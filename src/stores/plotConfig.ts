import {
  getAllPlotConfigNames,
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
    };
  },
  getters: {
    plotConfig: (state) => state.customPlotConfig[state.plotConfigName] || { ...EMPTY_PLOTCONFIG },
  },
  actions: {
    saveCustomPlotConfig(plotConfig: PlotConfigStorage) {
      this.customPlotConfig = plotConfig;
      storeCustomPlotConfig(plotConfig);
      this.availablePlotConfigNames = getAllPlotConfigNames();
    },
    updatePlotConfigName(plotConfigName: string) {
      // Set default plot config name
      this.plotConfigName = plotConfigName;
      storePlotConfigName(plotConfigName);
    },
    setPlotConfigName(plotConfigName: string) {
      // TODO: This is identical to updatePlotConfigName
      this.plotConfigName = plotConfigName;
      storePlotConfigName(plotConfigName);
    },
    // plotConfigChanged() {
    // console.log('plotConfigChanged');
    // plotConfig.value = getCustomPlotConfig(this.plotConfigName);
    // plotStore.setPlotConfigName(plotConfigName.value);
    // },
  },
});
