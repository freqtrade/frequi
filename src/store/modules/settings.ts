import { setTimezone } from '@/shared/formatters';

const STORE_UI_SETTINGS = 'ftUISettings';

export enum OpenTradeVizOptions {
  showPill = 'showPill',
  asTitle = 'asTitle',
  noOpenTrades = 'noOpenTrades',
}

export enum SettingsGetters {
  openTradesInTitle = 'openTradesInTitle',
  timezone = 'timezone',
}

export enum SettingsActions {
  setOpenTradesInTitle = 'setOpenTradesInTitle',
  setTimeZone = 'setTimeZone',
}

export enum SettingsMutations {
  setOpenTrades = 'setOpenTrades',
  setTimeZone = 'setTimeZone',
}

export interface SettingsType {
  openTradesInTitle: string;
  timezone: string;
}

function getSettings() {
  const fromStore = localStorage.getItem(STORE_UI_SETTINGS);
  if (fromStore) {
    return JSON.parse(fromStore);
  }
  return {};
}
const storedSettings = getSettings();

function updateSetting(key: string, value: string) {
  const settings = getSettings() || {};
  settings[key] = value;
  localStorage.setItem(STORE_UI_SETTINGS, JSON.stringify(settings));
}

const state: SettingsType = {
  openTradesInTitle: storedSettings?.openTradesInTitle || OpenTradeVizOptions.showPill,
  timezone: storedSettings.timezone || 'UTC',
};

export default {
  namespaced: true,
  state,
  getters: {
    [SettingsGetters.openTradesInTitle](state) {
      return state.openTradesInTitle;
    },
    [SettingsGetters.timezone](state) {
      return state.timezone;
    },
  },
  mutations: {
    [SettingsMutations.setOpenTrades](state, value: string) {
      state.openTradesInTitle = value;
      updateSetting('openTradesInTitle', value);
    },
    [SettingsMutations.setTimeZone](state, timezone: string) {
      state.timezone = timezone;
      updateSetting('timezone', timezone);
    },
  },
  actions: {
    [SettingsActions.setOpenTradesInTitle]({ commit }, locked: boolean) {
      commit(SettingsMutations.setOpenTrades, locked);
    },
    [SettingsActions.setTimeZone]({ commit }, timezone: string) {
      setTimezone(timezone);
      commit(SettingsMutations.setTimeZone, timezone);
    },
  },
};
