import Vue from 'vue';
import Vuex from 'vuex';

import userService from '@/shared/userService';
import { getCurrentTheme, getTheme, storeCurrentTheme } from '@/shared/themes';
import { AxiosInstance } from 'axios';
import ftbotModule, { BotStoreGetters } from './modules/ftbot';
import alertsModule from './modules/alerts';
import layoutModule from './modules/layout';
import settingsModule from './modules/settings';

const AUTO_REFRESH = 'ft_auto_refresh';

Vue.use(Vuex);
const initCurrentTheme = getCurrentTheme();

export default new Vuex.Store({
  state: {
    ping: '',
    loggedIn: userService.loggedIn(),
    refreshing: false,
    autoRefresh: JSON.parse(localStorage.getItem(AUTO_REFRESH) || '{}'),
    isBotOnline: false,
    currentTheme: initCurrentTheme,
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
  },
  modules: {
    ftbot: ftbotModule,
    alerts: alertsModule,
    layout: layoutModule,
    uiSettings: settingsModule,
  },
  mutations: {
    setPing(state, ping) {
      // console.log(ping);
      const now = Date.now();
      state.ping = `${ping.status} ${now.toString()}`;
    },
    setLoggedIn(state, loggedin: boolean) {
      state.loggedIn = loggedin;
    },
    setAutoRefresh(state, newRefreshValue: boolean) {
      state.autoRefresh = newRefreshValue;
    },
    setRefreshing(state, refreshing: boolean) {
      state.refreshing = refreshing;
    },
    setIsBotOnline(state, isBotOnline: boolean) {
      state.isBotOnline = isBotOnline;
    },
    mutateCurrentTheme(state, newTheme: string) {
      storeCurrentTheme(newTheme);
      state.currentTheme = newTheme;
    },
  },
  actions: {
    setCurrentTheme({ commit }, newTheme: string) {
      commit('mutateCurrentTheme', newTheme);
    },
    setAutoRefresh({ commit }, newRefreshValue) {
      commit('setAutoRefresh', newRefreshValue);
      localStorage.setItem(AUTO_REFRESH, JSON.stringify(newRefreshValue));
    },
    setLoggedIn({ commit }, loggedin: boolean) {
      commit('setLoggedIn', loggedin);
    },
    setIsBotOnline({ commit, dispatch }, isOnline) {
      commit('setIsBotOnline', isOnline);
      if (isOnline === false) {
        console.log('disabling autorun');
        dispatch('setAutoRefresh', false);
      }
    },
    refreshOnce({ dispatch }) {
      dispatch('ftbot/getVersion');
    },
    async refreshAll({ dispatch, state, commit }, forceUpdate = false) {
      if (state.refreshing) {
        return;
      }
      commit('setRefreshing', true);
      try {
        const updates: Promise<AxiosInstance>[] = [];
        updates.push(dispatch('refreshFrequent', false));
        updates.push(dispatch('refreshSlow', forceUpdate));
        updates.push(dispatch('ftbot/getDaily'));
        updates.push(dispatch('ftbot/getBalance'));

        await Promise.all(updates);
        console.log('refreshing_end');
      } finally {
        commit('setRefreshing', false);
      }
    },
    async refreshSlow({ dispatch, commit, getters, state }, forceUpdate = false) {
      if (state.refreshing && !forceUpdate) {
        return;
      }
      // Refresh data only when needed
      if (forceUpdate || getters[`ftbot/${BotStoreGetters.refreshRequired}`]) {
        const updates: Promise<AxiosInstance>[] = [];
        updates.push(dispatch('ftbot/getPerformance'));
        updates.push(dispatch('ftbot/getProfit'));
        updates.push(dispatch('ftbot/getTrades'));
        /* white/blacklist might be refreshed more often as they are not expensive on the backend */
        updates.push(dispatch('ftbot/getWhitelist'));
        updates.push(dispatch('ftbot/getBlacklist'));

        await Promise.all(updates);
        commit('ftbot/updateRefreshRequired', false);
      }
    },
    refreshFrequent({ dispatch }, slow = true) {
      if (slow) {
        dispatch('refreshSlow', false);
      }
      // Refresh data that's needed in near realtime
      dispatch('ftbot/getOpenTrades');
      dispatch('ftbot/getState');
      dispatch('ftbot/getLocks');
    },
  },
});
