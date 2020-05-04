import Vue from 'vue'
import Vuex from 'vuex'

import tradesModule from './modules/trades';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  modules: {
    trades: tradesModule
  },
  mutations: {
  },
  actions: {
  },
})
