import { api } from '@/shared/apiService';

import {
  BotState,
  BlacklistPayload,
  ForcebuyPayload,
  Logs,
  DailyPayload,
  Trade,
  PairCandlePayload,
  PairHistoryPayload,
  PlotConfig,
  StrategyListResult,
  EMPTY_PLOTCONFIG,
  AvailablePairPayload,
  PlotConfigStorage,
  WhitelistResponse,
  StrategyResult,
  BalanceInterface,
  DailyReturnValue,
  LockResponse,
  Lock,
  RunModes,
  TradeResponse,
} from '@/types';

import {
  storeCustomPlotConfig,
  getAllPlotConfigNames,
  storePlotConfigName,
} from '@/shared/storage';
import state, { FtbotStateType } from './state';
import { showAlert } from '../alerts';

export enum BotStoreGetters {
  botName = 'botName',
  openTrades = 'openTrades',
  tradeDetail = 'tradeDetail',
  selectedPair = 'selectedPair',
  closedTrades = 'closedTrades',
  allTrades = 'allTrades',
  currentLocks = 'currentLocks',
  plotConfig = 'plotConfig',
  plotConfigNames = 'plotConfigNames',
  timeframe = 'timeframe',
  isTrading = 'isTrading',
  isWebserverMode = 'isWebserverMode',
  refreshRequired = 'refreshRequired',
}

