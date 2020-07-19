import Vue from 'vue';
import Vuex from 'vuex';

import userService from '@/shared/userService';
import ftbotModule from './modules/ftbot';
import alertsModule from './modules/alerts';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    ping: '',
    loggedIn: userService.loggedIn(),
  },
  modules: {
    ftbot: ftbotModule,
    alerts: alertsModule,
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
  },
  actions: {
    refreshOnce({ dispatch }) {
      dispatch('ftbot/getVersion');
    },
    refreshAll({ dispatch }) {
      dispatch('refreshFrequent');
      dispatch('refreshSlow');
      dispatch('ftbot/getDaily');
      dispatch('ftbot/getBalance');
      dispatch('ftbot/getWhitelist');
      dispatch('ftbot/getBlacklist');
    },
    refreshSlow({ dispatch }) {
      // dispatch('ftbot/getDaily');
      dispatch('ftbot/getPerformance');
      dispatch('ftbot/getProfit');
    },
    refreshFrequent({ dispatch }) {
      // Refresh all data
      dispatch('ftbot/getOpenTrades');
      dispatch('ftbot/getState');
      dispatch('ftbot/getTrades');
    },
  },
});
