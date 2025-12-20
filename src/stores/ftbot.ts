import type {
  AllProfitStats,
  AvailablePairPayload,
  AvailablePairResult,
  BackgroundTaskStatus,
  BacktestHistoryEntry,
  BacktestMarketChange,
  BacktestMetadataPatch,
  BacktestMetadataWithStrategyName,
  BacktestPayload,
  BacktestResult,
  BacktestResultInMemory,
  BacktestResultUpdate,
  BacktestStatus,
  BalanceInterface,
  BgTaskStarted,
  BlacklistPayload,
  BlacklistResponse,
  BotDescriptor,
  BotFeatures,
  BotState,
  ClosedTrade,
  DeleteTradeResponse,
  DownloadDataPayload,
  EntryStats,
  Exchange,
  ExchangeListResult,
  ExitStats,
  ForceEnterPayload,
  ForceExitPayload,
  FreqAIModelListResult,
  HyperoptLossListResponse,
  HyperoptLossObj,
  LockResponse,
  LogLine,
  Markets,
  MarketsPayload,
  MixTagStats,
  PairCandlePayload,
  PairHistory,
  PairHistoryPayload,
  PairIntervalTuple,
  PairlistEvalResponse,
  PairlistsPayload,
  PairlistsResponse,
  PerformanceEntry,
  PlotConfig,
  ProfitStats,
  StatusResponse,
  StrategyListResult,
  StrategyResult,
  SysInfoResponse,
  TimeSummaryPayload,
  TimeSummaryReturnValue,
  Trade,
  TradeResponse,
  WhitelistResponse,
} from '@/types';
import { BacktestSteps, LoadingStatus, RunModes, TimeSummaryOptions } from '@/types';
import type { FTWsMessage } from '@/types/wsMessageTypes';
import { FtWsMessageTypes } from '@/types/wsMessageTypes';
import { useWebSocket } from '@vueuse/core';
import type { AxiosResponse } from 'axios';
import axios from 'axios';

import { evaluateFeatures } from '@/utils/features';

