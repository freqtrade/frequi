import axios from 'axios';

import { apiBase } from './config';

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
    apiAuth(state, getters, rootState, rootGetters) {
      return rootGetters['user/apiAuth']
    },
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
      state.botState = botState;
    },
  },
  actions: {
    getTrades({ commit, getters }) {

      axios.get(`${apiBase}/trades`, {
        ...getters.apiAuth
      })
        .then((result) => commit('updateTrades', result.data))
        .catch(console.error);
    },
    getOpentrades({ commit, getters }) {
      axios.get(`${apiBase}/status`, {
        ...getters.apiAuth
      })
        .then((result) => commit('updateOpenTrades', result.data))
        .catch(console.error);
    },
    getPerformance({ commit, getters }) {
      axios.get(`${apiBase}/performance`, {
        ...getters.apiAuth
      })
        .then((result) => commit('updatePerformance', result.data))
        .catch(console.error);
    },
    getProfit({ commit, getters }) {
      axios.get(`${apiBase}/profit`, {
        ...getters.apiAuth
      })
        .then((result) => commit('updateProfit', result.data))
        .catch(console.error);
    },
    getState({ commit, getters, dispatch }) {
      axios.get(`${apiBase}/show_config`, {
        ...getters.apiAuth
      })
        .then((result) => commit('updateState', result.data))
        .catch((error) => {
          console.error(error);
          if (error.response.status !== 401) {
            return new Promise((resolve, reject) => {
              reject(error);
            });
          }
          console.log("Dispatching refresh_token...")
          dispatch('user/refresh_token', null, { root: true })
          return null;
        });
    },
    // Post methods
    startBot({ getters }) {
      axios.post(`${apiBase}/start`, {}, {
        ...getters.apiAuth
      })
        // .then((result) => )
        .catch(console.error);
    },
    stopBot({ getters }) {
      axios.post(`${apiBase}/stop`, {}, {
        ...getters.apiAuth
      })
        // .then((result) => )
        .catch(console.error);
    },
    stopBuy({ getters }) {
      axios.post(`${apiBase}/stopbuy`, {}, {
        ...getters.apiAuth
      })
        // .then((result) => )
        .catch(console.error);
    },
    reloadConfig({ getters }) {
      axios.post(`${apiBase}/reload_conf`, {}, {
        ...getters.apiAuth
      })
        // .then((result) => )
        .catch(console.error);
    },
  },
};
