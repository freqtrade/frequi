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

export const usePlotConfigStore = defineStore(
  'plotConfig',
  () => {
    const customPlotConfigs = ref<PlotConfigStorage>({});
    const plotConfigName = ref<string>('default');
    const isEditing = ref(false);
    const editablePlotConfig = ref<PlotConfig>({ ...EMPTY_PLOTCONFIG });

    const availablePlotConfigNames = computed(() => Object.keys(customPlotConfigs.value));
    const plotConfig = computed(
      () =>
        (isEditing.value
          ? editablePlotConfig.value
          : customPlotConfigs.value[plotConfigName.value]) || deepClone(EMPTY_PLOTCONFIG),
    );
    const usedColumns = computed(() => plotConfigColumns(plotConfig.value));

    function saveCustomPlotConfig(name: string, plotConfigValue: PlotConfig) {
      // This will autosave to storage due to pinia-persist
      customPlotConfigs.value[name] = plotConfigValue;
    }

    function deletePlotConfig(plotConfigNameValue: string) {
      delete customPlotConfigs.value[plotConfigNameValue];
      if (plotConfigName.value === plotConfigNameValue) {
        const configName =
          availablePlotConfigNames.value[availablePlotConfigNames.value.length - 1];
        if (!configName) return;
        plotConfigName.value = configName;
      }
    }

    function renamePlotConfig(oldName: string, newName: string) {
      const oldConfig = customPlotConfigs.value[oldName];
      if (!oldConfig) return;
      customPlotConfigs.value[newName] = oldConfig;
      delete customPlotConfigs.value[oldName];
      plotConfigName.value = newName;
    }

    function newPlotConfig(plotConfigNameValue: string) {
      editablePlotConfig.value = deepClone(EMPTY_PLOTCONFIG);
      saveCustomPlotConfig(plotConfigNameValue, editablePlotConfig.value);
      plotConfigName.value = plotConfigNameValue;
    }

    function plotConfigChanged(plotConfigNameValue = '') {
      if (plotConfigNameValue) {
        plotConfigName.value = plotConfigNameValue;
      }

      if (isEditing.value) {
        const oldConfig = customPlotConfigs.value[plotConfigName.value];
        if (!oldConfig) return;
        editablePlotConfig.value = deepClone(oldConfig);
      }
    }

    function duplicatePlotConfig(oldName: string, newName: string) {
      console.log(oldName, newName);
      const oldConfig = customPlotConfigs.value[oldName];
      if (!oldConfig) return;
      customPlotConfigs.value[newName] = deepClone(oldConfig);
      plotConfigChanged(newName);
    }

    return {
      customPlotConfigs,
      plotConfigName,
      isEditing,
      editablePlotConfig,
      availablePlotConfigNames,
      plotConfig,
      usedColumns,
      saveCustomPlotConfig,
      deletePlotConfig,
      renamePlotConfig,
      newPlotConfig,
      plotConfigChanged,
      duplicatePlotConfig,
    };
  },
  {
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
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlotConfigStore, import.meta.hot));
}
