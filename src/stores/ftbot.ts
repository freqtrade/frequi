import { useApi } from '@/shared/apiService';
import {
  getAllPlotConfigNames,
  getPlotConfigName,
  storeCustomPlotConfig,
  storePlotConfigName,
} from '@/shared/storage';
import { useUserService } from '@/shared/userService';
import { parseParams } from '@/shared/apiParamParser';
import {
  BotState,
  Trade,
  PlotConfig,
  StrategyResult,
  BalanceInterface,
  DailyReturnValue,
  LockResponse,
  PlotConfigStorage,
  ProfitInterface,
  BacktestResult,
  StrategyBacktestResult,
  BacktestSteps,
  LogLine,
  SysInfoResponse,
  LoadingStatus,
  BacktestHistoryEntry,
  RunModes,
  EMPTY_PLOTCONFIG,
  DailyPayload,
  BlacklistResponse,
  WhitelistResponse,
  StrategyListResult,
  AvailablePairPayload,
  AvailablePairResult,
  PairHistoryPayload,
  PairCandlePayload,
  StatusResponse,
  ForceSellPayload,
  DeleteTradeResponse,
  BacktestStatus,
  BacktestPayload,
  BlacklistPayload,
  ForceEnterPayload,
  TradeResponse,
  ClosedTrade,
} from '@/types';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { defineStore } from 'pinia';
import { showAlert } from './alerts';

