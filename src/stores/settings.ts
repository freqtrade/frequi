import { defineStore } from 'pinia';

import { getCurrentTheme, getTheme } from '@/shared/themes';
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
      currentTheme: getCurrentTheme(),
      uiVersion: 'dev',
      useHeikinAshiCandles: false,
      notifications: notificationDefaults,
      profitDistributionBins: 20,
      colorPreference: 'greenUp',
      colorProfit: '#12bb7b',
      colorLoss: '#ef5350',
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
    chartTheme(): string {
      return this.isDarkTheme ? 'dark' : 'light';
    },
  },
  actions: {
    async loadUIVersion() {
      if (import.meta.env.PROD) {
        try {
          const result = await axios.get<UiVersion>('/ui_version');
          const { version } = result.data;
          this.uiVersion = version;
        } catch (error) {
          //
        }
      }
    },
    updateProfitLossColor() {
      const [colorProfit, colorLoss] =
        this.colorPreference === 'greenUp' ? ['#12bb7b', '#ef5350'] : ['#ef5350', '#12bb7b'];
      this.colorProfit = colorProfit;
      this.colorLoss = colorLoss;
    },
  },
  persist: {
    key: STORE_UI_SETTINGS,
  },
});
