import { ofetch } from 'ofetch';
import { TimeSummaryCols, TimeSummaryOptions } from '@/types';
import type { ThemeName, UiVersion } from '@/types';
import { FtWsMessageTypes } from '@/types/wsMessageTypes';

export enum OpenTradeVizOptions {
  showPill = 'showPill',
  asTitle = 'asTitle',
  noOpenTrades = 'noOpenTrades',
}

const notificationDefaults = {
  [FtWsMessageTypes.entryFill]: true,
  [FtWsMessageTypes.exitFill]: true,
  [FtWsMessageTypes.entryCancel]: true,
  [FtWsMessageTypes.exitCancel]: true,
};

export const useSettingsStore = defineStore(
  'uiSettings',
  () => {
    const openTradesInTitle = ref<OpenTradeVizOptions>(OpenTradeVizOptions.showPill);
    const timezone = ref('UTC');
    const backgroundSync = ref(true);
    const currentTheme = ref('dark' as ThemeName);
    const useHeikinAshiCandles = ref(false);
    const showMarkArea = ref(true);
    const useReducedPairCalls = ref(true);
    const notifications = ref({ ...notificationDefaults });
    const profitDistributionBins = ref(20);

    const confirmDialog = ref(true);
    const chartLabelSide = ref<'left' | 'right'>('right');
    const chartDefaultCandleCount = ref(250);

    const timeProfitPeriod = ref(TimeSummaryOptions.daily);
    const timeProfitPreference = ref(TimeSummaryCols.abs_profit);

    const multiPaneButtonsShowText = ref(false);
    const multiPairSelection = ref(false);

    const backtestAdditionalMetrics = ref<string[]>(['profit_factor', 'expectancy']);

    const isDarkTheme = computed(() => ['dark', 'bootstrap_dark'].includes(currentTheme.value));
    const chartTheme = computed<'dark' | 'light'>(() => (isDarkTheme.value ? 'dark' : 'light'));

    const _uiVersion = ref('dev');
    const uiVersion = computed(() => `${_uiVersion.value}-${__COMMIT_HASH__}`);

    async function loadUIVersion() {
      if (import.meta.env.PROD) {
        try {
          const { version } = await ofetch<UiVersion>('/ui_version', {
            credentials: 'include',
          });
          _uiVersion.value = version ?? 'dev';
        } catch (error) {
          //
        }
      }
    }

    return {
      openTradesInTitle,
      timezone,
      backgroundSync,
      currentTheme,
      useHeikinAshiCandles,
      showMarkArea,
      useReducedPairCalls,
      notifications,
      profitDistributionBins,
      confirmDialog,
      chartLabelSide,
      chartDefaultCandleCount,
      timeProfitPeriod,
      timeProfitPreference,
      multiPaneButtonsShowText,
      multiPairSelection,
      backtestAdditionalMetrics,
      isDarkTheme,
      chartTheme,
      uiVersion,
      loadUIVersion,
    };
  },
  {
    persist: {
      key: 'ftUISettings',
    },
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
