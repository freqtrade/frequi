import { useApi } from '@/shared/apiService';
import { useUserService } from '@/shared/userService';

import {
  BacktestResult,
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
  StrategyBacktestResult,
  BacktestStatus,
  ProfitInterface,
  PairHistory,
  LogLine,
  BacktestSteps,
  SysInfoResponse,
  AvailablePairResult,
  StatusResponse,
  DeleteTradeResponse,
  BlacklistResponse,
} from '@/types';

import {
  storeCustomPlotConfig,
  getAllPlotConfigNames,
  storePlotConfigName,
} from '@/shared/storage';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

import state, { FtbotStateType } from './state';
import { showAlert } from '../alerts';

export enum BotStoreGetters {
  botName = 'botName',
  isBotOnline = 'isBotOnline',

  autoRefresh = 'autoRefresh',
  refreshNow = 'refreshNow',
  refreshing = 'refreshing',

  openTrades = 'openTrades',
  openTradeCount = 'openTradeCount',
  tradeDetail = 'tradeDetail',
  selectedPair = 'selectedPair',
  trades = 'trades',
  closedTrades = 'closedTrades',
  allTrades = 'allTrades',
  currentLocks = 'currentLocks',
  plotConfig = 'plotConfig',
  availablePlotConfigNames = 'availablePlotConfigNames',
  plotConfigName = 'plotConfigName',
  timeframe = 'timeframe',
  isTrading = 'isTrading',
  isWebserverMode = 'isWebserverMode',
  refreshRequired = 'refreshRequired',
  selectedBacktestResult = 'selectedBacktestResult',
  canRunBacktest = 'canRunBacktest',
  stakeCurrencyDecimals = 'stakeCurrencyDecimals',
  strategyPlotConfig = 'strategyPlotConfig',
  version = 'version',
  botApiVersion = 'botApiVersion',
  sysinfo = 'sysinfo',
  profit = 'profit',
  botState = 'botState',
  whitelist = 'whitelist',
  blacklist = 'blacklist',
  pairlistMethods = 'pairlistMethods',
  pairlist = 'pairlist',
  balance = 'balance',
  detailTradeId = 'detailTradeId',
  history = 'history',
  lastLogs = 'lastLogs',
  performanceStats = 'performanceStats',
  dailyStats = 'dailyStats',
  strategy = 'strategy',
  strategyList = 'strategyList',
  candleData = 'candleData',
  backtestRunning = 'backtestRunning',
  backtestStep = 'backtestStep',
  backtestProgress = 'backtestProgress',
  backtestHistory = 'backtestHistory',
  selectedBacktestResultKey = 'selectedBacktestResultKey',
}

export enum BotStoreActions {
  botAdded = 'botAdded',
  ping = 'ping',
  setIsBotOnline = 'setIsBotOnline',
  setAutoRefresh = 'setAutoRefresh',
  setRefreshRequired = 'setRefreshRequired',
  refreshSlow = 'refreshSlow',
  refreshFrequent = 'refreshFrequent',
  setDetailTrade = 'setDetailTrade',
  setSelectedPair = 'setSelectedPair',
  saveCustomPlotConfig = 'saveCustomPlotConfig',
  updatePlotConfigName = 'updatePlotConfigName',
  getTrades = 'getTrades',
  getLocks = 'getLocks',
  deleteLock = 'deleteLock',
  getOpenTrades = 'getOpenTrades',
  getPairCandles = 'getPairCandles',
  getPairHistory = 'getPairHistory',
  getStrategyPlotConfig = 'getStrategyPlotConfig',
  setPlotConfigName = 'setPlotConfigName',
  getStrategyList = 'getStrategyList',
  getStrategy = 'getStrategy',
  getAvailablePairs = 'getAvailablePairs',
  getPerformance = 'getPerformance',
  getWhitelist = 'getWhitelist',
  getBlacklist = 'getBlacklist',
  getProfit = 'getProfit',
  getBalance = 'getBalance',
  getDaily = 'getDaily',
  getState = 'getState',
  getLogs = 'getLogs',
  startBot = 'startBot',
  stopBot = 'stopBot',
  stopBuy = 'stopBuy',
  reloadConfig = 'reloadConfig',
  deleteTrade = 'deleteTrade',
  startTrade = 'startTrade',
  forcesell = 'forcesell',
  forcebuy = 'forcebuy',
  addBlacklist = 'addBlacklist',
  startBacktest = 'startBacktest',
  pollBacktest = 'pollBacktest',
  removeBacktest = 'removeBacktest',
  stopBacktest = 'stopBacktest',
  setBacktestResultKey = 'setBacktestResultKey',
  sysInfo = 'sysInfo',
  logout = 'logout',
}

