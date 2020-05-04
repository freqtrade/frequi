import axios from 'axios';

const apiBase = require('./config.js')

export default {
  namespaced: true,
  state: {
    trades: [],

  },
  mutations: {
    updateTrades(state, trades) {
      state.trades = trades;
    }
  },
  actions: {
    getTrades({ commit }) {
      axios.get(`${apiBase}/trades`)
        .then((result) => commit('updateTrades', result.data))
        .catch(console.error);
    }
  }
};
