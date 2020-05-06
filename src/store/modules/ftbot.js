import axios from 'axios';

import { apiBase, apiAuth } from './config';

export default {
  namespaced: true,
  state: {
    trades: [],
    openTrades: [],
    trade_count: 0,
    performanceStats: [],
    profit: {},
    botState: {},
  },
  getters: {
    openTrades(state) {
      return state.openTrades;
      // return state.trades.filter((item) => item.is_open);
    },
    closedtrades(state) {
      return state.trades.filter((item) => !item.is_open);
    }
  },
  mutations: {
    updateTrades(state, trades) {
      state.trades = trades.trades;
      state.trade_count = trades.trade_count;
    },
    updateOpenTrades(state, trades) {
      state.openTrades = trades;
    },
    updatePerformance(state, performance) {
      state.performanceStats = performance;
    },
    updateProfit(state, profit) {
      state.profit = profit;
    },
    updateState(state, botState) {
      console.log(botState);
      state.botState = botState;
    },
  },
  actions: {
    getTrades({ commit }) {
      axios.get(`${apiBase}/trades`, {
        ...apiAuth
      })
        .then((result) => commit('updateTrades', result.data))
        .catch(console.error);
    },
    getOpentrades({ commit }) {
      axios.get(`${apiBase}/status`, {
        ...apiAuth
      })
        .then((result) => commit('updateOpenTrades', result.data))
        .catch(console.error);
    },
    getPerformance({commit}) {
      axios.get(`${apiBase}/performance`, {
        ...apiAuth
      })
        .then((result) => commit('updatePerformance', result.data))
        .catch(console.error);
    },
    getProfit({ commit }) {
      axios.get(`${apiBase}/profit`, {
        ...apiAuth
      })
        .then((result) => commit('updateProfit', result.data))
        .catch(console.error);
    },
    getState({ commit }) {
      axios.get(`${apiBase}/show_config`, {
        ...apiAuth
      })
        .then((result) => commit('updateState', result.data))
        .catch(console.error);
    },
    // Post methods
    startBot() {
      axios.post(`${apiBase}/start`, {}, {
        ...apiAuth
      })
        // .then((result) => )
        .catch(console.error);
    },
    stopBot() {
      axios.post(`${apiBase}/stop`, {}, {
        ...apiAuth
      })
        // .then((result) => )
        .catch(console.error);
    },
    stopBuy() {
      axios.post(`${apiBase}/stopbuy`, {}, {
        ...apiAuth
      })
        // .then((result) => )
        .catch(console.error);
    },
    reloadConfig() {
      axios.post(`${apiBase}/reload_conf`, {}, {
        ...apiAuth
      })
        // .then((result) => )
        .catch(console.error);
    },
  },
};
