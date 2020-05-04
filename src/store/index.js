import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';

import tradesModule from './modules/trades';


import { apiBase } from './modules/config';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ping: 'ddd',
  },
  modules: {
    trades: tradesModule
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
    }
  }
})
