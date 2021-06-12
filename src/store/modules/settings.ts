const STORE_UI_SETTINGS = 'ftUISettings';

export enum OpenTradeVizOptions {
  showPill = 'showPill',
  asTitle = 'asTitle',
  noOpenTrades = 'noOpenTrades',
}

export enum SettingsGetters {
  openTradesInTitle = 'openTradesInTitle',
}

export enum SettingsActions {
  setOpenTradesInTitle = 'setOpenTradesInTitle',
}

export enum SettingsMutations {
  setOpenTrades = 'setOpenTrades',
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

export default {
  namespaced: true,
  state: {
    openTradesInTitle: storedSettings?.openTradesInTitle || OpenTradeVizOptions.showPill,
  },
  getters: {
    [SettingsGetters.openTradesInTitle](state) {
      return state.openTradesInTitle;
    },
  },
  mutations: {
    [SettingsMutations.setOpenTrades](state, value: string) {
      state.openTradesInTitle = value;
      updateSetting('openTradesInTitle', value);
    },
  },
  actions: {
    [SettingsActions.setOpenTradesInTitle]({ commit }, locked: boolean) {
      commit(SettingsMutations.setOpenTrades, locked);
    },
  },
};