export function createBotSubStore(botId: string, botName: string) {
  const loginInfo = useLoginInfo(botId);
  const { api } = useApi(loginInfo, botId);

  const { showAlert } = useAlertForBot(botName);

  const useBotStore = defineStore(botId, {
    state: () => {
      return {
        websocketStarted: false,
        isSelected: true,
        ping: '',
        botStatusAvailable: false,
        isBotOnline: false,
        isBotLoggedIn: true,
        autoRefresh: false,
        refreshing: false,
        versionState: '',
        lastLogs: [] as LogLine[],
        refreshRequired: true,
        trades: [] as ClosedTrade[],
        openTrades: [] as Trade[],
        tradeCount: 0,
        performanceStats: [] as PerformanceEntry[],
        entryStats: [] as EntryStats[],
        exitStats: [] as ExitStats[],
        mixTagStats: [] as MixTagStats[],
        whitelist: [] as string[],
        blacklist: [] as string[],
        profitAll: {} as AllProfitStats,
        botState: {} as BotState,
        balance: {} as BalanceInterface,
        dailyStats: {} as TimeSummaryReturnValue,
        weeklyStats: {} as TimeSummaryReturnValue,
        monthlyStats: {} as TimeSummaryReturnValue,
        pairlistMethods: [] as string[],
        detailTradeId: null as number | null,
        selectedPair: '',
        plotMultiPairs: [] as string[],
        // TODO: type me
        candleData: {},
        candleDataStatus: LoadingStatus.not_loaded,
        // TODO: type me
        history: {},
        historyStatus: LoadingStatus.not_loaded,
        historyTakesLonger: false,
        strategyList: [] as string[],
        freqaiModelList: [] as string[],
        hyperoptLossList: [] as HyperoptLossObj[],
        exchangeList: [] as Exchange[],
        strategy: {} as StrategyResult,
        pairlist: [] as string[],
        pairlistWithTimeframe: [] as PairIntervalTuple[],
        currentLocks: undefined as LockResponse | undefined,
        // backtesting
        backtestRunning: false,
        backtestProgress: 0.0,
        backtestStep: BacktestSteps.none,
        backtestTradeCount: 0,
        selectedBacktestResultKey: '',
        backtestHistory: {} as Record<string, BacktestResultInMemory>,
        backtestHistoryList: [] as BacktestHistoryEntry[],
        sysInfo: {} as SysInfoResponse,
      };
    },
    getters: {
      version: (state) => state.botState?.version || state.versionState,
      botApiVersion: (state) => state.botState?.api_version || 1.0,
      botFeatures(): BotFeatures {
        return evaluateFeatures(this.botState, this.botApiVersion);
      },
      stakeCurrency: (state) => state.botState?.stake_currency || '',
      stakeCurrencyDecimals: (state) => state.botState?.stake_currency_decimals || 3,
      canRunBacktest: (state) => state.botState?.runmode === RunModes.WEBSERVER,
      isWebserverMode: (state) => state.botState?.runmode === RunModes.WEBSERVER,
      selectedBacktestResult: (state) =>
        state.backtestHistory[state.selectedBacktestResultKey]?.strategy,
      selectedBacktestMetadata: (state) =>
        state.backtestHistory[state.selectedBacktestResultKey]?.metadata,
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
      tradeDetail: (state): Trade | undefined => {
        // console.log('tradeDetail', state.openTrades.length, state.openTrades);
        let dTrade = state.openTrades.find((item) => item.trade_id === state.detailTradeId);
        if (!dTrade) {
          dTrade = state.trades.find((item) => item.trade_id === state.detailTradeId);
        }
        return dTrade;
      },
      refreshNow: (state) => {
        if (
          state.autoRefresh &&
          state.isBotOnline &&
          state.botState?.runmode !== RunModes.WEBSERVER
        ) {
          return true;
        }
        return false;
      },
      uiBotName: (state) => botName || state.botState?.bot_name || 'freqtrade',
      botName: (state) => state.botState?.bot_name || 'freqtrade',
      botId: () => botId,
      allTrades: (state) => [...state.openTrades, ...state.trades] as Trade[],
      activeLocks: (state) => state.currentLocks?.locks || [],
      profit: (state): ProfitStats => state.profitAll.all,
    },
    actions: {
      botAdded() {
        this.autoRefresh = loginInfo.autoRefresh.value;
      },
      async fetchPing() {
        try {
          const result = await api.get('/ping');
          const now = Date.now();
          this.ping = `${result.data.status} ${now.toString()}`;
          this.setIsBotOnline(true);
          return Promise.resolve();
        } catch (error) {
          this.setIsBotOnline(false);
          return Promise.reject();
        }
      },
      logout() {
        loginInfo.logout();
      },
      getLoginInfo() {
        return loginInfo.getLoginInfo();
      },
      updateBot(updatedBotInfo: Partial<BotDescriptor>) {
        loginInfo.updateBot(updatedBotInfo);
      },
      setAutoRefresh(newRefreshValue: boolean) {
        this.autoRefresh = newRefreshValue;
        // TODO: Investigate this -
        // this ONLY works if ReloadControl is only visible once,otherwise it triggers twice
        if (newRefreshValue) {
          this.refreshFrequent();
          this.refreshSlow(true);
        }
        loginInfo.autoRefresh.value = newRefreshValue;
      },
      setIsBotOnline(isBotOnline: boolean) {
        if (!this.isBotOnline && isBotOnline && this.isBotLoggedIn) {
          // Bot just came online.
          // Refresh everything
          this.refreshRequired = true;
          this.refreshSlow(true);
        }
        this.isBotOnline = isBotOnline;
      },
      async refreshSlow(forceUpdate = false) {
        if (this.refreshing && !forceUpdate) {
          return;
        }
        // Refresh data only when needed
        if (forceUpdate || this.refreshRequired) {
          try {
            this.refreshing = true;
            // TODO: Should be AxiosInstance
            const updates: Promise<unknown>[] = [];
            updates.push(this.getState());
            updates.push(this.getProfit());
            updates.push(this.getTrades());
            updates.push(this.getBalance());
            //     /* white/blacklist might be refreshed more often as they are not expensive on the backend */
            updates.push(this.getWhitelist());
            updates.push(this.getBlacklist());
            await Promise.all(updates);
            this.refreshRequired = false;
          } finally {
            this.refreshing = false;
          }
        }
        return Promise.resolve();
      },
      async refreshFrequent() {
        // Refresh data that's needed in near realtime
        await this.getOpenTrades();
        await this.getLocks();
      },

      setDetailTrade(trade: Trade | null) {
        this.detailTradeId = trade?.trade_id || null;
        this.selectedPair = trade ? trade.pair : this.selectedPair;
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
      async getOpenTrades() {
        try {
          const { data } = await api.get<never, AxiosResponse<Trade[]>>('/status');
          // Check if trade-id's are different in this call, then trigger a full refresh
          if (
            Array.isArray(this.openTrades) &&
            Array.isArray(data) &&
            (this.openTrades.length !== data.length ||
              !this.openTrades.every((val, index) => val.trade_id === data[index]?.trade_id))
          ) {
            // Open trades changed, so we should refresh now.
            this.refreshRequired = true;
            this.refreshSlow(false);
          }
          if (Array.isArray(data)) {
            const openTrades = data.map((t) => ({
              ...t,
              botId,
              botName,
              botTradeId: `${botId}__${t.trade_id}`,
            }));
            this.openTrades = openTrades;
            if (this.selectedPair === '') {
              this.selectedPair = openTrades[0]?.pair || '';
            }
          }
        } catch (data) {
          return console.error(data);
        }
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
          showAlert(`Failed to delete lock ${lockid}`, 'error');
          return Promise.reject(error);
        }
      },
      async getPairCandles(payload: PairCandlePayload) {
        if (payload.pair && payload.timeframe) {
          this.candleDataStatus = LoadingStatus.loading;
          try {
            let result: PairHistory | null = null;
            const settingsStore = useSettingsStore();
            if (this.botFeatures.reducedPairCalls && settingsStore.useReducedPairCalls) {
              // Modern approach, allowing filtering of columns
              const { data } = await api.post<PairCandlePayload, AxiosResponse<PairHistory>>(
                '/pair_candles',
                payload,
              );
              result = data;
            } else {
              const { data } = await api.get<PairHistory>('/pair_candles', {
                params: { ...payload },
              });
              result = data;
            }
            if (result) {
              this.candleData = {
                ...this.candleData,
                [`${payload.pair}__${payload.timeframe}`]: {
                  pair: payload.pair,
                  timeframe: payload.timeframe,
                  data: result,
                },
              };
            }
            this.candleDataStatus = LoadingStatus.success;
          } catch (err) {
            console.error(err);
            this.candleDataStatus = LoadingStatus.error;
          }
        } else {
          // Error branchs
          const error = 'pair or timeframe not specified';
          console.error(error);
          return new Promise((resolve, reject) => {
            reject(error);
          });
        }
      },
      async getPairHistory(payload: PairHistoryPayload) {
        if (payload.pair && payload.timeframe) {
          this.historyStatus = LoadingStatus.loading;
          this.historyTakesLonger = false;
          try {
            const settingsStore = useSettingsStore();
            let result: PairHistory | null = null;
            const loadingTimer = setTimeout(() => (this.historyTakesLonger = true), 10000);
            const timeout = 2 * 60 * 1000; // in MS
            if (this.botFeatures.reducedPairCalls && settingsStore.useReducedPairCalls) {
              // Modern approach, allowing filtering of columns
              const { data } = await api.post<PairHistoryPayload, AxiosResponse<PairHistory>>(
                '/pair_history',
                payload,
                { timeout },
              );
              result = data;
            } else {
              const { data } = await api.get<PairHistory>('/pair_history', {
                params: { ...payload },
                timeout,
              });
              result = data;
            }
            clearTimeout(loadingTimer);
            this.history[`${payload.pair}__${payload.timeframe}`] = {
              pair: payload.pair,
              timeframe: payload.timeframe,
              timerange: payload.timerange,
              data: result,
            };
            this.historyStatus = LoadingStatus.success;
            return;
          } catch (err) {
            console.error(err);
            this.historyStatus = LoadingStatus.error;
            if (axios.isAxiosError(err)) {
              console.error(err.response);
              const errMsg = err.response?.data?.detail ?? 'Error fetching history';
              showAlert(errMsg, 'error');
            }

            return new Promise((resolve, reject) => {
              reject(err);
            });
          } finally {
            this.historyTakesLonger = false;
          }
        }
        // Error branchs
        const error = 'pair or timeframe or timerange not specified';
        console.error(error);
        return new Promise((resolve, reject) => {
          reject(error);
        });
      },
      async getStrategyPlotConfig(): Promise<PlotConfig | undefined> {
        try {
          const payload = {};
          if (this.isWebserverMode) {
            if (!this.strategy.strategy) {
              return Promise.reject({ data: 'No strategy selected' });
            }
            payload['strategy'] = this.strategy.strategy;
          }

          const { data: plotConfig } = await api.get<Partial<PlotConfig>>('/plot_config', {
            params: { ...payload },
          });
          const finalPlotConfig: PlotConfig = {
            subplots: {},
            main_plot: {},
            ...plotConfig,
          };
          return Promise.resolve(finalPlotConfig);
        } catch (data) {
          console.error(data);
          return Promise.reject(data);
        }
      },
      async getStrategyList() {
        try {
          const { data } = await api.get<StrategyListResult>('/strategies');
          this.strategyList = data.strategies;
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getStrategy(strategy: string) {
        try {
          const { data } = await api.get<StrategyResult>(`/strategy/${strategy}`, {});
          this.strategy = data;
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          if (axios.isAxiosError(error)) {
            console.error(error.response);
            const errMsg = error.response?.data?.detail ?? 'Error fetching history';
            showAlert(errMsg, 'warn');
          }
          return Promise.reject(error);
        }
      },
      async getFreqAIModelList() {
        try {
          const { data } = await api.get<FreqAIModelListResult>('/freqaimodels');
          this.freqaiModelList = data.freqaimodels;
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getHyperoptLossList() {
        try {
          // Only available starting with 2.40
          const { data } = await api.get<HyperoptLossListResponse>('/hyperopt-loss');
          this.hyperoptLossList = data.loss_functions;
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getExchangeList() {
        try {
          const { data } = await api.get<ExchangeListResult>('/exchanges');
          this.exchangeList = data.exchanges;
          return Promise.resolve(data.exchanges);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getAvailablePairs(payload: AvailablePairPayload) {
        try {
          const { data } = await api.get<AvailablePairResult>('/available_pairs', {
            params: { ...payload },
          });
          // result is of type AvailablePairResult
          this.pairlist = data.pairs;
          this.pairlistWithTimeframe = data.pair_interval;
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getMarkets(payload: MarketsPayload) {
        try {
          const { data } = await api.get<Markets>(`/markets`, {
            params: { ...payload },
          });
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getPerformance() {
        try {
          const { data } = await api.get<PerformanceEntry[]>('/performance');
          this.performanceStats = data;
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getEntryStats() {
        // Available with >=2.34
        try {
          const { data } = await api.get<EntryStats[]>('/entries');
          this.entryStats = data;
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getExitStats() {
        // Available with >=2.34
        try {
          const { data } = await api.get<ExitStats[]>('/exits');
          this.exitStats = data;
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getMixTagStats() {
        // Available with >=2.34
        try {
          const { data } = await api.get<MixTagStats[]>('/mix_tags');
          this.mixTagStats = data;
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getWhitelist() {
        try {
          const { data } = await api.get<WhitelistResponse>('/whitelist');
          this.whitelist = data.whitelist;
          this.pairlistMethods = data.method;
          return Promise.resolve(data);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      async getBlacklist() {
        try {
          const { data } = await api.get<BlacklistResponse>('/blacklist');
          this.blacklist = data.blacklist;
          return Promise.resolve(data);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      async getProfit() {
        try {
          if (this.botFeatures.hasProfitAll) {
            const { data } = await api.get<AllProfitStats>('/profit_all');
            this.profitAll = data;
            return Promise.resolve(data);
          }
          // Fallback to old profit endpoint
          const { data } = await api.get<ProfitStats>('/profit');
          this.profitAll['all'] = data;
          return Promise.resolve(data);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      async getBalance() {
        try {
          const { data } = await api.get('/balance');
          this.balance = data;
          return Promise.resolve(data);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      async getTimeSummary(aggregation: TimeSummaryOptions, payload: TimeSummaryPayload = {}) {
        const { timescale = 20 } = payload;
        try {
          const { data } = await api.get<TimeSummaryReturnValue>(`/${aggregation}`, {
            params: { timescale },
          });
          if (aggregation === TimeSummaryOptions.daily) {
            this.dailyStats = data;
          } else if (aggregation === TimeSummaryOptions.weekly) {
            this.weeklyStats = data;
          } else if (aggregation === TimeSummaryOptions.monthly) {
            this.monthlyStats = data;
          }

          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getState() {
        try {
          const { data } = await api.get<BotState>('/show_config');
          this.botState = data;
          this.botStatusAvailable = true;
          this.startWebSocket();
          if (this.isWebserverMode) {
            const { recoverBgJobs } = useBackgroundJob();
            recoverBgJobs(api, showAlert).then();
          }
          return Promise.resolve(data);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      async getLogs() {
        try {
          const { data } = await api.get('/logs');
          this.lastLogs = data.logs;
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getPairlists() {
        try {
          const { data } = await api.get<PairlistsResponse>('/pairlists/available');
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async evaluatePairlist(payload: PairlistsPayload) {
        try {
          const { data } = await api.post<PairlistsPayload, AxiosResponse<BgTaskStarted>>(
            '/pairlists/evaluate',
            payload,
          );
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getPairlistEvalResult(jobId: string) {
        try {
          const { data } = await api.get<PairlistEvalResponse>(`/pairlists/evaluate/${jobId}`);
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async getBackgroundJobStatus(jobId: string) {
        try {
          const { data } = await api.get<BackgroundTaskStatus>(`/background/${jobId}`);
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      async startDataDownload(payload: DownloadDataPayload) {
        try {
          const { data } = await api.post<DownloadDataPayload, AxiosResponse<BgTaskStarted>>(
            '/download_data',
            payload,
          );
          const { startBgJob } = useBackgroundJob();
          startBgJob(api, showAlert, data.job_id, 'download_data');
          return Promise.resolve(data);
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      },
      // // Post methods
      // // TODO: Migrate calls to API to a seperate module unrelated to pinia?
      async startBot() {
        try {
          const { data } = await api.post<Record<string, never>, AxiosResponse<StatusResponse>>(
            '/start',
            {},
          );
          console.log(data);
          showAlert(data.status);
          return Promise.resolve(data);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert('Error starting bot.', 'error');
          return Promise.reject(error);
        }
      },
      async stopBot() {
        try {
          const res = await api.post<Record<string, never>, AxiosResponse<StatusResponse>>(
            '/stop',
            {},
          );
          showAlert(res.data.status);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert('Error stopping bot.', 'error');
          return Promise.reject(error);
        }
      },
      async stopBuy() {
        try {
          const res = await api.post<Record<string, never>, AxiosResponse<StatusResponse>>(
            '/stopbuy',
            {},
          );
          showAlert(res.data.status);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert('Error calling stopbuy.', 'error');
          return Promise.reject(error);
        }
      },
      async reloadConfig() {
        try {
          const res = await api.post<Record<string, never>, AxiosResponse<StatusResponse>>(
            '/reload_config',
            {},
          );
          console.log(res.data);
          showAlert(res.data.status);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert('Error reloading.', 'error');
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
          showAlert(`Failed to delete trade ${tradeid}`, 'error');
          return Promise.reject(error);
        }
      },
      async cancelOpenOrder(tradeid: string) {
        try {
          const res = await api.delete<DeleteTradeResponse>(`/trades/${tradeid}/open-order`);
          showAlert(
            res.data.result_msg ? res.data.result_msg : `Canceled open order for ${tradeid}`,
          );
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert(`Failed to cancel open order ${tradeid}`, 'error');
          return Promise.reject(error);
        }
      },
      async reloadTrade(tradeid: string) {
        try {
          const res = await api.post<never, AxiosResponse<Trade>>(`/trades/${tradeid}/reload`);
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert(`Failed to reload trade ${tradeid}`, 'error');
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
      async forceexit(payload: ForceExitPayload) {
        try {
          const res = await api.post<ForceExitPayload, AxiosResponse<StatusResponse>>(
            '/forcesell',
            payload,
          );
          showAlert(`Exit order for ${payload.tradeid} created`, 'success');
          return Promise.resolve(res);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response);
          }
          showAlert(`Failed to create exit order for ${payload.tradeid}`, 'error');
          return Promise.reject(error);
        }
      },
      async forceentry(payload: ForceEnterPayload) {
        if (payload && payload.pair) {
          try {
            // TODO: Update forcebuy to forceenter ...
            const res = await api.post<
              ForceEnterPayload,
              AxiosResponse<StatusResponse | TradeResponse>
            >('/forcebuy', payload);
            showAlert(`Order for ${payload.pair} created.`, 'success');

            return Promise.resolve(res);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              console.error(error.response);
              showAlert(`Error occured entering: '${error.response?.data?.error}'`, 'error');
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
                  `Error while adding pair ${pair} to Blacklist: ${errors[pair]?.error_msg}`,
                  'error',
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
                `Error occured while adding pairs to Blacklist: '${error.response?.data?.error}'`,
                'error',
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
                  pairs_to_delete: blacklistPairs,
                },
                paramsSerializer: {
                  indexes: null,
                },
              },
            );
            this.blacklist = result.data.blacklist;
            if (result.data.errors && Object.keys(result.data.errors).length !== 0) {
              const { errors } = result.data;
              Object.keys(errors).forEach((pair) => {
                showAlert(
                  `Error while removing pair ${pair} from Blacklist: ${errors[pair]?.error_msg}`,
                  'error',
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
                `Error occured while removing pairs from Blacklist: '${error.response?.data?.error}'`,
                'error',
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
        const { data } = await api.get<BacktestStatus>('/backtest');

        this.updateBacktestRunning(data);
        if (data.running === false && data.backtest_result) {
          this.updateBacktestResult(data.backtest_result);
        }
        if (data.status === 'error') {
          showAlert(`Backtest failed: ${data.status_msg}.`, 'error');
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
        const { data } = await api.get<BacktestHistoryEntry[]>('/backtest/history');
        this.backtestHistoryList = data;
      },
      updateBacktestResult(backtestResult: BacktestResult) {
        Object.entries(backtestResult.strategy).forEach(([key, strat]) => {
          const existingMetadata = backtestResult.metadata[key];
          if (!existingMetadata) {
            console.warn(`No metadata found for strategy ${key}`);
            return;
          }
          const metadata: BacktestMetadataWithStrategyName = {
            ...existingMetadata,
            strategyName: key,
            notes: backtestResult.metadata[key]?.notes ?? ``,
            editing: false,
          };
          // console.log(key, strat, metadata);

          // Never versions will always have run_id
          const stratKey =
            existingMetadata.run_id ??
            `${key}_${strat.total_trades}_${strat.profit_total.toFixed(3)}`;
          const btResult: BacktestResultInMemory = {
            metadata,
            strategy: strat,
          };
          // this.backtestHistory[stratKey] = strat;
          this.backtestHistory = { ...this.backtestHistory, ...{ [stratKey]: btResult } };
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
      async deleteBacktestHistoryResult(btHistoryEntry: BacktestHistoryEntry) {
        try {
          const { data } = await api.delete<BacktestHistoryEntry[]>(
            `/backtest/history/${btHistoryEntry.filename}`,
          );
          this.backtestHistoryList = data;
        } catch (err) {
          console.error(err);
          return Promise.reject(err);
        }
      },
      async getBacktestMarketChange() {
        if (!this.selectedBacktestMetadata?.filename) {
          return Promise.reject('No backtest selected');
        }
        try {
          const { data } = await api.get<BacktestMarketChange>(
            `/backtest/history/${this.selectedBacktestMetadata.filename}/market_change`,
          );
          return data;
        } catch (err) {
          console.error(err);
          return Promise.reject(err);
        }
      },
      async saveBacktestResultMetadata(payload: BacktestResultUpdate) {
        try {
          const { data } = await api.patch<
            BacktestMetadataPatch,
            AxiosResponse<BacktestHistoryEntry[]>
          >(`/backtest/history/${payload.filename}`, payload);
          console.log(data);
          data.forEach((entry) => {
            const existingEntry = this.backtestHistory[entry.run_id];
            if (existingEntry) {
              existingEntry.metadata.notes = entry.notes;
              console.log('updating ...');
            }
          });
          // Update metadata in backtestHistoryList
        } catch (err) {
          console.error(err);
          return Promise.reject(err);
        }
      },
      setBacktestResultKey(key: string) {
        this.selectedBacktestResultKey = key;
      },
      removeBacktestResultFromMemory(key: string) {
        if (this.selectedBacktestResultKey === key) {
          // Get first key from backtestHistory that is not the key to be deleted
          const keys = Object.keys(this.backtestHistory);
          const index = keys.findIndex((k) => k !== key);
          if (index !== -1) {
            this.selectedBacktestResultKey = keys[index]!;
          }
        }
        delete this.backtestHistory[key];
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _handleWebsocketMessage(ws, event: MessageEvent<any>) {
        const msg: FTWsMessage = JSON.parse(event.data);
        switch (msg.type) {
          case FtWsMessageTypes.exception:
            showAlert(`WSException: ${msg.data}`, 'error');
            break;
          case FtWsMessageTypes.whitelist:
            this.whitelist = msg.data;
            break;
          case FtWsMessageTypes.entryFill:
          case FtWsMessageTypes.exitFill:
          case FtWsMessageTypes.exitCancel:
          case FtWsMessageTypes.entryCancel:
            showNotification(msg, botName);
            break;
          case FtWsMessageTypes.newCandle: {
            const [pair, timeframe] = msg.data;
            // TODO: check for active bot ...
            if (this.plotMultiPairs.length > 0 && this.plotMultiPairs.includes(pair)) {
              // Reload pair candles
              const plotStore = usePlotConfigStore();
              this.getPairCandles({ pair, timeframe, columns: plotStore.usedColumns });
            }
            break;
          }
          default:
            // Unhandled events ...
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            console.log(`Received event ${(msg as any).type}`);
            break;
        }
      },
      startWebSocket() {
        if (
          this.websocketStarted === true ||
          this.botStatusAvailable === false ||
          !this.botFeatures.websocketConnection ||
          this.isWebserverMode === true
        ) {
          return;
        }
        const { send, close } = useWebSocket(
          // 'ws://localhost:8080/api/v1/message/ws?token=testtoken',
          `${loginInfo.baseWsUrl.value}/message/ws?token=${loginInfo.accessToken.value}`,
          {
            autoReconnect: {
              delay: 10000,
              // retries: 10
            },
            // heartbeat: {
            //   message: JSON.stringify({ type: 'ping' }),
            //   interval: 10000,
            // },
            onError: (ws, event) => {
              console.log('onError', event, ws);
              this.websocketStarted = false;
              close();
            },
            onMessage: this._handleWebsocketMessage,
            onConnected: () => {
              console.log('subscribing');
              if (this.isWebserverMode !== true) {
                //
                this.websocketStarted = true;
                const subscriptions = [
                  FtWsMessageTypes.whitelist,
                  FtWsMessageTypes.entryFill,
                  FtWsMessageTypes.exitFill,
                  FtWsMessageTypes.entryCancel,
                  FtWsMessageTypes.exitCancel,
                  /*'new_candle' /*'analyzed_df'*/
                ];
                if (this.botFeatures.websocketNewCandle) {
                  subscriptions.push(FtWsMessageTypes.newCandle);
                }

                send(
                  JSON.stringify({
                    type: 'subscribe',
                    data: subscriptions,
                  }),
                );
                send(
                  JSON.stringify({
                    type: FtWsMessageTypes.whitelist,
                    data: '',
                  }),
                );
              }
            },
          },
        );
      },
    },
  });

  if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useBotStore, import.meta.hot));
  }

  return useBotStore();
}
