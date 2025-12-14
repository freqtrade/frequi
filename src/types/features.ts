import type { BotState } from '@/types';

export interface FeatureConfig {
  minVersion?: number;
  maxVersion?: number;
  condition?: (botState: BotState, apiVersion: number) => boolean;
  description?: string;
}
export type FeatureKey =
  | 'forceExitParams'
  | 'botBlacklistModify'
  | 'futures'
  | 'forceEnterShort'
  | 'advancedDailyMetrics'
  | 'forceEntryTag'
  | 'cancelOpenOrders'
  | 'reloadTrade'
  | 'plotConfigFromServer'
  | 'weeklyMonthlyStats'
  | 'websocketConnection'
  | 'websocketNewCandle'
  | 'reducedPairCalls'
  | 'hasBotBalance'
  | 'hasAdvancedStats'
  | 'chartLiveData'
  | 'hasProfitAll'
  | 'backtestHistory'
  | 'backtestFreqAI'
  | 'backtestDelete'
  | 'backtestSetNotes'
  | 'downloadDataView'
  | 'pairlistConfig'
  | 'downloadDataCandleTypes'
  | 'forceExitWithPrice';

export type BotFeatures = Record<FeatureKey, boolean>;

export const FEATURES: Record<FeatureKey, FeatureConfig> = {
  // Core features
  forceExitParams: { minVersion: 1.2, description: 'Force exit with parameters' },
  botBlacklistModify: { minVersion: 1.12, description: 'Modify bot pairlist' },
  futures: { minVersion: 2.0, description: 'Futures' }, // TODO: Could be consolidated
  forceEnterShort: { minVersion: 2.13, description: 'Force enter short position' },
  advancedDailyMetrics: { minVersion: 2.16, description: 'Advanced daily metrics' },
  forceEntryTag: {
    minVersion: 2.17,
    description: 'Force enter - set entry tag, Force Exit partial',
  },
  cancelOpenOrders: { minVersion: 2.24, description: 'Cancel open orders' },
  reloadTrade: { minVersion: 2.28, description: 'Reload trade' },
  plotConfigFromServer: { minVersion: 2.23, description: 'Load plot configuration from backend' },
  weeklyMonthlyStats: { minVersion: 2.33, description: 'Weekly/monthly stats' },
  websocketConnection: { minVersion: 2.2, description: 'WebSocket connection support' },
  websocketNewCandle: { minVersion: 2.21, description: 'WebSocket new candle datatype' },

  reducedPairCalls: { minVersion: 2.35, description: 'Modern pair candles API' },
  hasBotBalance: { minVersion: 2.26, description: 'Provides bot balance' },
  hasAdvancedStats: { minVersion: 2.34, description: 'new entries/exits/mix_tags endpoints' },
  chartLiveData: { minVersion: 2.42, description: 'Live chart data support in webserver mode' },
  hasProfitAll: { minVersion: 2.43, description: 'Profit all endpoint' },
  // Backtesting
  backtestHistory: { minVersion: 2.15, description: 'Can Run Backtests' },
  backtestFreqAI: { minVersion: 2.22, description: 'FreqAI support for backtesting' },
  backtestDelete: { minVersion: 2.31, description: 'Delete backtest endpoints' },
  backtestSetNotes: { minVersion: 2.32, description: 'Set notes for backtest results' },
  // Overall Webserver features
  downloadDataView: { minVersion: 2.41, description: 'Download data View' },
  pairlistConfig: { minVersion: 2.3, description: 'Configure pairlist for bot' },
  downloadDataCandleTypes: {
    minVersion: 2.44,
    description: 'Candle type selection for data download',
  },
  forceExitWithPrice: { minVersion: 2.45, description: 'Force exit accepting price parameter' },
};
