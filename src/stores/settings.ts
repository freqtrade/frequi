import axios from 'axios';
import { UiVersion } from '@/types';
import { FtWsMessageTypes } from '@/types/wsMessageTypes';

const STORE_UI_SETTINGS = 'ftUISettings';

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

export const useSettingsStore = defineStore('uiSettings', {
  // other options...
  state: () => {
    return {
      openTradesInTitle: OpenTradeVizOptions.showPill as string,
      timezone: 'UTC',
      backgroundSync: true,
      currentTheme: 'dark',
      _uiVersion: 'dev',
      useHeikinAshiCandles: false,
      useReducedPairCalls: true,
      notifications: notificationDefaults,
      profitDistributionBins: 20,
      confirmDialog: true,
      chartLabelSide: 'right' as 'left' | 'right',
    };
  },
  getters: {
    isDarkTheme(state) {
      const theme = getTheme(state.currentTheme);
      if (theme) {
        return theme.dark;
      }
      return true;
    },
    chartTheme(): 'dark' | 'light' {
      return this.isDarkTheme ? 'dark' : 'light';
    },
    uiVersion(state) {
      return `${state._uiVersion}-${__COMMIT_HASH__}`;
    },
  },
  actions: {
    async loadUIVersion() {
      if (import.meta.env.PROD) {
        try {
          const result = await axios.get<UiVersion>('/ui_version');
          const { version } = result.data;
          this._uiVersion = version ?? 'dev';
        } catch (error) {
          //
        }
      }
    },
  },
  persist: {
    key: STORE_UI_SETTINGS,
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