export function createBotSubStore(botId: string, botName: string) {
  const userService = useUserService(botId);
  const { api } = useApi(userService, botId);

  const useBotStore = defineStore(botId, {
    state: () => {
      return {
        ping: '',
        botStatusAvailable: false,
        isBotOnline: false,
        autoRefresh: false,
        refreshing: false,
        versionState: '',
        lastLogs: [] as LogLine[],
        refreshRequired: true,
        trades: [] as ClosedTrade[],
        openTrades: [] as Trade[],
        tradeCount: 0,
        performanceStats: [] as Performance[],
        whitelist: [] as string[],
        blacklist: [] as string[],
        profit: {} as ProfitInterface,
        botState: {} as BotState,
        balance: {} as BalanceInterface,
        dailyStats: {} as DailyReturnValue,
        pairlistMethods: [] as string[],
        detailTradeId: null as number | null,
        selectedPair: '',
        // TODO: type me
        candleData: {},
        candleDataStatus: LoadingStatus.loading,
        // TODO: type me
        history: {},
        historyStatus: LoadingStatus.loading,
        strategyPlotConfig: undefined as PlotConfig | undefined,
        customPlotConfig: {} as PlotConfigStorage,
        plotConfigName: getPlotConfigName(),
        availablePlotConfigNames: getAllPlotConfigNames(),
        strategyList: [] as string[],
        strategy: {} as StrategyResult,
        pairlist: [] as string[],
        currentLocks: undefined as LockResponse | undefined,
        // backtesting
        backtestRunning: false,
        backtestProgress: 0.0,
        backtestStep: BacktestSteps.none,
        backtestTradeCount: 0,
        backtestResult: undefined as BacktestResult | undefined,
        selectedBacktestResultKey: '',
        backtestHistory: {} as Record<string, StrategyBacktestResult>,
        backtestHistoryList: [] as BacktestHistoryEntry[],
        sysInfo: {} as SysInfoResponse,
      };
    },
    getters: {
      version: (state) => state.botState?.version || state.versionState,
      botApiVersion: (state) => state.botState?.api_version || 1.0,
      stakeCurrency: (state) => state.botState?.stake_currency || '',
      stakeCurrencyDecimals: (state) => state.botState?.stake_currency_decimals || 3,
      canRunBacktest: (state) => state.botState?.runmode === RunModes.WEBSERVER,
      isWebserverMode: (state) => state.botState?.runmode === RunModes.WEBSERVER,
      selectedBacktestResult: (state) => state.backtestHistory[state.selectedBacktestResultKey],
      shortAllowed: (state) => state.botState?.short_allowed || false,
      openTradeCount: (state) => state.openTrades.length,
      isTrading: (state) =>
        state.botState?.runmode === RunModes.LIVE || state.botState?.runmode === RunModes.DRY_RUN,
      timeframe: (state) => state.botState?.timeframe || '',
      closedTrades: (state) => {
        return state.trades
          .filter((item) => !item.is_open)
          .sort((a, b) =>
            // Sort by close timestamp, then by tradeid
            b.close_timestamp && a.close_timestamp
              ? b.close_timestamp - a.close_timestamp
              : b.trade_id - a.trade_id,
          );
      },
      tradeDetail: (state) => {
        let dTrade = state.openTrades.find((item) => item.trade_id === state.detailTradeId);
        if (!dTrade) {
          dTrade = state.trades.find((item) => item.trade_id === state.detailTradeId);
        }
        return dTrade as Trade;
      },
      plotConfig: (state) =>
        state.customPlotConfig[state.plotConfigName] || { ...EMPTY_PLOTCONFIG },
      refreshNow: (state) => {
        if (
          state.autoRefresh &&
          state.isBotOnline &&
          state.botStatusAvailable &&
          state.botState?.runmode !== RunModes.WEBSERVER
        ) {
          return true;
        }
        // TODO: This backgroundSyncCheck is still missing above
        // const bgRefresh = rootGetters['uiSettings/backgroundSync'];
        // const selectedBot = rootGetters[`${StoreModules.ftbot}/selectedBot`];
        // if (
        //   (selectedBot === botId || bgRefresh) &&
        //   getters.autoRefresh &&
        //   getters.isBotOnline &&
        //   getters.botStatusAvailable &&
        //   !getters.isWebserverMode
        // ) {
        //   return true;
        // }
        return false;
      },
      botName: (state) => state.botState?.bot_name || 'freqtrade',
      allTrades: (state) => [...state.openTrades, ...state.trades] as Trade[],
      activeLocks: (state) => state.currentLocks?.locks || [],
    },
    actions: {
      botAdded() {
        this.autoRefresh = userService.getAutoRefresh();
      },
      async fetchPing() {
        try {
          const result = await api.get('/ping');
          const now = Date.now();
          // TODO: Name collision!
          this.ping = `${result.data.status} ${now.toString()}`;
          this.isBotOnline = true;
          return Promise.resolve();
        } catch (error) {
          console.log('ping fail');
          this.isBotOnline = false;
          return Promise.reject();
        }
      },
      logout() {
        userService.logout();
      },
      rename(name: string) {
        userService.renameBot(name);
      },
      setAutoRefresh(newRefreshValue) {
        this.autoRefresh = newRefreshValue;
        // TODO: Investigate this -
        // this ONLY works if ReloadControl is only visible once,otherwise it triggers twice
        if (newRefreshValue) {
          this.refreshFrequent();
          this.refreshSlow(true);
        }
        userService.setAutoRefresh(newRefreshValue);
      },
      setIsBotOnline(isBotOnline: boolean) {
        this.isBotOnline = isBotOnline;
      },
      async refreshSlow(forceUpdate = false) {
        if (this.refreshing && !forceUpdate) {
          return;
        }
        // Refresh data only when needed
        if (forceUpdate || this.refreshRequired) {
          // TODO: Should be AxiosInstance
          const updates: Promise<any>[] = [];
          updates.push(this.getPerformance());
          updates.push(this.getProfit());
          updates.push(this.getTrades());
          updates.push(this.getBalance());
          //     /* white/blacklist might be refreshed more often as they are not expensive on the backend */
          updates.push(this.getWhitelist());
          updates.push(this.getBlacklist());
          await Promise.all(updates);
          this.refreshRequired = false;
        }
        return Promise.resolve();
      },
      async refreshFrequent() {
        // Refresh data that's needed in near realtime
        await this.getOpenTrades();
        await this.getState();
        await this.getLocks();
      },

      setDetailTrade(trade: Trade | null) {
        this.detailTradeId = trade?.trade_id || null;
        this.selectedPair = trade ? trade.pair : this.selectedPair;
      },
      saveCustomPlotConfig(plotConfig: PlotConfigStorage) {
        this.customPlotConfig = plotConfig;
        storeCustomPlotConfig(plotConfig);
        this.availablePlotConfigNames = getAllPlotConfigNames();
      },
      updatePlotConfigName(plotConfigName: string) {
        // Set default plot config name
        this.plotConfigName = plotConfigName;
        storePlotConfigName(plotConfigName);
      },
      setPlotConfigName(plotConfigName: string) {
        // TODO: This is identical to updatePlotConfigName
        this.plotConfigName = plotConfigName;
        storePlotConfigName(plotConfigName);
      },
      async getTrades() {
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
          if (Array.isArray(trades)) {
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
            this.trades = trades;
            this.tradeCount = tradesCount;
          }
          return Promise.resolve();
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          return Promise.reject(error);
        }
      },
      getOpenTrades() {
        return api
          .get<never, AxiosResponse<Trade[]>>('/status')
          .then((result) => {
            // Check if trade-id's are different in this call, then trigger a full refresh
            if (
              Array.isArray(this.openTrades) &&
              Array.isArray(result.data) &&
              (this.openTrades.length !== result.data.length ||
                !this.openTrades.every(
                  (val, index) => val.trade_id === result.data[index].trade_id,
                ))
            ) {
              // Open trades changed, so we should refresh now.
              this.refreshRequired = true;
              this.refreshSlow(false);
            }
            if (Array.isArray(result.data)) {
              const openTrades = result.data.map((t) => ({
                ...t,
                botId,
                botName,
                botTradeId: `${botId}__${t.trade_id}`,
              }));
              this.openTrades = openTrades;
            }
          })
          .catch(console.error);
      },
      getLocks() {
        return api
          .get('/locks')
          .then((result) => (this.currentLocks = result.data))
          .catch(console.error);
      },
      async deleteLock(lockid: string) {
        try {
          const res = await api.delete<LockResponse>(`/locks/${lockid}`);
          showAlert(`Deleted Lock ${lockid}.`);
          this.currentLocks = res.data;
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert(`Failed to delete lock ${lockid}`, 'danger');
          return Promise.reject(error);
        }
      },
      getPairCandles(payload: PairCandlePayload) {
        if (payload.pair && payload.timeframe) {
          this.historyStatus = LoadingStatus.loading;
          return api
            .get('/pair_candles', {
              params: { ...payload },
            })
            .then((result) => {
              this.candleData = {
                ...this.candleData,
                [`${payload.pair}__${payload.timeframe}`]: {
                  pair: payload.pair,
                  timeframe: payload.timeframe,
                  data: result.data,
                },
              };
              this.historyStatus = LoadingStatus.success;
            })
            .catch((err) => {
              console.error(err);
              this.historyStatus = LoadingStatus.error;
            });
        }
        // Error branchs
        const error = 'pair or timeframe not specified';
        console.error(error);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      },
      getPairHistory(payload: PairHistoryPayload) {
        if (payload.pair && payload.timeframe && payload.timerange) {
          this.historyStatus = LoadingStatus.loading;
          return api
            .get('/pair_history', {
              params: { ...payload },
              timeout: 50000,
            })
            .then((result) => {
              this.history = {
                [`${payload.pair}__${payload.timeframe}`]: {
                  pair: payload.pair,
                  timeframe: payload.timeframe,
                  timerange: payload.timerange,
                  data: result.data,
                },
              };
              this.historyStatus = LoadingStatus.success;
            })
            .catch((err) => {
              console.error(err);
              this.historyStatus = LoadingStatus.error;
            });
        }
        // Error branchs
        const error = 'pair or timeframe or timerange not specified';
        console.error(error);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      },
      async getStrategyPlotConfig() {
        try {
          const result = await api.get<PlotConfig>('/plot_config');
          const plotConfig = result.data;
          if (plotConfig.subplots === null) {
            // Subplots should not be null but an empty object
            // TODO: Remove this fix when fix in freqtrade is populated further.
            plotConfig.subplots = {};
          }
          this.strategyPlotConfig = result.data;
          return Promise.resolve();
        } catch (data) {
          console.error(data);
          return Promise.reject(data);
        }
      },
      getStrategyList() {
        return api
          .get<StrategyListResult>('/strategies')
          .then((result) => (this.strategyList = result.data.strategies))
          .catch(console.error);
      },
      async getStrategy(strategy: string) {
        try {
          const result = await api.get<StrategyResult>(`/strategy/${strategy}`, {});
          this.strategy = result.data;
          return Promise.resolve(result.data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getAvailablePairs(payload: AvailablePairPayload) {
        try {
          const result = await api.get<AvailablePairResult>('/available_pairs', {
            params: { ...payload },
          });
          // result is of type AvailablePairResult
          const { pairs } = result.data;
          this.pairlist = pairs;
          return Promise.resolve(result.data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getPerformance() {
        try {
          const result = await api.get<Performance[]>('/performance');
          this.performanceStats = result.data;
          return Promise.resolve(result.data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      getWhitelist() {
        return api
          .get<WhitelistResponse>('/whitelist')
          .then((result) => {
            this.whitelist = result.data.whitelist;
            this.pairlistMethods = result.data.method;
            return Promise.resolve(result.data);
          })
          .catch((error) => {
            // console.error(error);
            return Promise.reject(error);
          });
      },
      getBlacklist() {
        return api
          .get<BlacklistResponse>('/blacklist')
          .then((result) => (this.blacklist = result.data.blacklist))
          .catch(console.error);
      },
      getProfit() {
        return api
          .get('/profit')
          .then((result) => (this.profit = result.data))
          .catch(console.error);
      },
      async getBalance() {
        try {
          const result = await api.get('/balance');
          this.balance = result.data;
          return Promise.resolve(result.data);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      async getDaily(payload: DailyPayload = {}) {
        const { timescale = 20 } = payload;
        try {
          const { data } = await api.get<DailyReturnValue>('/daily', { params: { timescale } });
          this.dailyStats = data;
          return Promise.resolve(data);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      getState() {
        return api
          .get('/show_config')
          .then((result) => {
            this.botState = result.data;
            this.botStatusAvailable = true;
          })
          .catch(console.error);
      },
      getLogs() {
        return api
          .get('/logs')
          .then((result) => (this.lastLogs = result.data.logs))
          .catch(console.error);
      },
      // // Post methods
      // // TODO: Migrate calls to API to a seperate module unrelated to pinia?
      async startBot() {
        try {
          const res = await api.post<{}, AxiosResponse<StatusResponse>>('/start', {});
          console.log(res.data);
          showAlert(res.data.status);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert('Error starting bot.');
          return Promise.reject(error);
        }
      },
      async stopBot() {
        try {
          const res = await api.post<{}, AxiosResponse<StatusResponse>>('/stop', {});
          showAlert(res.data.status);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert('Error stopping bot.');
          return Promise.reject(error);
        }
      },
      async stopBuy() {
        try {
          const res = await api.post<{}, AxiosResponse<StatusResponse>>('/stopbuy', {});
          showAlert(res.data.status);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert('Error calling stopbuy.');
          return Promise.reject(error);
        }
      },
      async reloadConfig() {
        try {
          const res = await api.post<{}, AxiosResponse<StatusResponse>>('/reload_config', {});
          console.log(res.data);
          showAlert(res.data.status);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert('Error reloading.');
          return Promise.reject(error);
        }
      },
      async deleteTrade(tradeid: string) {
        try {
          const res = await api.delete<DeleteTradeResponse>(`/trades/${tradeid}`);
          showAlert(res.data.result_msg ? res.data.result_msg : `Deleted Trade ${tradeid}`);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert(`Failed to delete trade ${tradeid}`, 'danger');
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
      async forceexit(payload: ForceSellPayload) {
        try {
          const res = await api.post<ForceSellPayload, AxiosResponse<StatusResponse>>(
            '/forcesell',
            payload,
          );
          showAlert(`Sell order for ${payload.tradeid} created`);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert(`Failed to create sell order for ${payload.tradeid}`, 'danger');
          return Promise.reject(error);
        }
      },
      async forcebuy(payload: ForceEnterPayload) {
        if (payload && payload.pair) {
          try {
            // TODO: Update forcebuy to forceenter ...
            const res = await api.post<
              ForceEnterPayload,
              AxiosResponse<StatusResponse | TradeResponse>
            >('/forcebuy', payload);
            showAlert(`Order for ${payload.pair} created.`);

            return Promise.resolve(res);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              console.error(error.response);
              showAlert(
                `Error occured entering: '${(error as any).response?.data?.error}'`,
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
      async addBlacklist(payload: BlacklistPayload) {
        console.log(`Adding ${payload} to blacklist`);
        if (payload && payload.blacklist) {
          try {
            const result = await api.post<BlacklistPayload, AxiosResponse<BlacklistResponse>>(
              '/blacklist',
              payload,
            );
            this.blacklist = result.data.blacklist;
            if (result.data.errors && Object.keys(result.data.errors).length !== 0) {
              const { errors } = result.data;
              Object.keys(errors).forEach((pair) => {
                showAlert(
                  `Error while adding pair ${pair} to Blacklist: ${errors[pair].error_msg}`,
                );
              });
            } else {
              showAlert(`Pair ${payload.blacklist} added.`);
            }
            return Promise.resolve(result.data);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              console.error(error.response);
              showAlert(
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
      async deleteBlacklist(blacklistPairs: Array<string>) {
        console.log(`Deleting ${blacklistPairs} from blacklist.`);

        if (blacklistPairs) {
          try {
            const result = await api.delete<BlacklistPayload, AxiosResponse<BlacklistResponse>>(
              '/blacklist',
              {
                params: {
                  // eslint-disable-next-line @typescript-eslint/camelcase
                  pairs_to_delete: blacklistPairs,
                },
                paramsSerializer: (params) => parseParams(params),
              },
            );
            this.blacklist = result.data.blacklist;
            if (result.data.errors && Object.keys(result.data.errors).length !== 0) {
              const { errors } = result.data;
              Object.keys(errors).forEach((pair) => {
                showAlert(
                  `Error while removing pair ${pair} from Blacklist: ${errors[pair].error_msg}`,
                );
              });
            } else {
              showAlert(`Pair ${blacklistPairs} removed.`);
            }
            return Promise.resolve(result.data);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              console.error(error.response);
              showAlert(
                `Error occured while removing pairs from Blacklist: '${
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
      async startBacktest(payload: BacktestPayload) {
        try {
          const result = await api.post<BacktestPayload, AxiosResponse<BacktestStatus>>(
            '/backtest',
            payload,
          );
          this.updateBacktestRunning(result.data);
        } catch (err) {
          console.log(err);
        }
      },
      async pollBacktest() {
        const result = await api.get<BacktestStatus>('/backtest');

        this.updateBacktestRunning(result.data);
        if (result.data.running === false && result.data.backtest_result) {
          this.updateBacktestResult(result.data.backtest_result);
        }
      },
      async removeBacktest() {
        this.backtestHistory = {};
        try {
          const { data } = await api.delete<BacktestStatus>('/backtest');
          this.updateBacktestRunning(data);
          return Promise.resolve(data);
        } catch (err) {
          return Promise.reject(err);
        }
      },
      updateBacktestRunning(backtestStatus: BacktestStatus) {
        this.backtestRunning = backtestStatus.running;
        this.backtestProgress = backtestStatus.progress;
        this.backtestStep = backtestStatus.step;
        this.backtestTradeCount = backtestStatus.trade_count || 0;
      },
      async stopBacktest() {
        try {
          const { data } = await api.get<BacktestStatus>('/backtest/abort');
          this.updateBacktestRunning(data);
          return Promise.resolve(data);
        } catch (err) {
          return Promise.reject(err);
        }
      },
      async getBacktestHistory() {
        const result = await api.get<BacktestHistoryEntry[]>('/backtest/history');
        this.backtestHistoryList = result.data;
      },
      updateBacktestResult(backtestResult: BacktestResult) {
        this.backtestResult = backtestResult;
        // TODO: Properly identify duplicates to avoid pushing the same multiple times
        Object.entries(backtestResult.strategy).forEach(([key, strat]) => {
          console.log(key, strat);

          const stratKey = `${key}_${strat.total_trades}_${strat.profit_total.toFixed(3)}`;
          // this.backtestHistory[stratKey] = strat;
          this.backtestHistory = { ...this.backtestHistory, ...{ [stratKey]: strat } };
          this.selectedBacktestResultKey = stratKey;
        });
      },
      async getBacktestHistoryResult(payload: BacktestHistoryEntry) {
        const result = await api.get<BacktestStatus>('/backtest/history/result', {
          params: { filename: payload.filename, strategy: payload.strategy },
        });
        if (result.data.backtest_result) {
          this.updateBacktestResult(result.data.backtest_result);
        }
      },
      setBacktestResultKey(key: string) {
        this.selectedBacktestResultKey = key;
      },
      async getSysInfo() {
        try {
          const { data } = await api.get<SysInfoResponse>('/sysinfo');
          this.sysInfo = data;
          return Promise.resolve(data);
        } catch (err) {
          return Promise.reject(err);
        }
      },
    },
  });
  return useBotStore();
}
