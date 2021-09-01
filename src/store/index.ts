import Vue from 'vue';
import Vuex from 'vuex';

import { getCurrentTheme, getTheme, storeCurrentTheme } from '@/shared/themes';
import axios from 'axios';
import { UserService } from '@/shared/userService';
import createBotStore from './modules/botStoreWrapper';
import alertsModule from './modules/alerts';
import layoutModule from './modules/layout';
import settingsModule from './modules/settings';

Vue.use(Vuex);
const initCurrentTheme = getCurrentTheme();

const store = new Vuex.Store({
  modules: {
    alerts: alertsModule,
    layout: layoutModule,
    uiSettings: settingsModule,
  },
  state: {
    currentTheme: initCurrentTheme,
    uiVersion: 'dev',
  },
  getters: {
    isDarkTheme(state) {
      const theme = getTheme(state.currentTheme);
      if (theme) {
        return theme.dark;
      }
      return true;
    },
    getChartTheme(state, getters) {
      return getters.isDarkTheme ? 'dark' : 'light';
    },
    getUiVersion(state) {
      return state.uiVersion;
    },
    loggedIn(state, getters) {
      return getters['ftbot/hasBots'];
    },
  },
  mutations: {
    mutateCurrentTheme(state, newTheme: string) {
      storeCurrentTheme(newTheme);
      state.currentTheme = newTheme;
    },
    setUIVersion(state, uiVersion: string) {
      state.uiVersion = uiVersion;
    },
  },
  actions: {
    setCurrentTheme({ commit }, newTheme: string) {
      commit('mutateCurrentTheme', newTheme);
    },

    setLoggedIn({ commit }, loggedin: boolean) {
      commit('setLoggedIn', loggedin);
    },
    async loadUIVersion({ commit }) {
      if (process.env.NODE_ENV !== 'development') {
        try {
          const result = await axios.get('/ui_version');
          const { version } = result.data;

          commit('setUIVersion', version);
        } catch (error) {
          //
        }
      }
    },
  },
});

store.registerModule('ftbot', createBotStore(store));
Object.entries(UserService.getAvailableBots()).forEach(([k, v]) => {
  store.dispatch('ftbot/addBot', v);
});
store.dispatch('ftbot/selectFirstBot');
store.dispatch('ftbot/startRefresh');
export default store;
