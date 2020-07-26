import { api } from '@/shared/apiService';
import { BotState } from '@/store/types';

export default {
  namespaced: true,
  state: {
    version: '',
    trades: [],
    openTrades: [],
    tradeCount: 0,
    performanceStats: [],
    whitelist: [],
    blacklist: [],
    profit: {},
    botState: {},
    balance: {},
    dailyStats: [],
    pairlistMethods: [],
    detailTradeId: null,
  },
  getters: {
    openTrades(state) {
      return state.openTrades;
    },
    openTradeDetail(state) {
      const [dTrade] = state.openTrades.filter((item) => item.trade_id === state.detailTradeId);
      return dTrade;
    },
    closedTrades(state) {
      return state.trades.filter((item) => !item.is_open);
    },
  },
  mutations: {
    updateTrades(state, trades) {
      state.trades = trades.trades;
      state.tradeCount = trades.trades_count;
    },
    updateOpenTrades(state, trades) {
      state.openTrades = trades;
    },
    updatePerformance(state, performance) {
      state.performanceStats = performance;
    },
    updateWhitelist(state, whitelist) {
      state.whitelist = whitelist.whitelist;
      state.pairlistMethods = whitelist.method;
    },
    updateBlacklist(state, blacklist) {
      state.blacklist = blacklist.blacklist;
    },
    updateProfit(state, profit) {
      state.profit = profit;
    },
    updateDaily(state, daily) {
      state.dailyStats = daily;
    },
    updateBalance(state, balance) {
      state.balance = balance;
    },
    updateState(state, botState: BotState) {
      state.botState = botState;
    },
    updateVersion(state, version) {
      state.version = version.version;
    },
    setDetailTrade(state, trade) {
      state.detailTradeId = trade ? trade.trade_id : null;
    },
  },
  actions: {
    ping({ commit }) {
      api
        .get('/ping')
        .then((result) => {
          commit('setPing', result.data, { root: true });
          commit('setIsBotOnline', result.data, { root: true });
        })
        .catch(console.error);
    },
    getTrades({ commit }) {
      return api
        .get('/trades')
        .then((result) => commit('updateTrades', result.data))
        .catch(console.error);
    },
    getOpenTrades({ commit }) {
      return api
        .get('/status')
        .then((result) => commit('updateOpenTrades', result.data))
        .catch(console.error);
    },
    getPerformance({ commit }) {
      return api
        .get('/performance')
        .then((result) => commit('updatePerformance', result.data))
        .catch(console.error);
    },
    getWhitelist({ commit }) {
      return api
        .get('/whitelist')
        .then((result) => commit('updateWhitelist', result.data))
        .catch(console.error);
    },
    getBlacklist({ commit }) {
      return api
        .get('/blacklist')
        .then((result) => commit('updateBlacklist', result.data))
        .catch(console.error);
    },
    getProfit({ commit }) {
      return api
        .get('/profit')
        .then((result) => commit('updateProfit', result.data))
        .catch(console.error);
    },
    getBalance({ commit }) {
      return api
        .get('/balance')
        .then((result) => commit('updateBalance', result.data))
        .catch(console.error);
    },
    getDaily({ commit }) {
      return api
        .get('/daily')
        .then((result) => commit('updateDaily', result.data))
        .catch(console.error);
    },
    getState({ commit }) {
      return api
        .get('/show_config')
        .then((result) => commit('updateState', result.data))
        .catch(console.error);
    },
    getVersion({ commit }) {
      return api
        .get('/version')
        .then((result) => commit('updateVersion', result.data))
        .catch(console.error);
    },
    // Post methods
    // TODO: Migrate calls to API to a seperate module unrelated to vuex?
    startBot() {
      return api.post('/start', {}).catch(console.error);
    },
    stopBot() {
      return api.post('/stop', {}).catch(console.error);
    },
    stopBuy() {
      return api.post('/stopbuy', {}).catch(console.error);
    },
    reloadConfig() {
      return api.post('/reload_config', {}).catch(console.error);
    },
    forcesell({ dispatch }, tradeid) {
      console.log(tradeid);
      if (tradeid) {
        const payload = { tradeid };
        console.log(payload);
        return api
          .post('/forcesell', payload)
          .then(() => {
            dispatch(
              'alerts/addAlert',
              { message: `Sell order for ${tradeid} created` },
              { root: true },
            );
          })
          .catch((error) => {
            console.error(error.response);
            dispatch(
              'alerts/addAlert',
              { message: `Failed to create sell order for ${tradeid}`, severity: 'danger' },
              { root: true },
            );
          });
      }
      // Error branchs
      const error = 'Tradeid is empty';
      console.error(error);
      return new Promise((resolve, reject) => {
        reject(error);
      });
    },
    forcebuy({ dispatch }, payload) {
      console.log(payload);
      if (payload && payload.pair) {
        return api
          .post('/forcebuy', payload)
          .then(() => {
            dispatch(
              'alerts/addAlert',
              { message: `Buy order for ${payload.pair} created.` },
              { root: true },
            );
          })
          .catch((error) => {
            console.error(error.response);
            dispatch(
              'alerts/addAlert',
              {
                message: `Error occured buying: '${error.response.data.error}'`,
                severity: 'danger',
              },
              { root: true },
            );
          });
      }
      // Error branchs
      const error = 'Pair is empty';
      console.error(error);
      return new Promise((resolve, reject) => {
        reject(error);
      });
    },
    addBlacklist({ commit, dispatch }, payload) {
      console.log(`Adding ${payload} to blacklist`);
      if (payload && payload.blacklist) {
        return api
          .post('/blacklist', payload)
          .then((result) => {
            commit('updateBlacklist', result.data);
            if (result.data.errors && Object.keys(result.data.errors).length !== 0) {
              const { errors } = result.data;
              Object.keys(errors).forEach((pair) => {
                dispatch(
                  'alerts/addAlert',
                  {
                    message: `Error while adding pair ${pair} to Blacklist: ${errors[pair].error_msg}`,
                  },
                  { root: true },
                );
              });
            } else {
              dispatch(
                'alerts/addAlert',
                { message: `Pair ${payload.blacklist} added.` },
                { root: true },
              );
            }
          })
          .catch((error) => {
            console.error(error.response);
            dispatch(
              'alerts/addAlert',
              {
                message: `Error occured while adding pairs to Blacklist: '${error.response.data.error}'`,
                severity: 'danger',
              },
              { root: true },
            );
          });
      }
      // Error branchs
      const error = 'Pair is empty';
      console.error(error);
      return new Promise((resolve, reject) => {
        reject(error);
      });
    },
  },
};
