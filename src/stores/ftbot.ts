import type {
  AllProfitStats,
  AvailablePairPayload,
  AvailablePairResult,
  BackgroundTaskStatus,
  BacktestHistoryEntry,
  BacktestMarketChange,
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
  JobCategory,
  LockResponse,
  LogLine,
  LookaheadAnalysis,
  LookaheadAnalysisPayload,
  Markets,
  MarketsPayload,
  MixTagStats,
  PairCandlePayload,
  PairHistory,
  PairHistoryLocal,
  PairHistoryPayload,
  PairIntervalTuple,
  PairlistEvalResponse,
  PairlistsPayload,
  PairlistsResponse,
  PerformanceEntry,
  PlotConfig,
  ProfitStats,
  RecursiveAnalysis,
  RecursiveAnalysisPayload,
  StatusResponse,
  StrategyListResult,
  StrategyResult,
  SysInfoResponse,
  TimeSummaryPayload,
  TimeSummaryReturnValue,
  Trade,
  TradeCustomData,
  TradeResponse,
  WalletHistory,
  WalletHistoryPerBot,
  WhitelistResponse,
} from '@/types';
import { BacktestSteps, LoadingStatus, RunModes, TimeSummaryOptions } from '@/types';
import type { FTWsMessage } from '@/types/wsMessageTypes';
import { FtWsMessageTypes } from '@/types/wsMessageTypes';
import { useWebSocket } from '@vueuse/core';

import { evaluateFeatures } from '@/utils/features';

