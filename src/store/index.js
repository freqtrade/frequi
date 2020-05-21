import Vue from 'vue';
import Vuex from 'vuex';

import ftbotModule from './modules/ftbot';
import userModule from './modules/user';
import alertsModule from './modules/alerts';
import themeModule from './modules/theme';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  modules: {
    ftbot: ftbotModule,
    user: userModule,
    alerts: alertsModule,
    theme: themeModule,
  },
  mutations: {
    setPing(state, ping) {
      console.log(ping);
      const now = Date(Date.now());
      state.ping = `${ping.status} ${now.toString()}`;
    },
  },
  actions: {
    refreshAll({ dispatch }) {
      dispatch('refreshFrequent');
      dispatch('refreshSlow');
      dispatch('ftbot/getDaily');
      dispatch('ftbot/getBalance');
    },
    refreshSlow({ dispatch }) {
      // dispatch('ftbot/getDaily');
      dispatch('ftbot/getPerformance');
      dispatch('ftbot/getProfit');
    },
    refreshFrequent({ dispatch }) {
      // Refresh all data
      dispatch('ftbot/getOpentrades');
      dispatch('ftbot/getState');
      dispatch('ftbot/getTrades');
      dispatch('ftbot/getWhitelist');
      dispatch('ftbot/getBlacklist');
    },
  },
});
