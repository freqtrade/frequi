import { getAllPlotConfigNames, getPlotConfigName } from '@/shared/storage';
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
} from '@/types';
import { defineStore } from 'pinia';

export const useBotStore = defineStore('ftbot', {
  state: () => {
    return {
      ping: '',
      botStatusAvailable: false,
      isBotOnline: false,
      autoRefresh: false,
      refreshing: false,
      version: '',
      lastLogs: [] as LogLine[],
      refreshRequired: true,
      trades: [] as Trade[],
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
      detailTradeId: undefined as number | undefined,
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
      sysinfo: {} as SysInfoResponse,
    };
  },
  getters: {
    version: (state) => state.botState?.version || state.version,
    botApiVersion: (state) => state.botState?.api_version || 1.0,
    stakeCurrency: (state) => state.botState?.stake_currency || '',
    stakeCurrencyDecimals: (state) => state.botState?.stake_currency_decimals || 3,
    canRunBacktest: (state) => state.botState?.runmode === RunModes.WEBSERVER,
    isWebserverMode: (state) => state.botState?.runmode === RunModes.WEBSERVER,
    selectedBacktestResult: (state) => state.backtestHistory[state.selectedBacktestResultKey],
    shortAllowed: (state) => state.botState?.short_allowed || false,
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
      return dTrade;
    },
    plotConfig: (state) => state.customPlotConfig[state.plotConfigName] || { ...EMPTY_PLOTCONFIG },
    refreshNow: (state) => {
      // TODO: This might need to be done differently

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
  },
  actions: {},
});
