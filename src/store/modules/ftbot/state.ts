import { getPlotConfigName, getAllPlotConfigNames } from '@/shared/storage';

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
} from '@/types';

export interface FtbotStateType {
  version: string;
  lastLogs: LogLine[];
  refreshRequired: boolean;
  trades: Trade[];
  openTrades: Trade[];
  tradeCount: number;
  performanceStats: Performance[];
  whitelist: string[];
  blacklist: string[];
  profit: ProfitInterface | {};
  botState?: BotState;
  balance: BalanceInterface | {};
  dailyStats: DailyReturnValue | {};
  pairlistMethods: string[];
  detailTradeId?: number;
  selectedPair: string;
  // TODO: type me
  candleData: {};
  // TODO: type me
  history: {};
  strategyPlotConfig?: PlotConfig;
  customPlotConfig: PlotConfigStorage;
  plotConfigName: string;
  availablePlotConfigNames: string[];
  strategyList: string[];
  strategy: StrategyResult | {};
  pairlist: string[];
  currentLocks?: LockResponse;
  backtestRunning: boolean;
  backtestProgress: number;
  backtestStep: BacktestSteps;
  backtestTradeCount: number;
  backtestResult?: BacktestResult;
  selectedBacktestResultKey: string;
  backtestHistory: Record<string, StrategyBacktestResult>;
}

const state = (): FtbotStateType => {
  return {
    version: '',
    lastLogs: [],
    refreshRequired: true,
    trades: [],
    openTrades: [],
    tradeCount: 0,
    performanceStats: [],
    whitelist: [],
    blacklist: [],
    profit: {},
    botState: undefined,
    balance: {},
    dailyStats: {},
    pairlistMethods: [],
    detailTradeId: undefined,
    selectedPair: '',
    candleData: {},
    history: {},
    strategyPlotConfig: undefined,
    customPlotConfig: {},
    plotConfigName: getPlotConfigName(),
    availablePlotConfigNames: getAllPlotConfigNames(),
    strategyList: [],
    strategy: {},
    pairlist: [],
    currentLocks: undefined,
    // backtesting
    backtestRunning: false,
    backtestProgress: 0.0,
    backtestStep: BacktestSteps.none,
    backtestTradeCount: 0,
    backtestResult: undefined,
    selectedBacktestResultKey: '',
    backtestHistory: {},
  };
};
export default state;
