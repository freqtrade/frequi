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
      return axios.get(`${apiBase}/trades`, {
        ...getters.apiAuth
      })
        .then((result) => commit('updateTrades', result.data))
        .catch(console.error);
    },
    getOpentrades({ commit, getters }) {
      return axios.get(`${apiBase}/status`, {
        ...getters.apiAuth
      })
        .then((result) => commit('updateOpenTrades', result.data))
        .catch(console.error);
    },
    getPerformance({ commit, getters }) {
      return axios.get(`${apiBase}/performance`, {
        ...getters.apiAuth
      })
        .then((result) => commit('updatePerformance', result.data))
        .catch(console.error);
    },
    getProfit({ commit, getters }) {
      return axios.get(`${apiBase}/profit`, {
        ...getters.apiAuth
      })
        .then((result) => commit('updateProfit', result.data))
        .catch(console.error);
    },
    getState({ commit, getters, dispatch }) {
      return axios.get(`${apiBase}/show_config`, {
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
    // TODO: Migrate calls to API to a seperate module unrelated to vuex?
    startBot({ getters }) {
      return axios.post(`${apiBase}/start`, {}, {
        ...getters.apiAuth
      })
        // .then((result) => )
        .catch(console.error);
    },
    stopBot({ getters }) {
      return axios.post(`${apiBase}/stop`, {}, {
        ...getters.apiAuth
      })
        // .then((result) => )
        .catch(console.error);
    },
    stopBuy({ getters }) {
      return axios.post(`${apiBase}/stopbuy`, {}, {
        ...getters.apiAuth
      })
        // .then((result) => )
        .catch(console.error);
    },
    reloadConfig({ getters }) {
      return axios.post(`${apiBase}/reload_conf`, {}, {
        ...getters.apiAuth
      })
        // .then((result) => )
        .catch(console.error);
    },
    forcesell({ getters, dispatch }, tradeid) {
      console.log(tradeid);
      if (tradeid) {
        const payload = {tradeid};
        console.log(payload);
        return axios.post(`${apiBase}/forcesell`, payload, {
          ...getters.apiAuth
        }).then((result) => {
          console.log(result.data)
          dispatch('alerts/addAlert', { message: `Sell order for ${tradeid} created`}, { root: true }, )
        }).catch((error) => {
          console.error(error.response)
          dispatch('alerts/addAlert', { message: `Failed to create sell order for ${tradeid}`, severity: 'danger'}, { root: true }, )

        })
      }
      // Error branchs
      const error = "Tradeid is empty";
      console.error(error);
      return new Promise((resolve, reject) => {
        reject(error);
      });
    },
  },
};