export function createBotSubStore(botId: string, botName: string) {
  const userService = useUserService(botId);
  const { api } = useApi(userService, botId);
  return {
    namespaced: true,
    state,
    getters: {
      [BotStoreGetters.botName](state: FtbotStateType) {
        return state.botState?.bot_name || 'freqtrade';
      },
      [BotStoreGetters.isBotOnline](state: FtbotStateType): boolean {
        return state.isBotOnline;
      },
      [BotStoreGetters.autoRefresh](state: FtbotStateType): boolean {
        return state.autoRefresh;
      },
      [BotStoreGetters.refreshNow](state, getters, rootState, rootGetters): boolean {
        const bgRefresh = rootGetters['uiSettings/backgroundSync'];
        const selectedBot = rootGetters['ftbot/selectedBot'];
        if (
          (selectedBot === botId || bgRefresh) &&
          getters.autoRefresh &&
          getters.isBotOnline &&
          !getters.isWebserverMode
        ) {
          return true;
        }
        return false;
      },

      [BotStoreGetters.plotConfig](state: FtbotStateType) {
        return state.customPlotConfig[state.plotConfigName] || { ...EMPTY_PLOTCONFIG };
      },
      [BotStoreGetters.availablePlotConfigNames](state: FtbotStateType): string[] {
        return state.availablePlotConfigNames;
      },
      [BotStoreGetters.plotConfigName](state: FtbotStateType): string {
        return state.plotConfigName;
      },
      [BotStoreGetters.openTrades](state: FtbotStateType): Trade[] {
        return state.openTrades;
      },
      [BotStoreGetters.openTradeCount](state: FtbotStateType): number {
        return state.openTrades.length;
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
      [BotStoreGetters.trades](state: FtbotStateType): Trade[] {
        return state.trades;
      },
      [BotStoreGetters.closedTrades](state: FtbotStateType): Trade[] {
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
      [BotStoreGetters.selectedBacktestResult](state: FtbotStateType): StrategyBacktestResult {
        return state.backtestHistory[state.selectedBacktestResultKey];
      },
      [BotStoreGetters.canRunBacktest](state: FtbotStateType): boolean {
        /** Determines if bot runs in webserver mode */
        return state.botState?.runmode === RunModes.WEBSERVER;
      },
      [BotStoreGetters.stakeCurrencyDecimals](state: FtbotStateType): number {
        return state.botState?.stake_currency_decimals || 3;
      },
      [BotStoreGetters.strategyPlotConfig](state: FtbotStateType): PlotConfig | undefined {
        return state.strategyPlotConfig;
      },
      [BotStoreGetters.version](state: FtbotStateType): string {
        return state.botState?.version || state.version;
      },
      [BotStoreGetters.botApiVersion](state: FtbotStateType): number {
        return state.botState?.api_version || 1.0;
      },
      [BotStoreGetters.sysinfo](state: FtbotStateType): SysInfoResponse | {} {
        return state.sysinfo;
      },
      [BotStoreGetters.profit](state: FtbotStateType): ProfitInterface | {} {
        return state.profit;
      },
      [BotStoreGetters.botState](state: FtbotStateType): BotState | undefined {
        return state.botState;
      },
      [BotStoreGetters.whitelist](state: FtbotStateType): string[] {
        return state.whitelist;
      },
      [BotStoreGetters.blacklist](state: FtbotStateType): string[] {
        return state.blacklist;
      },
      [BotStoreGetters.pairlistMethods](state: FtbotStateType): string[] {
        return state.pairlistMethods;
      },
      [BotStoreGetters.pairlist](state: FtbotStateType): string[] {
        return state.pairlist;
      },
      [BotStoreGetters.balance](state: FtbotStateType): BalanceInterface | {} {
        return state.balance;
      },
      [BotStoreGetters.detailTradeId](state: FtbotStateType): number | undefined {
        return state.detailTradeId;
      },
      [BotStoreGetters.lastLogs](state: FtbotStateType): LogLine[] {
        return state.lastLogs;
      },
      [BotStoreGetters.performanceStats](state: FtbotStateType): Performance[] {
        return state.performanceStats;
      },
      [BotStoreGetters.dailyStats](state: FtbotStateType): DailyReturnValue | {} {
        return state.dailyStats;
      },
      [BotStoreGetters.strategy](state: FtbotStateType): StrategyResult | {} {
        return state.strategy;
      },
      [BotStoreGetters.strategyList](state: FtbotStateType): string[] {
        return state.strategyList;
      },
      [BotStoreGetters.candleData](state: FtbotStateType): PairHistory | {} {
        return state.candleData;
      },
      // TODO: Type me
      [BotStoreGetters.history](state: FtbotStateType) {
        return state.history;
      },
      [BotStoreGetters.backtestRunning](state: FtbotStateType): boolean {
        return state.backtestRunning;
      },
      [BotStoreGetters.backtestStep](state: FtbotStateType): BacktestSteps {
        return state.backtestStep;
      },
      [BotStoreGetters.backtestProgress](state: FtbotStateType): number {
        return state.backtestProgress;
      },
      // TODO: type me
      [BotStoreGetters.backtestHistory](state: FtbotStateType): {} {
        return state.backtestHistory;
      },
      [BotStoreGetters.selectedBacktestResultKey](state: FtbotStateType): string {
        return state.selectedBacktestResultKey;
      },
    },
    mutations: {
      setPing(state: FtbotStateType, ping) {
        const now = Date.now();
        state.ping = `${ping.status} ${now.toString()}`;
      },
      setIsBotOnline(state: FtbotStateType, isBotOnline: boolean) {
        state.isBotOnline = isBotOnline;
      },
      setAutoRefresh(state: FtbotStateType, newRefreshValue: boolean) {
        state.autoRefresh = newRefreshValue;
      },
      setRefreshing(state, refreshing: boolean) {
        state.refreshing = refreshing;
      },
      updateRefreshRequired(state: FtbotStateType, refreshRequired: boolean) {
        state.refreshRequired = refreshRequired;
      },
      updateTrades(state: FtbotStateType, { trades, tradesCount }) {
        state.trades = trades;
        state.tradeCount = tradesCount;
      },
      updateOpenTrades(state: FtbotStateType, trades) {
        // console.log(`Update open trade length ${trades.length}`);
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
      updateBacktestRunning(state: FtbotStateType, backtestStatus: BacktestStatus) {
        state.backtestRunning = backtestStatus.running;
        state.backtestProgress = backtestStatus.progress;
        state.backtestStep = backtestStatus.step;
        state.backtestTradeCount = backtestStatus.trade_count || 0;
      },
      updateBacktestResult(state, backtestResult: BacktestResult) {
        state.backtestResult = backtestResult;
        // TODO: Properly identify duplicates to avoid pushing the same multiple times
        Object.entries(backtestResult.strategy).forEach(([key, strat]) => {
          console.log(key, strat);

          const stratKey = `${key}_${strat.total_trades}_${strat.profit_total.toFixed(3)}`;
          // state.backtestHistory[stratKey] = strat;
          state.backtestHistory = { ...state.backtestHistory, ...{ [stratKey]: strat } };
          state.selectedBacktestResultKey = stratKey;
        });
      },
      resetBacktestHistory(state: FtbotStateType) {
        state.backtestHistory = {};
      },
      setBacktestResultKey(state: FtbotStateType, key: string) {
        state.selectedBacktestResultKey = key;
      },
      updateSysInfo(state, sysinfo: SysInfoResponse) {
        state.sysinfo = sysinfo;
      },
    },
    actions: {
      [BotStoreActions.botAdded]({ commit }) {
        commit('setAutoRefresh', userService.getAutoRefresh());
      },
      async [BotStoreActions.ping]({ commit }) {
        try {
          const result = await api.get('/ping');
          commit('setPing', result.data);
          commit('setIsBotOnline', true);
          return Promise.resolve();
        } catch (error) {
          //
          return Promise.reject();
        }
      },
      [BotStoreActions.logout]() {
        userService.logout();
      },
      [BotStoreActions.setRefreshRequired]({ commit }, refreshRequired: boolean) {
        commit('updateRefreshRequired', refreshRequired);
      },
      [BotStoreActions.setAutoRefresh]({ dispatch, commit }, newRefreshValue) {
        commit('setAutoRefresh', newRefreshValue);
        // TODO: Investigate this -
        // this ONLY works if ReloadControl is only visible once,otherwise it triggers twice
        if (newRefreshValue) {
          // dispatch('startRefresh', true);
        } else {
          // dispatch('stopRefresh');
        }
        userService.setAutoRefresh(newRefreshValue);
      },
      [BotStoreActions.setIsBotOnline]({ commit }, refreshRequired: boolean) {
        commit('setIsBotOnline', refreshRequired);
      },
      async [BotStoreActions.refreshSlow]({ dispatch, getters, state }, forceUpdate = false) {
        if (state.refreshing && !forceUpdate) {
          return;
        }
        // Refresh data only when needed
        if (forceUpdate || getters[`${BotStoreGetters.refreshRequired}`]) {
          const updates: Promise<AxiosInstance>[] = [];
          updates.push(dispatch('getPerformance'));
          updates.push(dispatch('getProfit'));
          updates.push(dispatch('getTrades'));
          updates.push(dispatch('getBalance'));
          /* white/blacklist might be refreshed more often as they are not expensive on the backend */
          updates.push(dispatch('getWhitelist'));
          updates.push(dispatch('getBlacklist'));

          await Promise.all(updates);
          dispatch('setRefreshRequired', false);
        }
      },
      [BotStoreActions.refreshFrequent]({ dispatch }) {
        // Refresh data that's needed in near realtime
        dispatch('getOpenTrades');
        dispatch('getState');
        dispatch('getLocks');
      },

      [BotStoreActions.setDetailTrade]({ commit }, trade: Trade) {
        commit('setDetailTrade', trade);
      },
      [BotStoreActions.setSelectedPair]({ commit }, pair: string) {
        commit('setSelectedPair', pair);
      },
      [BotStoreActions.saveCustomPlotConfig]({ commit }, plotConfig: PlotConfigStorage) {
        commit('saveCustomPlotConfig', plotConfig);
      },
      [BotStoreActions.updatePlotConfigName]({ commit }, plotConfigName: string) {
        commit('updatePlotConfigName', plotConfigName);
      },
      async [BotStoreActions.getTrades]({ commit }) {
        try {
          let totalTrades = 0;
          const pageLength = 500;
          const fetchTrades = async (limit: number, offset: number) => {
            return api.get<TradeResponse>('/trades', {
              params: { limit, offset },
            });
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
          // Add botId to all trades
          trades = trades.map((t) => ({
            ...t,
            botId,
            botName,
            botTradeId: `${botId}__${t.trade_id}`,
          }));
          commit('updateTrades', { trades, tradesCount });
          return Promise.resolve();
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          return Promise.reject(error);
        }
      },
      [BotStoreActions.getLocks]({ commit }) {
        return api
          .get('/locks')
          .then((result) => commit('updateLocks', result.data))
          .catch(console.error);
      },
      async [BotStoreActions.deleteLock]({ dispatch, commit }, lockid: string) {
        try {
          const res = await api.delete<LockResponse>(`/locks/${lockid}`);
          showAlert(dispatch, `Deleted Lock ${lockid}.`);
          commit('updateLocks', res.data);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert(dispatch, `Failed to delete lock ${lockid}`, 'danger');
          return Promise.reject(error);
        }
      },
      [BotStoreActions.getOpenTrades]({ commit, state }) {
        return api
          .get<never, AxiosResponse<Trade[]>>('/status')
          .then((result) => {
            // Check if trade-id's are different in this call, then trigger a full refresh
            if (
              Array.isArray(state.openTrades) &&
              Array.isArray(result.data) &&
              (state.openTrades.length !== result.data.length ||
                !state.openTrades.every(
                  (val, index) => val.trade_id === result.data[index].trade_id,
                ))
            ) {
              // Open trades changed, so we should refresh now.
              commit('updateRefreshRequired', true);
              // dispatch('refreshSlow', null, { root: true });
            }

            const openTrades = result.data.map((t) => ({
              ...t,
              botId,
              botName,
              botTradeId: `${botId}__${t.trade_id}`,
            }));

            commit('updateOpenTrades', openTrades);
          })
          .catch(console.error);
      },
      [BotStoreActions.getPairCandles]({ commit }, payload: PairCandlePayload) {
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
      [BotStoreActions.getPairHistory]({ commit }, payload: PairHistoryPayload) {
        if (payload.pair && payload.timeframe && payload.timerange) {
          return api
            .get('/pair_history', {
              params: { ...payload },
              timeout: 50000,
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
      async [BotStoreActions.getStrategyPlotConfig]({ commit }) {
        try {
          const result = await api.get<PlotConfig>('/plot_config');
          const plotConfig = result.data;
          if (plotConfig.subplots === null) {
            // Subplots should not be null but an empty object
            // TODO: Remove this fix when fix in freqtrade is populated further.
            plotConfig.subplots = {};
          }
          commit('updatePlotConfig', result.data);
          return Promise.resolve();
        } catch (data) {
          console.error(data);
          return Promise.reject(data);
        }
      },
      [BotStoreActions.setPlotConfigName]({ commit }, plotConfigName: string) {
        commit('updatePlotConfigName', plotConfigName);
      },
      [BotStoreActions.getStrategyList]({ commit }) {
        return api
          .get('/strategies')
          .then((result) => commit('updateStrategyList', result.data))
          .catch(console.error);
      },
      async [BotStoreActions.getStrategy]({ commit }, strategy: string) {
        try {
          const result = await api.get(`/strategy/${strategy}`, {});
          commit('updateStrategy', result.data);
          return Promise.resolve(result.data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async [BotStoreActions.getAvailablePairs]({ commit }, payload: AvailablePairPayload) {
        try {
          const result = await api.get<AvailablePairResult>('/available_pairs', {
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
      async [BotStoreActions.getPerformance]({ commit }) {
        try {
          const result = await api.get('/performance');
          commit('updatePerformance', result.data);
          return Promise.resolve(result.data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      [BotStoreActions.getWhitelist]({ commit }) {
        return api
          .get('/whitelist')
          .then((result) => {
            commit('updateWhitelist', result.data);
            return Promise.resolve(result.data);
          })
          .catch((error) => {
            // console.error(error);
            return Promise.reject(error);
          });
      },
      [BotStoreActions.getBlacklist]({ commit }) {
        return api
          .get<BlacklistResponse>('/blacklist')
          .then((result) => commit('updateBlacklist', result.data))
          .catch(console.error);
      },
      [BotStoreActions.getProfit]({ commit }) {
        return api
          .get('/profit')
          .then((result) => commit('updateProfit', result.data))
          .catch(console.error);
      },
      async [BotStoreActions.getBalance]({ commit }) {
        try {
          const result = await api.get('/balance');
          return commit('updateBalance', result.data);
        } catch (error) {
          return console.error(error);
        }
      },
      [BotStoreActions.getDaily]({ commit }, payload: DailyPayload = {}) {
        const { timescale = 20 } = payload;
        return api
          .get('/daily', { params: { timescale } })
          .then((result) => commit('updateDaily', result.data))
          .catch(console.error);
      },
      [BotStoreActions.getState]({ commit }) {
        return api
          .get('/show_config')
          .then((result) => commit('updateState', result.data))
          .catch(console.error);
      },
      [BotStoreActions.getLogs]({ commit }) {
        return api
          .get('/logs')
          .then((result) => commit('updateLogs', result.data))
          .catch(console.error);
      },
      // Post methods
      // TODO: Migrate calls to API to a seperate module unrelated to vuex?
      async [BotStoreActions.startBot]({ dispatch }) {
        try {
          const res = await api.post<{}, AxiosResponse<StatusResponse>>('/start', {});
          console.log(res.data);
          showAlert(dispatch, res.data.status);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert(dispatch, 'Error starting bot.');
          return Promise.reject(error);
        }
      },
      async [BotStoreActions.stopBot]({ dispatch }) {
        try {
          const res = await api.post<{}, AxiosResponse<StatusResponse>>('/stop', {});
          showAlert(dispatch, res.data.status);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert(dispatch, 'Error stopping bot.');
          return Promise.reject(error);
        }
      },
      async [BotStoreActions.stopBuy]({ dispatch }) {
        try {
          const res = await api.post<{}, AxiosResponse<StatusResponse>>('/stopbuy', {});
          showAlert(dispatch, res.data.status);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert(dispatch, 'Error calling stopbuy.');
          return Promise.reject(error);
        }
      },
      async [BotStoreActions.reloadConfig]({ dispatch }) {
        try {
          const res = await api.post<{}, AxiosResponse<StatusResponse>>('/reload_config', {});
          console.log(res.data);
          showAlert(dispatch, res.data.status);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert(dispatch, 'Error reloading.');
          return Promise.reject(error);
        }
      },
      async [BotStoreActions.deleteTrade]({ dispatch }, tradeid: string) {
        try {
          const res = await api.delete<DeleteTradeResponse>(`/trades/${tradeid}`);
          showAlert(
            dispatch,
            res.data.result_msg ? res.data.result_msg : `Deleted Trade ${tradeid}`,
          );
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert(dispatch, `Failed to delete trade ${tradeid}`, 'danger');
          return Promise.reject(error);
        }
      },
      async [BotStoreActions.startTrade]() {
        try {
          const res = await api.post('/start_trade', {});
          return Promise.resolve(res);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      async [BotStoreActions.forcesell]({ dispatch }, tradeid: string) {
        if (tradeid) {
          const payload = { tradeid };
          try {
            const res = await api.post('/forcesell', payload);
            showAlert(dispatch, `Sell order for ${tradeid} created`);
            return Promise.resolve(res);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              console.error(error.response);
            }
            showAlert(dispatch, `Failed to create sell order for ${tradeid}`, 'danger');
            return Promise.reject(error);
          }
        }
        // Error branchs
        const error = 'Tradeid is empty';
        console.error(error);
        return Promise.reject(error);
      },
      async [BotStoreActions.forcebuy]({ dispatch }, payload: ForcebuyPayload) {
        if (payload && payload.pair) {
          try {
            const res = await api.post<
              ForcebuyPayload,
              AxiosResponse<StatusResponse | TradeResponse>
            >('/forcebuy', payload);
            showAlert(dispatch, `Buy order for ${payload.pair} created.`);

            return Promise.resolve(res);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              console.error(error.response);
              showAlert(
                dispatch,
                `Error occured buying: '${(error as any).response?.data?.error}'`,
                'danger',
              );
            }
            return Promise.reject(error);
          }
        }
        // Error branchs
        const error = 'Pair is empty';
        console.error(error);
        return Promise.reject(error);
      },
      async [BotStoreActions.addBlacklist]({ commit, dispatch }, payload: BlacklistPayload) {
        console.log(`Adding ${payload} to blacklist`);
        if (payload && payload.blacklist) {
          try {
            const result = await api.post<BlacklistPayload, AxiosResponse<BlacklistResponse>>(
              '/blacklist',
              payload,
            );
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
            if (axios.isAxiosError(error)) {
              console.error(error.response);
              showAlert(
                dispatch,
                `Error occured while adding pairs to Blacklist: '${
                  (error as any).response?.data?.error
                }'`,
                'danger',
              );
            }

            return Promise.reject(error);
          }
        }
        // Error branchs
        const error = 'Pair is empty';
        console.error(error);
        return Promise.reject(error);
      },
      async [BotStoreActions.startBacktest]({ commit }, payload) {
        try {
          const result = await api.post('/backtest', payload);
          commit('updateBacktestRunning', result.data);
        } catch (err) {
          console.log(err);
        }
      },
      async [BotStoreActions.pollBacktest]({ commit }) {
        const result = await api.get<BacktestStatus>('/backtest');
        commit('updateBacktestRunning', result.data);
        if (result.data.running === false && result.data.backtest_result) {
          commit('updateBacktestResult', result.data.backtest_result);
        }
      },
      async [BotStoreActions.removeBacktest]({ commit }) {
        commit('resetBacktestHistory');
        try {
          const { data } = await api.delete<BacktestStatus>('/backtest');
          commit('updateBacktestRunning', data);
          return Promise.resolve(data);
        } catch (err) {
          return Promise.reject(err);
        }
      },
      async [BotStoreActions.stopBacktest]({ commit }) {
        try {
          const { data } = await api.get<BacktestStatus>('/backtest/abort');
          commit('updateBacktestRunning', data);
          return Promise.resolve(data);
        } catch (err) {
          return Promise.reject(err);
        }
      },
      [BotStoreActions.setBacktestResultKey]({ commit }, key: string) {
        commit('setBacktestResultKey', key);
      },
      async [BotStoreActions.sysInfo]({ commit }) {
        try {
          const { data } = await api.get('/sysinfo');
          commit('updateSysInfo', data);
          return Promise.resolve(data);
        } catch (err) {
          return Promise.reject(err);
        }
      },
    },
  };
}
