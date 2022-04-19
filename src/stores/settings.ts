import { defineStore } from 'pinia';

import { setTimezone } from '@/shared/formatters';
import { getCurrentTheme, getTheme } from '@/shared/themes';

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
      // TODO: needs proper migration ...
      currentTheme: getCurrentTheme(),
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
    setOpenTradesInTitle(locked: string) {
      this.openTradesInTitle = locked;
    },
    setTimeZone(timezone: string) {
      setTimezone(timezone);
      this.timezone = timezone;
    },
    setBackgroundSync(value: boolean) {
      this.backgroundSync = value;
    },
  },
  persist: {
    key: STORE_UI_SETTINGS,
  },
});
