import Vue from 'vue';
import Vuex from 'vuex';

import ftbotModule from './modules/ftbot';
import alertsModule from './modules/alerts';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    ping: '',
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
      dispatch('ftbot/getWhitelist');
      dispatch('ftbot/getBlacklist');
    },
  },
});
