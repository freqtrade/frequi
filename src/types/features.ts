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
  // Backtesting
  backtestFreqAI: { minVersion: 2.22, description: 'FreqAI support for backtesting' },
  backtestDelete: { minVersion: 2.31, description: 'Delete backtest endpoints' },
  backtestSetNotes: { minVersion: 2.32, description: 'Set notes for backtest results' },
} as const;

export type FeatureKey = keyof typeof FEATURES;
export type BotFeatures = Record<FeatureKey, boolean>;
