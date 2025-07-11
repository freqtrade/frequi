import type { BotState } from '@/types';

export interface FeatureConfig {
  minVersion?: number;
  maxVersion?: number;
  condition?: (botState: BotState, apiVersion: number) => boolean;
  description?: string;
}

export const FEATURES: Record<string, FeatureConfig> = {
  // Core features
  reducedPairCalls: { minVersion: 2.35, description: 'Modern pair candles API' },
  hasBotBalance: { minVersion: 2.26, description: 'Provides bot balance' },
  hasAdvancedStats: { minVersion: 2.34, description: 'new entries/exits/mix_tags endpoints' },
  chartLiveData: { minVersion: 2.42, description: 'Live chart data support in webserver mode' },
  // Backtesting
  backtestHistory: { minVersion: 2.15, description: 'Can Run Backtests' },
  backtestFreqAI: { minVersion: 2.22, description: 'FreqAI support for backtesting' },
  backtestDelete: { minVersion: 2.31, description: 'Delete backtest endpoints' },
  backtestSetNotes: { minVersion: 2.32, description: 'Set notes for backtest results' },
} as const;

export type FeatureKey = keyof typeof FEATURES;
export type BotFeatures = Record<FeatureKey, boolean>;
