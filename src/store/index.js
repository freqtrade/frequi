import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

import ftbotModule from './modules/ftbot';
import userModule from './modules/user';
import alertsModule from './modules/alerts';

import { apiBase } from './modules/config';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {

  },
  modules: {
    ftbot: ftbotModule,
    user: userModule,
    alerts: alertsModule,
  },
  mutations: {
    setPing(state, ping) {
      console.log(ping);
      const now = Date(Date.now());
      state.ping = `${ping.status} ${now.toString()}`  ;
    }
  },
  actions: {
    ping({ commit }) {
      axios.get(`${apiBase}/ping`)
        .then((result) => commit('setPing', result.data))
        .catch(console.error);
    },
    refreshAll({dispatch}) {
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
    refreshFrequent({dispatch}) {
      // Refresh all data
      dispatch('ftbot/getOpentrades');
      dispatch('ftbot/getState');
      dispatch('ftbot/getTrades');
      dispatch('ftbot/getWhitelist');
      dispatch('ftbot/getBlacklist');
    },
  }
})