export default {
  namespaced: true,
  state,
  getters: {
    [BotStoreGetters.botName](state: FtbotStateType) {
      return state.botState?.bot_name || 'freqtrade';
    },
    [BotStoreGetters.plotConfig](state: FtbotStateType) {
      return state.customPlotConfig[state.plotConfigName] || { ...EMPTY_PLOTCONFIG };
    },
    [BotStoreGetters.plotConfigNames](state: FtbotStateType): string[] {
      return Object.keys(state.customPlotConfig);
    },
    [BotStoreGetters.openTrades](state: FtbotStateType): Trade[] {
      return state.openTrades;
    },
    [BotStoreGetters.allTrades](state: FtbotStateType): Trade[] {
      return [...state.openTrades, ...state.trades];
    },
    [BotStoreGetters.currentLocks](state: FtbotStateType): Lock[] {
      return state.currentLocks?.locks || [];
    },
    [BotStoreGetters.tradeDetail](state: FtbotStateType): Trade | undefined {
      let dTrade = state.openTrades.find((item) => item.trade_id === state.detailTradeId);
      if (!dTrade) {
        dTrade = state.trades.find((item) => item.trade_id === state.detailTradeId);
      }
      return dTrade;
    },
    [BotStoreGetters.selectedPair](state: FtbotStateType): string {
      return state.selectedPair;
    },
    [BotStoreGetters.closedTrades](state: FtbotStateType) {
      // Sort by trade_id desc
      return state.trades
        .filter((item) => !item.is_open)
        .sort((a, b) =>
          // Sort by close timestamp, then by tradeid
          b.close_timestamp && a.close_timestamp
            ? b.close_timestamp - a.close_timestamp
            : b.trade_id - a.trade_id,
        );
    },
    [BotStoreGetters.timeframe](state: FtbotStateType): string {
      return state.botState?.timeframe || '';
    },
    [BotStoreGetters.isTrading](state: FtbotStateType): boolean {
      return (
        state.botState?.runmode === RunModes.LIVE || state.botState?.runmode === RunModes.DRY_RUN
      );
    },
    [BotStoreGetters.isWebserverMode](state: FtbotStateType): boolean {
      return state.botState?.runmode === RunModes.WEBSERVER;
    },
    [BotStoreGetters.refreshRequired](state: FtbotStateType): boolean {
      return state.refreshRequired;
    },
  },
  mutations: {
    updateRefreshRequired(state: FtbotStateType, refreshRequired: boolean) {
      state.refreshRequired = refreshRequired;
    },
    updateTrades(state: FtbotStateType, { trades, tradesCount }) {
      state.trades = trades;
      state.tradeCount = tradesCount;
    },
    updateOpenTrades(state: FtbotStateType, trades) {
      state.openTrades = trades;
    },
    updateLocks(state: FtbotStateType, locks: LockResponse) {
      state.currentLocks = locks;
    },
    updatePerformance(state: FtbotStateType, performance) {
      state.performanceStats = performance;
    },
    updateWhitelist(state: FtbotStateType, whitelist: WhitelistResponse) {
      state.whitelist = whitelist.whitelist;
      state.pairlistMethods = whitelist.method;
    },
    updateBlacklist(state: FtbotStateType, blacklist) {
      state.blacklist = blacklist.blacklist;
    },
    updateProfit(state: FtbotStateType, profit) {
      state.profit = profit;
    },
    updateDaily(state: FtbotStateType, daily: DailyReturnValue) {
      state.dailyStats = daily;
    },
    updateBalance(state: FtbotStateType, balance: BalanceInterface) {
      state.balance = balance;
    },
    updateState(state: FtbotStateType, botState: BotState) {
      state.botState = botState;
    },
    updateVersion(state: FtbotStateType, version) {
      state.version = version.version;
    },
    updateLogs(state: FtbotStateType, logs: Logs) {
      state.lastLogs = logs.logs;
    },
    setDetailTrade(state: FtbotStateType, trade: Trade) {
      state.detailTradeId = trade ? trade.trade_id : undefined;
      state.selectedPair = trade ? trade.pair : state.selectedPair;
    },
    setSelectedPair(state: FtbotStateType, pair: string) {
      state.selectedPair = pair;
    },
    updateStrategyList(state: FtbotStateType, result: StrategyListResult) {
      state.strategyList = result.strategies;
    },
    updateStrategy(state: FtbotStateType, strategy: StrategyResult) {
      state.strategy = strategy;
    },
    updatePairs(state: FtbotStateType, pairlist: string[]) {
      state.pairlist = pairlist;
    },
    updatePairCandles(state: FtbotStateType, { pair, timeframe, data }) {
      state.candleData = { ...state.candleData, [`${pair}__${timeframe}`]: data };
    },
    updatePairHistory(state: FtbotStateType, { pair, timeframe, data }) {
      // Intentionally drop the previous state here.
      state.history = { [`${pair}__${timeframe}`]: data };
    },
    updatePlotConfig(state: FtbotStateType, plotConfig: PlotConfig) {
      state.strategyPlotConfig = plotConfig;
    },
    updatePlotConfigName(state: FtbotStateType, plotConfigName: string) {
      // Set default plot config name
      state.plotConfigName = plotConfigName;
      storePlotConfigName(plotConfigName);
    },
    saveCustomPlotConfig(state: FtbotStateType, plotConfig: PlotConfigStorage) {
      state.customPlotConfig = plotConfig;
      storeCustomPlotConfig(plotConfig);
      state.availablePlotConfigNames = getAllPlotConfigNames();
    },
  },
  actions: {
    ping({ commit, rootState }) {
      if (rootState.loggedIn) {
        api
          .get('/ping')
          .then((result) => {
            commit('setPing', result.data, { root: true });
            commit('setIsBotOnline', result.data, { root: true });
          })
          .catch(console.error);
      }
    },
    setDetailTrade({ commit }, trade: Trade) {
      commit('setDetailTrade', trade);
    },
    setSelectedPair({ commit }, pair: string) {
      commit('setSelectedPair', pair);
    },
    async getTrades({ commit }) {
      try {
        let totalTrades = 0;
        const pageLength = 500;
        const fetchTrades = async (limit: number, offset: number) => {
          return api.get('/trades', { params: { limit, offset } });
        };
        const res = await fetchTrades(pageLength, 0);
        const result: TradeResponse = res.data;
        let { trades } = result;
        if (trades.length !== result.total_trades) {
          // Pagination necessary
          // Don't use Promise.all - this would fire all requests at once, which can
          // cause problems for big sqlite databases
          do {
            // eslint-disable-next-line no-await-in-loop
            const res = await fetchTrades(pageLength, trades.length);

            const result: TradeResponse = res.data;
            trades = trades.concat(result.trades);
            totalTrades = res.data.total_trades;
          } while (trades.length !== totalTrades);
        }
        const tradesCount = trades.length;
        commit('updateTrades', { trades, tradesCount });
        return Promise.resolve();
      } catch (error) {
        console.error(error.response);
        return Promise.reject(error);
      }
    },
    getLocks({ commit }) {
      return api
        .get('/locks')
        .then((result) => commit('updateLocks', result.data))
        .catch(console.error);
    },
    async deleteLock({ dispatch, commit }, lockid: string) {
      try {
        const res = await api.delete(`/locks/${lockid}`);
        showAlert(dispatch, res.data.result_msg ? res.data.result_msg : `Deleted Lock ${lockid}.`);
        commit('updateLocks', res.data);
        return Promise.resolve(res);
      } catch (error) {
        console.error(error.response);
        showAlert(dispatch, `Failed to delete lock ${lockid}`, 'danger');
        return Promise.reject(error);
      }
    },
    getOpenTrades({ commit, state }) {
      return api
        .get('/status')
        .then((result) => {
          // Check if trade-id's are different in this call, then trigger a full refresh
          if (
            Array.isArray(state.openTrades) &&
            Array.isArray(result.data) &&
            (state.openTrades.length !== result.data.length ||
              !state.openTrades.every((val, index) => val.trade_id === result.data[index].trade_id))
          ) {
            // Open trades changed, so we should refresh now.
            commit('updateRefreshRequired', true);
            // dispatch('refreshSlow', null, { root: true });
          }

          commit('updateOpenTrades', result.data);
        })
        .catch(console.error);
    },
    getPairCandles({ commit }, payload: PairCandlePayload) {
      if (payload.pair && payload.timeframe && payload.limit) {
        return api
          .get('/pair_candles', {
            params: { ...payload },
          })
          .then((result) => {
            commit('updatePairCandles', {
              pair: payload.pair,
              timeframe: payload.timeframe,
              data: result.data,
            });
          })
          .catch(console.error);
      }
      // Error branchs
      const error = 'pair or timeframe not specified';
      console.error(error);
      return new Promise((resolve, reject) => {
        reject(error);
      });
    },
    getPairHistory({ commit }, payload: PairHistoryPayload) {
      if (payload.pair && payload.timeframe && payload.timerange) {
        return api
          .get('/pair_history', {
            params: { ...payload },
            timeout: 10000,
          })
          .then((result) => {
            commit('updatePairHistory', {
              pair: payload.pair,
              timeframe: payload.timeframe,
              timerange: payload.timerange,
              data: result.data,
            });
          })
          .catch(console.error);
      }
      // Error branchs
      const error = 'pair or timeframe or timerange not specified';
      console.error(error);
      return new Promise((resolve, reject) => {
        reject(error);
      });
    },
    getStrategyPlotConfig({ commit }) {
      return api
        .get('/plot_config')
        .then((result) => commit('updatePlotConfig', result.data))
        .catch(console.error);
    },
    setPlotConfigName({ commit }, plotConfigName: string) {
      commit('updatePlotConfigName', plotConfigName);
    },
    getStrategyList({ commit }) {
      return api
        .get('/strategies')
        .then((result) => commit('updateStrategyList', result.data))
        .catch(console.error);
    },
    async getStrategy({ commit }, strategy: string) {
      try {
        const result = await api.get(`/strategy/${strategy}`, {});
        commit('updateStrategy', result.data);
        return Promise.resolve(result.data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    },
    async getAvailablePairs({ commit }, payload: AvailablePairPayload) {
      try {
        const result = await api.get('/available_pairs', {
          params: { ...payload },
        });
        // result is of type AvailablePairResult
        const { pairs } = result.data;
        commit('updatePairs', pairs);
        return Promise.resolve(result.data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    },
    async getPerformance({ commit }) {
      try {
        const result = await api.get('/performance');
        commit('updatePerformance', result.data);
        return Promise.resolve(result.data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    },
    getWhitelist({ commit }) {
      return api
        .get('/whitelist')
        .then((result) => {
          commit('updateWhitelist', result.data);
          return Promise.resolve(result.data);
        })
        .catch((error) => {
          console.error(error);
          return Promise.reject(error);
        });
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
    getDaily({ commit }, payload: DailyPayload = {}) {
      const { timescale = 20 } = payload;
      return api
        .get('/daily', { params: { timescale } })
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
    getLogs({ commit }) {
      return api
        .get('/logs')
        .then((result) => commit('updateLogs', result.data))
        .catch(console.error);
    },
    // Post methods
    // TODO: Migrate calls to API to a seperate module unrelated to vuex?
    async startBot({ dispatch }) {
      try {
        const res = await api.post('/start', {});
        console.log(res.data);
        showAlert(dispatch, res.data.status);
        return Promise.resolve(res);
      } catch (error) {
        console.error(error.resposne);
        showAlert(dispatch, 'Error starting bot.');
        return Promise.reject(error);
      }
    },
    async stopBot({ dispatch }) {
      try {
        const res = await api.post('/stop', {});
        showAlert(dispatch, res.data.status);
        return Promise.resolve(res);
      } catch (error) {
        console.error(error.resposne);
        showAlert(dispatch, 'Error stopping bot.');
        return Promise.reject(error);
      }
    },
    async stopBuy({ dispatch }) {
      try {
        const res = await api.post('/stopbuy', {});
        showAlert(dispatch, res.data.status);
        return Promise.resolve(res);
      } catch (error) {
        console.error(error.resposne);
        showAlert(dispatch, 'Error calling stopbuy.');
        return Promise.reject(error);
      }
    },
    async reloadConfig({ dispatch }) {
      try {
        const res = await api.post('/reload_config', {});
        console.log(res.data);
        showAlert(dispatch, res.data.status);
        return Promise.resolve(res);
      } catch (error) {
        console.error(error.resposne);
        showAlert(dispatch, 'Error reloading.');
        return Promise.reject(error);
      }
    },
    async deleteTrade({ dispatch }, tradeid: string) {
      try {
        const res = await api.delete(`/trades/${tradeid}`);
        showAlert(dispatch, res.data.result_msg ? res.data.result_msg : `Deleted Trade ${tradeid}`);
        return Promise.resolve(res);
      } catch (error) {
        console.error(error.response);
        showAlert(dispatch, `Failed to delete trade ${tradeid}`, 'danger');
        return Promise.reject(error);
      }
    },
    async startTrade() {
      try {
        const res = await api.post('/start_trade', {});
        return Promise.resolve(res);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async forcesell({ dispatch }, tradeid: string) {
      if (tradeid) {
        const payload = { tradeid };
        try {
          const res = await api.post('/forcesell', payload);
          showAlert(dispatch, `Sell order for ${tradeid} created`);
          return Promise.resolve(res);
        } catch (error) {
          console.error(error.response);
          showAlert(dispatch, `Failed to create sell order for ${tradeid}`, 'danger');
          return Promise.reject(error);
        }
      }
      // Error branchs
      const error = 'Tradeid is empty';
      console.error(error);
      return Promise.reject(error);
    },
    async forcebuy({ dispatch }, payload: ForcebuyPayload) {
      if (payload && payload.pair) {
        try {
          const res = await api.post('/forcebuy', payload);
          showAlert(dispatch, `Buy order for ${payload.pair} created.`);

          return Promise.resolve(res);
        } catch (error) {
          console.error(error.response);
          showAlert(dispatch, `Error occured buying: '${error.response.data.error}'`, 'danger');
          return Promise.reject(error);
        }
      }
      // Error branchs
      const error = 'Pair is empty';
      console.error(error);
      return Promise.reject(error);
    },
    async addBlacklist({ commit, dispatch }, payload: BlacklistPayload) {
      console.log(`Adding ${payload} to blacklist`);
      if (payload && payload.blacklist) {
        try {
          const result = await api.post('/blacklist', payload);
          commit('updateBlacklist', result.data);
          if (result.data.errors && Object.keys(result.data.errors).length !== 0) {
            const { errors } = result.data;
            Object.keys(errors).forEach((pair) => {
              showAlert(
                dispatch,
                `Error while adding pair ${pair} to Blacklist: ${errors[pair].error_msg}`,
              );
            });
          } else {
            showAlert(dispatch, `Pair ${payload.blacklist} added.`);
          }
          return Promise.resolve(result.data);
        } catch (error) {
          console.error(error.response);
          showAlert(
            dispatch,
            `Error occured while adding pairs to Blacklist: '${error.response.data.error}'`,
            'danger',
          );

          return Promise.reject(error);
        }
      }
      // Error branchs
      const error = 'Pair is empty';
      console.error(error);
      return Promise.reject(error);
    },
  },
};
