import { defineStore } from 'pinia';

import { getCurrentTheme, getTheme } from '@/shared/themes';
import axios from 'axios';
import { UiVersion } from '@/types';

const STORE_UI_SETTINGS = 'ftUISettings';

export enum OpenTradeVizOptions {
  showPill = 'showPill',
  asTitle = 'asTitle',
  noOpenTrades = 'noOpenTrades',
}

export interface SettingsType {
  openTradesInTitle?: string;
  timezone?: string;
  backgroundSync?: boolean;
}

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
  },
  persist: {
    key: STORE_UI_SETTINGS,
  },
});