export function createBotSubStore(botId: string, botName: string) {
  const loginInfo = useLoginInfo(botId);
  const { api } = useApi(loginInfo, botId);

  const { showAlert } = useAlertForBot(botName);

  const useBotStore = defineStore(botId, () => {
    const isSelected = ref(true);
    const ping = ref('');
    const botStatusAvailable = ref(false);
    const isBotOnline = ref(false);
    const isBotLoggedIn = ref(true);
    const autoRefresh = ref(false);
    const refreshing = ref(false);
    const versionState = ref('');
    const refreshRequired = ref(true);
    const trades = ref<ClosedTrade[]>([]);
    const openTrades = ref<Trade[]>([]);
    const tradeCount = ref(0);

    const pairlistMethods = ref<string[]>([]);
    const detailTradeId = ref<number | null>(null);
    const selectedPair = ref('');
    const plotMultiPairs = ref<string[]>([]);

    const historyTakesLonger = ref(false);
    const strategyList = ref<string[]>([]);
    const freqaiModelList = ref<string[]>([]);
    const hyperoptLossList = ref<HyperoptLossObj[]>([]);
    const exchangeList = ref<Exchange[]>([]);
    const strategy = ref<StrategyResult | undefined>({} as StrategyResult);
    const pairlist = ref<string[]>([]);
    const pairlistWithTimeframe = ref<PairIntervalTuple[]>([]);

    const botState = shallowRef<BotState>({} as BotState);
    const version = computed(() => botState.value?.version || versionState.value);
    const botApiVersion = computed(() => botState.value?.api_version || 1.0);
    const botFeatures = computed<BotFeatures>(() =>
      evaluateFeatures(botState.value, botApiVersion.value),
    );
    const stakeCurrency = computed(() => botState.value?.stake_currency || '');
    const stakeCurrencyDecimals = computed(() => botState.value?.stake_currency_decimals || 3);
    const isWebserverMode = computed(() => botState.value?.runmode === RunModes.WEBSERVER);

    const shortAllowed = computed(() => botState.value?.short_allowed || false);
    const isTrading = computed(
      () =>
        botState.value?.runmode === RunModes.LIVE || botState.value?.runmode === RunModes.DRY_RUN,
    );
    const timeframe = computed(() => botState.value?.timeframe || '');

    const openTradeCount = computed(() => openTrades.value.length);

    const closedTrades = computed(() => {
      return trades.value
        .filter((item) => !item.is_open)
        .sort((a, b) =>
          // Sort by close timestamp, then by tradeid
          b.close_timestamp && a.close_timestamp
            ? b.close_timestamp - a.close_timestamp
            : b.trade_id - a.trade_id,
        );
    });
    const tradeDetail = computed<Trade | undefined>(() => {
      let dTrade = openTrades.value.find((item) => item.trade_id === detailTradeId.value);
      if (!dTrade) {
        dTrade = trades.value.find((item) => item.trade_id === detailTradeId.value);
      }
      return dTrade;
    });
    const refreshNow = computed(() => {
      if (
        autoRefresh.value &&
        isBotOnline.value &&
        botState.value?.runmode !== RunModes.WEBSERVER
      ) {
        return true;
      }
      return false;
    });
    const uiBotName = computed(() => botName || botState.value?.bot_name || 'freqtrade');
    const storeBotName = computed(() => botState.value?.bot_name || 'freqtrade');
    const storeBotId = computed(() => botId);
    const allTrades = computed(() => [...openTrades.value, ...trades.value] as Trade[]);

    function botAdded() {
      autoRefresh.value = loginInfo.autoRefresh.value;
    }

    async function fetchPing() {
      try {
        const result = await api<{ status: string }>('/ping');
        const now = Date.now();
        ping.value = `${result.status} ${now.toString()}`;
        setIsBotOnline(true);
        return Promise.resolve();
      } catch (error) {
        setIsBotOnline(false);
        return Promise.reject();
      }
    }

    function logout() {
      closeWebSocket();
      loginInfo.logout();
    }

    function getLoginInfo() {
      return loginInfo.getLoginInfo();
    }

    function updateBot(updatedBotInfo: Partial<BotDescriptor>) {
      loginInfo.updateBot(updatedBotInfo);
    }

    function setAutoRefresh(newRefreshValue: boolean) {
      autoRefresh.value = newRefreshValue;
      // TODO: Investigate this -
      // this ONLY works if ReloadControl is only visible once,otherwise it triggers twice
      if (newRefreshValue) {
        refreshFrequent();
        refreshSlow(true);
      }
      loginInfo.autoRefresh.value = newRefreshValue;
    }

    function setIsBotOnline(nextIsBotOnline: boolean) {
      if (!isBotOnline.value && nextIsBotOnline && isBotLoggedIn.value) {
        // Bot just came online.
        // Refresh everything
        refreshRequired.value = true;
        refreshSlow(true);
      }
      isBotOnline.value = nextIsBotOnline;
    }

    async function refreshSlow(forceUpdate = false) {
      if (refreshing.value && !forceUpdate) {
        return;
      }
      if (forceUpdate || refreshRequired.value) {
        try {
          refreshing.value = true;
          // TODO: Should be AxiosInstance
          const updates: Promise<unknown>[] = [];
          updates.push(getState());
          updates.push(getProfit());
          updates.push(getTrades());
          updates.push(getBalance());
          updates.push(updateWalletChange());
          /* white/blacklist might be refreshed more often as they are not expensive on the backend */
          updates.push(getWhitelist());
          updates.push(getBlacklist());
          updates.push(getCurrentStrategy());
          await Promise.all(updates);
          refreshRequired.value = false;
        } finally {
          refreshing.value = false;
        }
      }
      return Promise.resolve();
    }

    async function refreshFrequent() {
      // Refresh data that's needed in near realtime
      await getOpenTrades();
      await getLocks();
    }

    function setDetailTrade(trade: Trade | null) {
      detailTradeId.value = trade?.trade_id || null;
      selectedPair.value = trade ? trade.pair : selectedPair.value;
    }

    async function getTrades() {
      try {
        let totalTrades = 0;
        const pageLength = 500;
        const fetchTrades = async (limit: number, offset: number) => {
          return api<TradeResponse>('/trades', {
            query: { limit, offset },
          });
        };
        const result = await fetchTrades(pageLength, 0);
        let { trades: fetchedTrades } = result;
        if (Array.isArray(fetchedTrades)) {
          if (fetchedTrades.length !== result.total_trades) {
            // Pagination necessary
            // Don't use Promise.all - this would fire all requests at once, which can
            // cause problems for big sqlite databases
            do {
              const nextResult = await fetchTrades(pageLength, fetchedTrades.length);
              fetchedTrades = fetchedTrades.concat(nextResult.trades);
              totalTrades = nextResult.total_trades;
            } while (fetchedTrades.length !== totalTrades);
          }
          const tradesCount = fetchedTrades.length;
          trades.value = fetchedTrades.map((t) => ({
            ...t,
            botId,
            botName,
            botTradeId: `${botId}__${t.trade_id}`,
          }));
          tradeCount.value = tradesCount;
        }
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    }

    async function getOpenTrades() {
      try {
        const data = await api<Trade[]>('/status');
        if (
          Array.isArray(openTrades.value) &&
          Array.isArray(data) &&
          (openTrades.value.length !== data.length ||
            !openTrades.value.every((val, index) => val.trade_id === data[index]?.trade_id))
        ) {
          // Open trades changed, so we should refresh now.
          refreshRequired.value = true;
          refreshSlow(false);
        }
        if (Array.isArray(data)) {
          const mappedOpenTrades = data.map((t) => ({
            ...t,
            botId,
            botName,
            botTradeId: `${botId}__${t.trade_id}`,
          }));
          openTrades.value = mappedOpenTrades;
          if (selectedPair.value === '') {
            selectedPair.value = mappedOpenTrades[0]?.pair || '';
          }
        }
      } catch (data) {
        return console.error(data);
      }
    }

    // #region locks

    const currentLocks = shallowRef<LockResponse | undefined>(undefined);
    const activeLocks = computed(() => currentLocks.value?.locks || []);
    async function getLocks() {
      try {
        const result = await api<LockResponse>('/locks');
        return (currentLocks.value = result);
      } catch (data) {
        return console.error(data);
      }
    }

    async function deleteLock(lockid: string) {
      try {
        const res = await api<LockResponse>(`/locks/${lockid}`, { method: 'DELETE' });
        showAlert(`Deleted Lock ${lockid}.`);
        currentLocks.value = res;
        return Promise.resolve(res);
      } catch (error) {
        showAlert(`Failed to delete lock ${lockid}`, 'error');
        return Promise.reject(error);
      }
    }

    // #endregion locks

    // #region Candle history

    const candleData = shallowRef<PairHistoryLocal>({});
    const candleDataStatus = shallowRef(LoadingStatus.not_loaded);
    const history = ref<PairHistoryLocal>({});
    const historyStatus = shallowRef(LoadingStatus.not_loaded);

    async function getPairCandles(payload: PairCandlePayload) {
      if (payload.pair && payload.timeframe) {
        candleDataStatus.value = LoadingStatus.loading;
        try {
          let result: PairHistory | null = null;
          const settingsStore = useSettingsStore();
          if (botFeatures.value.reducedPairCalls && settingsStore.useReducedPairCalls) {
            // Modern approach, allowing filtering of columns
            const data = await api<PairHistory>('/pair_candles', {
              method: 'POST',
              body: payload,
            });
            result = data;
          } else {
            const data = await api<PairHistory>('/pair_candles', {
              query: { ...payload },
            });
            result = data;
          }
          if (result) {
            candleData.value = {
              ...candleData.value,
              [`${payload.pair}__${payload.timeframe}`]: {
                pair: payload.pair,
                timeframe: payload.timeframe,
                data: result,
              },
            };
          }
          candleDataStatus.value = LoadingStatus.success;
        } catch (err) {
          console.error(err);
          candleDataStatus.value = LoadingStatus.error;
        }
      } else {
        const error = 'pair or timeframe not specified';
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getPairHistory(payload: PairHistoryPayload) {
      if (payload.pair && payload.timeframe) {
        historyStatus.value = LoadingStatus.loading;
        historyTakesLonger.value = false;
        let loadingTimer: ReturnType<typeof setTimeout> | null = null;
        try {
          const settingsStore = useSettingsStore();
          let result: PairHistory | null = null;
          loadingTimer = setTimeout(() => (historyTakesLonger.value = true), 10000);
          const timeout = 2 * 60 * 1000;
          if (botFeatures.value.reducedPairCalls && settingsStore.useReducedPairCalls) {
            // Modern approach, allowing filtering of columns
            const data = await api<PairHistory>('/pair_history', {
              method: 'POST',
              body: payload,
              timeout,
            });
            result = data;
          } else {
            const data = await api<PairHistory>('/pair_history', {
              query: { ...payload },
              timeout,
            });
            result = data;
          }
          history.value[`${payload.pair}__${payload.timeframe}`] = {
            pair: payload.pair,
            timeframe: payload.timeframe,
            timerange: payload.timerange,
            data: result,
          };
          historyStatus.value = LoadingStatus.success;
          return;
        } catch (err) {
          console.error(err);
          historyStatus.value = LoadingStatus.error;
          if (isApiError(err)) {
            const isTimeout = isTimeoutError(err);
            const errMsg = isTimeout
              ? 'Timeout exceeded'
              : (err.data?.detail ?? 'Error fetching history');
            showAlert(errMsg, 'error');
          }
          return Promise.reject(err);
        } finally {
          if (loadingTimer) {
            clearTimeout(loadingTimer);
          }
          historyTakesLonger.value = false;
        }
      }
      const error = 'pair or timeframe or timerange not specified';
      console.error(error);
      return Promise.reject(error);
    }

    async function getStrategyPlotConfig(): Promise<PlotConfig | undefined> {
      try {
        const payload: Record<string, string> = {};
        if (isWebserverMode.value) {
          if (!strategy.value?.strategy) {
            return Promise.reject({ data: 'No strategy selected' });
          }
          payload['strategy'] = strategy.value.strategy;
        }

        const plotConfig = await api<Partial<PlotConfig>>('/plot_config', {
          query: { ...payload },
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
    }

    // #endregion Candle history

    async function getStrategyList() {
      try {
        const data = await api<StrategyListResult>('/strategies');
        strategyList.value = data.strategies;
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getStrategy(strategyName: string) {
      try {
        const data = await api<StrategyResult>(`/strategy/${strategyName}`, {});
        strategy.value = data;
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        if (isApiError(error)) {
          const errMsg = error.data?.detail ?? 'Error fetching history';
          showAlert(errMsg, 'warning');
        }
        return Promise.reject(error);
      }
    }

    async function getCurrentStrategy() {
      if (botFeatures.value.strategyParameters && isTrading.value && botState.value?.strategy) {
        return getStrategy(botState.value.strategy);
      }
    }

    async function getFreqAIModelList() {
      try {
        const data = await api<FreqAIModelListResult>('/freqaimodels');
        freqaiModelList.value = data.freqaimodels;
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getHyperoptLossList() {
      try {
        const data = await api<HyperoptLossListResponse>('/hyperopt-loss');
        hyperoptLossList.value = data.loss_functions;
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getExchangeList() {
      try {
        const data = await api<ExchangeListResult>('/exchanges');
        exchangeList.value = data.exchanges;
        return Promise.resolve(data.exchanges);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getAvailablePairs(payload: AvailablePairPayload) {
      try {
        const data = await api<AvailablePairResult>('/available_pairs', {
          query: { ...payload },
        });
        pairlist.value = data.pairs;
        pairlistWithTimeframe.value = data.pair_interval;
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getMarkets(payload: MarketsPayload) {
      try {
        const data = await api<Markets>('/markets', {
          query: { ...payload },
        });
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    // #region stats
    const performanceStats = ref<PerformanceEntry[]>([]);
    const entryStats = ref<EntryStats[]>([]);
    const exitStats = ref<ExitStats[]>([]);
    const mixTagStats = ref<MixTagStats[]>([]);

    async function getPerformance() {
      try {
        const data = await api<PerformanceEntry[]>('/performance');
        performanceStats.value = data;
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getEntryStats() {
      try {
        const data = await api<EntryStats[]>('/entries');
        entryStats.value = data;
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getExitStats() {
      try {
        const data = await api<ExitStats[]>('/exits');
        exitStats.value = data;
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getMixTagStats() {
      try {
        const data = await api<MixTagStats[]>('/mix_tags');
        mixTagStats.value = data;
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    const profitAll = ref<AllProfitStats | undefined>(undefined);
    const profit = computed<ProfitStats | undefined>(() => profitAll.value?.all);

    async function getProfit() {
      try {
        if (botFeatures.value.hasProfitAll) {
          const data = await api<AllProfitStats>('/profit_all');
          profitAll.value = data;
          return Promise.resolve(data);
        }
        const data = await api<ProfitStats>('/profit');
        if (!profitAll.value) {
          profitAll.value = {} as AllProfitStats;
        }
        profitAll.value.all = data;
        return Promise.resolve(data);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    // #endregion stats

    // #region pairlists
    const whitelist = ref<string[]>([]);
    const blacklist = ref<string[]>([]);
    async function getWhitelist() {
      try {
        const data = await api<WhitelistResponse>('/whitelist');
        whitelist.value = data.whitelist;
        pairlistMethods.value = data.method;
        return Promise.resolve(data);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    async function getBlacklist() {
      try {
        const data = await api<BlacklistResponse>('/blacklist');
        blacklist.value = data.blacklist;
        return Promise.resolve(data);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    const dailyStats = ref<TimeSummaryReturnValue>({} as TimeSummaryReturnValue);
    const weeklyStats = ref<TimeSummaryReturnValue>({} as TimeSummaryReturnValue);
    const monthlyStats = ref<TimeSummaryReturnValue>({} as TimeSummaryReturnValue);

    async function getTimeSummary(
      aggregation: TimeSummaryOptions,
      payload: TimeSummaryPayload = {},
    ) {
      const { timescale = 20 } = payload;
      try {
        const data = await api<TimeSummaryReturnValue>(`/${aggregation}`, {
          query: { timescale },
        });
        if (aggregation === TimeSummaryOptions.daily) {
          dailyStats.value = data;
        } else if (aggregation === TimeSummaryOptions.weekly) {
          weeklyStats.value = data;
        } else if (aggregation === TimeSummaryOptions.monthly) {
          monthlyStats.value = data;
        }

        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }
    // #endregion pairlists

    const balance = shallowRef<BalanceInterface>({} as BalanceInterface);
    async function getBalance() {
      try {
        const data = await api('/balance');
        balance.value = data;
        return Promise.resolve(data);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    const balanceHistory = shallowRef<WalletHistory | undefined>(undefined);
    async function updateWalletChange() {
      if (!botFeatures.value.walletChange) {
        return;
      }
      try {
        const data = await api<WalletHistory>('/historic_balance');
        if (data) {
          data.botName = storeBotName.value;
        }
        balanceHistory.value = data;
      } catch (err) {
        console.error(err);
      }
    }

    async function getState() {
      try {
        const data = await api<BotState>('/show_config');
        botState.value = data;
        botStatusAvailable.value = true;
        startWebSocket();
        if (isWebserverMode.value) {
          recoverBgJobs();
        }
        return Promise.resolve(data);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    const lastLogs = shallowRef<LogLine[]>([]);

    async function getLogs() {
      try {
        const data = await api('/logs');
        lastLogs.value = data.logs;
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getPairlists() {
      try {
        const data = await api<PairlistsResponse>('/pairlists/available');
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function evaluatePairlist(payload: PairlistsPayload) {
      try {
        const data = await api<BgTaskStarted>('/pairlists/evaluate', {
          method: 'POST',
          body: payload,
        });
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getPairlistEvalResult(jobId: string) {
      try {
        const data = await api<PairlistEvalResponse>(`/pairlists/evaluate/${jobId}`);
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    // #region background jobs
    const backgroundJobs = ref<Record<string, BackgroundTaskStatus>>({});
    // In-flight polls, keyed by jobId - ensures a single interval per job
    const bgJobPolls = new Map<string, Promise<BackgroundTaskStatus>>();

    async function getBackgroundJobStatus(jobId: string) {
      try {
        const data = await api<BackgroundTaskStatus>(`/background/${jobId}`);
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    /**
     * Poll a background job until it finishes, keeping `backgroundJobs` (and therefore
     * the tracking widget) up to date. Resolves with the final status so callers can
     * fetch the typed result. Deduplicated per jobId.
     */
    function pollBgJob(jobId: string, jobCategory: JobCategory): Promise<BackgroundTaskStatus> {
      const existing = bgJobPolls.get(jobId);
      if (existing) {
        return existing;
      }
      if (!backgroundJobs.value[jobId]) {
        backgroundJobs.value[jobId] = {
          job_id: jobId,
          job_category: jobCategory,
          status: 'pending',
          running: true,
        };
      }
      const promise = new Promise<BackgroundTaskStatus>((resolve, reject) => {
        const interval = window.setInterval(async () => {
          try {
            const status = await getBackgroundJobStatus(jobId);
            backgroundJobs.value[jobId] = status;
            if (!status.running) {
              window.clearInterval(interval);
              bgJobPolls.delete(jobId);
              resolve(status);
            }
          } catch (error) {
            window.clearInterval(interval);
            bgJobPolls.delete(jobId);
            showAlert('Failed to get background job status', 'error');
            reject(error);
          }
        }, 1000);
      });
      bgJobPolls.set(jobId, promise);
      return promise;
    }

    async function recoverBgJobs() {
      try {
        const data = await api<BackgroundTaskStatus[]>('/background');
        for (const job of data) {
          backgroundJobs.value[job.job_id] = job;
          if (job.running) {
            pollBgJob(job.job_id, job.job_category);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    async function clearBgJobs() {
      if (botFeatures.value.backgroundJobDelete) {
        try {
          // Server-side clear - returns the list of still-running jobs; cleared jobs are omitted.
          const data = await api<BackgroundTaskStatus[]>('/background/clear', { method: 'DELETE' });
          backgroundJobs.value = {};
          for (const job of data) {
            backgroundJobs.value[job.job_id] = job;
          }
          showAlert('All non-running background jobs cleared', 'success');
        } catch (error) {
          console.error(error);
          showAlert('Failed to clear background jobs', 'error');
        }
        return;
      }
      // Local fallback - drop all jobs that are no longer running.
      for (const [jobId, job] of Object.entries(backgroundJobs.value)) {
        if (!job.running) {
          delete backgroundJobs.value[jobId];
        }
      }
    }
    // #endregion background jobs

    async function startDataDownload(payload: DownloadDataPayload) {
      try {
        const data = await api<BgTaskStarted>('/download_data', { method: 'POST', body: payload });
        pollBgJob(data.job_id, 'download_data');
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function startRecursiveAnalysis(payload: RecursiveAnalysisPayload) {
      try {
        const data = await api<BgTaskStarted>('/recursive_analysis', {
          method: 'POST',
          body: payload,
        });
        pollBgJob(data.job_id, 'recursive_analysis');
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getRecursiveAnalysisResult(jobId: string) {
      try {
        const data = await api<RecursiveAnalysis>(`/recursive_analysis/${jobId}`);
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function startLookaheadAnalysis(payload: LookaheadAnalysisPayload) {
      try {
        const data = await api<BgTaskStarted>('/lookahead_analysis', {
          method: 'POST',
          body: payload,
        });
        pollBgJob(data.job_id, 'lookahead_analysis');
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function getLookaheadAnalysisResult(jobId: string) {
      try {
        const data = await api<LookaheadAnalysis>(`/lookahead_analysis/${jobId}`);
        return Promise.resolve(data);
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    }

    async function startBot() {
      try {
        const data = await api<StatusResponse>('/start', { method: 'POST', body: {} });
        console.log(data);
        showAlert(data.status);
        return Promise.resolve(data);
      } catch (error) {
        showAlert('Error starting bot.', 'error');
        return Promise.reject(error);
      }
    }

    async function stopBot() {
      try {
        const res = await api<StatusResponse>('/stop', { method: 'POST', body: {} });
        showAlert(res.status);
        return Promise.resolve(res);
      } catch (error) {
        showAlert('Error stopping bot.', 'error');
        return Promise.reject(error);
      }
    }

    async function stopBuy() {
      try {
        const res = await api<StatusResponse>('/stopbuy', { method: 'POST', body: {} });
        showAlert(res.status);
        return Promise.resolve(res);
      } catch (error) {
        showAlert('Error calling stopbuy.', 'error');
        return Promise.reject(error);
      }
    }

    async function reloadConfig() {
      try {
        const res = await api<StatusResponse>('/reload_config', { method: 'POST', body: {} });
        console.log(res);
        showAlert(res.status);
        return Promise.resolve(res);
      } catch (error) {
        showAlert('Error reloading.', 'error');
        return Promise.reject(error);
      }
    }

    async function deleteTrade(tradeid: string) {
      try {
        const res = await api<DeleteTradeResponse>(`/trades/${tradeid}`, { method: 'DELETE' });
        showAlert(res.result_msg ? res.result_msg : `Deleted Trade ${tradeid}`);
        return Promise.resolve(res);
      } catch (error) {
        showAlert(`Failed to delete trade ${tradeid}`, 'error');
        return Promise.reject(error);
      }
    }

    async function cancelOpenOrder(tradeid: string) {
      try {
        const res = await api<DeleteTradeResponse>(`/trades/${tradeid}/open-order`, {
          method: 'DELETE',
        });
        showAlert(res.result_msg ? res.result_msg : `Canceled open order for ${tradeid}`);
        return Promise.resolve(res);
      } catch (error) {
        showAlert(`Failed to cancel open order ${tradeid}`, 'error');
        return Promise.reject(error);
      }
    }

    async function reloadTrade(tradeid: string) {
      try {
        const res = await api<Trade>(`/trades/${tradeid}/reload`, { method: 'POST' });
        return Promise.resolve(res);
      } catch (error) {
        showAlert(`Failed to reload trade ${tradeid}`, 'error');
        return Promise.reject(error);
      }
    }

    async function getCustomDataForTrade(tradeid: Trade['trade_id']) {
      try {
        const res = await api<TradeCustomData[]>(`/trades/${tradeid}/custom-data`);
        return Promise.resolve(res);
      } catch (error) {
        showAlert(`Failed to get custom data for trade ${tradeid}`, 'error');
        return Promise.reject(error);
      }
    }

    async function startTrade() {
      try {
        const res = await api('/start_trade', { method: 'POST', body: {} });
        return Promise.resolve(res);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    async function forceexit(payload: ForceExitPayload) {
      try {
        const res = await api<StatusResponse>('/forcesell', { method: 'POST', body: payload });
        showAlert(`Exit order for ${payload.tradeid} created`, 'success');
        return Promise.resolve(res);
      } catch (error) {
        showAlert(`Failed to create exit order for ${payload.tradeid}`, 'error');
        return Promise.reject(error);
      }
    }

    async function forceentry(payload: ForceEnterPayload) {
      if (payload && payload.pair) {
        try {
          // TODO: Update forcebuy to forceenter ...
          const res = await api<StatusResponse | TradeResponse>('/forcebuy', {
            method: 'POST',
            body: payload,
          });
          showAlert(`Order for ${payload.pair} created.`, 'success');
          return Promise.resolve(res);
        } catch (error) {
          if (isApiError(error)) {
            showAlert(`Error occured entering: '${error.data?.error}'`, 'error');
          }
          return Promise.reject(error);
        }
      }
      const error = 'Pair is empty';
      console.error(error);
      return Promise.reject(error);
    }

    async function addBlacklist(payload: BlacklistPayload) {
      console.log(`Adding ${payload} to blacklist`);
      if (payload && payload.blacklist) {
        try {
          const result = await api<BlacklistResponse>('/blacklist', {
            method: 'POST',
            body: payload,
          });
          blacklist.value = result.blacklist;
          if (result.errors && Object.keys(result.errors).length !== 0) {
            const { errors } = result;
            Object.keys(errors).forEach((pair) => {
              showAlert(
                `Error while adding pair ${pair} to Blacklist: ${errors[pair]?.error_msg}`,
                'error',
              );
            });
          } else {
            showAlert(`Pair ${payload.blacklist} added.`);
          }
          return Promise.resolve(result);
        } catch (error) {
          if (isApiError(error)) {
            showAlert(
              `Error occured while adding pairs to Blacklist: '${error.data?.error}'`,
              'error',
            );
          }
          return Promise.reject(error);
        }
      }
      const error = 'Pair is empty';
      console.error(error);
      return Promise.reject(error);
    }

    async function deleteBlacklist(blacklistPairs: Array<string>) {
      console.log(`Deleting ${blacklistPairs} from blacklist.`);

      if (blacklistPairs) {
        try {
          // Array query values are serialized as repeated keys (pairs_to_delete=A&pairs_to_delete=B)
          const result = await api<BlacklistResponse>('/blacklist', {
            method: 'DELETE',
            query: { pairs_to_delete: blacklistPairs },
          });
          blacklist.value = result.blacklist;
          if (result.errors && Object.keys(result.errors).length !== 0) {
            const { errors } = result;
            Object.keys(errors).forEach((pair) => {
              showAlert(
                `Error while removing pair ${pair} from Blacklist: ${errors[pair]?.error_msg}`,
                'error',
              );
            });
          } else {
            showAlert(`Pair ${blacklistPairs} removed.`);
          }
          return Promise.resolve(result);
        } catch (error) {
          if (isApiError(error)) {
            showAlert(
              `Error occured while removing pairs from Blacklist: '${error.data?.error}'`,
              'error',
            );
          }
          return Promise.reject(error);
        }
      }
      const error = 'Pair is empty';
      console.error(error);
      return Promise.reject(error);
    }

    const sysInfo = ref<SysInfoResponse>({} as SysInfoResponse);
    async function getSysInfo() {
      try {
        const data = await api<SysInfoResponse>('/sysinfo');
        sysInfo.value = data;
        return Promise.resolve(data);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // #region backtesting
    const backtestRunning = ref(false);
    const backtestProgress = ref(0.0);
    const backtestStep = ref(BacktestSteps.none);
    const backtestTradeCount = ref(0);
    const selectedBacktestResultKey = ref('');
    const backtestHistory = ref<Record<string, BacktestResultInMemory>>({});
    const backtestHistoryList = ref<BacktestHistoryEntry[]>([]);
    const canRunBacktest = computed(() => botState.value?.runmode === RunModes.WEBSERVER);

    const selectedBacktestResult = computed(
      () => backtestHistory.value[selectedBacktestResultKey.value]?.strategy,
    );
    const selectedBacktestMetadata = computed(
      () => backtestHistory.value[selectedBacktestResultKey.value]?.metadata,
    );

    async function startBacktest(payload: BacktestPayload) {
      try {
        const result = await api<BacktestStatus>('/backtest', { method: 'POST', body: payload });
        updateBacktestRunning(result);
      } catch (err) {
        console.log(err);
      }
    }

    async function pollBacktest() {
      const data = await api<BacktestStatus>('/backtest');

      updateBacktestRunning(data);
      if (data.running === false && data.backtest_result) {
        updateBacktestResult(data.backtest_result);
      }
      if (data.status === 'error') {
        showAlert(`Backtest failed: ${data.status_msg}.`, 'error');
      }
    }

    async function removeBacktest() {
      backtestHistory.value = {};
      try {
        const data = await api<BacktestStatus>('/backtest', { method: 'DELETE' });
        updateBacktestRunning(data);
        return Promise.resolve(data);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    function updateBacktestRunning(backtestStatus: BacktestStatus) {
      backtestRunning.value = backtestStatus.running;
      backtestProgress.value = backtestStatus.progress;
      backtestStep.value = backtestStatus.step;
      backtestTradeCount.value = backtestStatus.trade_count || 0;
    }

    async function stopBacktest() {
      try {
        const data = await api<BacktestStatus>('/backtest/abort');
        updateBacktestRunning(data);
        return Promise.resolve(data);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    async function getBacktestHistory() {
      const data = await api<BacktestHistoryEntry[]>('/backtest/history');
      backtestHistoryList.value = data;
    }

    function updateBacktestResult(backtestResult: BacktestResult) {
      Object.entries(backtestResult.strategy).forEach(([key, strat]) => {
        const existingMetadata = backtestResult.metadata[key];
        if (!existingMetadata) {
          console.warn(`No metadata found for strategy ${key}`);
          return;
        }
        const metadata: BacktestMetadataWithStrategyName = {
          ...existingMetadata,
          strategyName: key,
          notes: backtestResult.metadata[key]?.notes ?? '',
          editing: false,
        };

        const stratKey =
          existingMetadata.run_id ??
          `${key}_${strat.total_trades}_${strat.profit_total.toFixed(3)}`;
        const btResult: BacktestResultInMemory = {
          metadata,
          strategy: strat,
        };
        backtestHistory.value = { ...backtestHistory.value, ...{ [stratKey]: btResult } };
        selectedBacktestResultKey.value = stratKey;
      });
    }

    async function getBacktestHistoryResult(payload: BacktestHistoryEntry) {
      const result = await api<BacktestStatus>('/backtest/history/result', {
        query: { filename: payload.filename, strategy: payload.strategy },
      });
      if (result.backtest_result) {
        updateBacktestResult(result.backtest_result);
      }
    }

    async function deleteBacktestHistoryResult(btHistoryEntry: BacktestHistoryEntry) {
      try {
        const data = await api<BacktestHistoryEntry[]>(
          `/backtest/history/${btHistoryEntry.filename}`,
          { method: 'DELETE' },
        );
        backtestHistoryList.value = data;
      } catch (err) {
        console.error(err);
        return Promise.reject(err);
      }
    }

    async function getBacktestMarketChange() {
      if (!selectedBacktestMetadata.value?.filename) {
        return Promise.reject('No backtest selected');
      }
      try {
        const data = await api<BacktestMarketChange>(
          `/backtest/history/${selectedBacktestMetadata.value.filename}/market_change`,
        );
        return data;
      } catch (err) {
        console.error(err);
        return Promise.reject(err);
      }
    }

    async function getBacktestWalletChange(): Promise<WalletHistoryPerBot> {
      if (!botFeatures.value.walletChange) {
        return Promise.reject('Backtest wallet change not available');
      }
      if (!selectedBacktestMetadata.value?.filename) {
        return Promise.reject('No backtest selected');
      }
      try {
        const data = await api<WalletHistory>(
          `/backtest/history/${selectedBacktestMetadata.value.filename}/${selectedBacktestMetadata.value.strategyName}/wallet`,
        );
        data.botName = `${selectedBacktestMetadata.value.strategyName} (Backtest)`;
        return {
          [data.botName]: data,
        };
      } catch (err) {
        console.error(err);
        return Promise.reject(err);
      }
    }

    async function saveBacktestResultMetadata(payload: BacktestResultUpdate) {
      try {
        const data = await api<BacktestHistoryEntry[]>(`/backtest/history/${payload.filename}`, {
          method: 'PATCH',
          body: payload,
        });
        console.log(data);
        data.forEach((entry) => {
          const existingEntry = backtestHistory.value[entry.run_id];
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
    }

    function setBacktestResultKey(key: string) {
      selectedBacktestResultKey.value = key;
    }

    function removeBacktestResultFromMemory(key: string) {
      if (selectedBacktestResultKey.value === key) {
        // Get first key from backtestHistory that is not the key to be deleted
        const keys = Object.keys(backtestHistory.value);
        const index = keys.findIndex((k) => k !== key);
        if (index !== -1) {
          selectedBacktestResultKey.value = keys[index]!;
        }
      }
      delete backtestHistory.value[key];
    }

    // #endregion backtesting

    // #region Websocket handling

    const websocketStarted = ref(false);
    /** Handle to the active websocket connection - used to prevent duplicate connections. */
    let websocketHandle: { close: () => void } | undefined = undefined;

    function closeWebSocket() {
      websocketHandle?.close();
      websocketHandle = undefined;
      websocketStarted.value = false;
    }

    function _handleWebsocketMessage(ws: WebSocket, event: MessageEvent<string>) {
      const msg: FTWsMessage = JSON.parse(event.data);
      switch (msg.type) {
        case FtWsMessageTypes.exception:
          showAlert(`WSException: ${msg.data}`, 'error');
          break;
        case FtWsMessageTypes.whitelist:
          whitelist.value = msg.data;
          break;
        case FtWsMessageTypes.entryFill:
        case FtWsMessageTypes.exitFill:
        case FtWsMessageTypes.exitCancel:
        case FtWsMessageTypes.entryCancel:
          showNotification(msg, botName);
          break;
        case FtWsMessageTypes.newCandle: {
          const [pair, timeframeValue] = msg.data;
          // TODO: check for active bot ...
          if (plotMultiPairs.value.length > 0 && plotMultiPairs.value.includes(pair)) {
            // Reload pair candles
            const plotStore = usePlotConfigStore();
            getPairCandles({ pair, timeframe: timeframeValue, columns: plotStore.usedColumns });
          }
          break;
        }
        default:
          // Unhandled events ...
          console.log(`Received event ${(msg as { type: unknown }).type}`);
          break;
      }
    }

    function startWebSocket() {
      if (
        websocketHandle !== undefined ||
        botStatusAvailable.value === false ||
        !botFeatures.value.websocketConnection ||
        isWebserverMode.value === true
      ) {
        return;
      }
      const wsHandle = useWebSocket(
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
            closeWebSocket();
          },
          onMessage: _handleWebsocketMessage,
          onConnected: () => {
            console.log('subscribing');
            if (isWebserverMode.value !== true) {
              websocketStarted.value = true;
              const subscriptions = [
                FtWsMessageTypes.whitelist,
                FtWsMessageTypes.entryFill,
                FtWsMessageTypes.exitFill,
                FtWsMessageTypes.entryCancel,
                FtWsMessageTypes.exitCancel,
                /*'new_candle' /*'analyzed_df'*/
              ];
              if (botFeatures.value.websocketNewCandle) {
                subscriptions.push(FtWsMessageTypes.newCandle);
              }

              wsHandle.send(
                JSON.stringify({
                  type: 'subscribe',
                  data: subscriptions,
                }),
              );
              wsHandle.send(
                JSON.stringify({
                  type: FtWsMessageTypes.whitelist,
                  data: '',
                }),
              );
            }
          },
        },
      );
      websocketHandle = wsHandle;
    }
    // #endregion websocket handling

    return {
      websocketStarted,
      isSelected,
      ping,
      botStatusAvailable,
      isBotOnline,
      isBotLoggedIn,
      autoRefresh,
      refreshing,
      versionState,
      lastLogs,
      refreshRequired,
      trades,
      openTrades,
      tradeCount,
      performanceStats,
      entryStats,
      exitStats,
      mixTagStats,
      whitelist,
      blacklist,
      profitAll,
      botState,
      balance,
      dailyStats,
      weeklyStats,
      monthlyStats,
      balanceHistory,
      pairlistMethods,
      detailTradeId,
      selectedPair,
      plotMultiPairs,
      candleData,
      candleDataStatus,
      history,
      historyStatus,
      historyTakesLonger,
      strategyList,
      freqaiModelList,
      hyperoptLossList,
      exchangeList,
      strategy,
      pairlist,
      pairlistWithTimeframe,
      currentLocks,
      backtestRunning,
      backtestProgress,
      backtestStep,
      backtestTradeCount,
      selectedBacktestResultKey,
      backtestHistory,
      backtestHistoryList,
      sysInfo,
      backgroundJobs,
      version,
      botApiVersion,
      botFeatures,
      stakeCurrency,
      stakeCurrencyDecimals,
      canRunBacktest,
      isWebserverMode,
      selectedBacktestResult,
      selectedBacktestMetadata,
      shortAllowed,
      openTradeCount,
      isTrading,
      timeframe,
      closedTrades,
      tradeDetail,
      refreshNow,
      uiBotName,
      botName: storeBotName,
      botId: storeBotId,
      allTrades,
      activeLocks,
      profit,
      botAdded,
      fetchPing,
      logout,
      getLoginInfo,
      updateBot,
      setAutoRefresh,
      setIsBotOnline,
      refreshSlow,
      refreshFrequent,
      setDetailTrade,
      getTrades,
      getOpenTrades,
      getLocks,
      deleteLock,
      getPairCandles,
      getPairHistory,
      getStrategyPlotConfig,
      getStrategyList,
      getStrategy,
      getCurrentStrategy,
      getFreqAIModelList,
      getHyperoptLossList,
      getExchangeList,
      getAvailablePairs,
      getMarkets,
      getPerformance,
      getEntryStats,
      getExitStats,
      getMixTagStats,
      getWhitelist,
      getBlacklist,
      getProfit,
      getBalance,
      getTimeSummary,
      updateWalletChange,
      getState,
      getLogs,
      getPairlists,
      evaluatePairlist,
      getPairlistEvalResult,
      getBackgroundJobStatus,
      pollBgJob,
      recoverBgJobs,
      clearBgJobs,
      startDataDownload,
      startRecursiveAnalysis,
      getRecursiveAnalysisResult,
      startLookaheadAnalysis,
      getLookaheadAnalysisResult,
      startBot,
      stopBot,
      stopBuy,
      reloadConfig,
      deleteTrade,
      cancelOpenOrder,
      reloadTrade,
      getCustomDataForTrade,
      startTrade,
      forceexit,
      forceentry,
      addBlacklist,
      deleteBlacklist,
      startBacktest,
      pollBacktest,
      removeBacktest,
      updateBacktestRunning,
      stopBacktest,
      getBacktestHistory,
      updateBacktestResult,
      getBacktestHistoryResult,
      deleteBacktestHistoryResult,
      getBacktestMarketChange,
      getBacktestWalletChange,
      saveBacktestResultMetadata,
      setBacktestResultKey,
      removeBacktestResultFromMemory,
      getSysInfo,
      startWebSocket,
    };
  });

  if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useBotStore, import.meta.hot));
  }

  return useBotStore();
}
