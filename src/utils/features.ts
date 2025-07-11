import type { BotState } from '@/types';
import { FEATURES, type FeatureKey, type BotFeatures, type FeatureConfig } from '@/types/features';

export function evaluateFeatures(botState: BotState, apiVersion: number): BotFeatures {
  const features = {} as BotFeatures;

  for (const [key, config] of Object.entries(FEATURES) as [FeatureKey, FeatureConfig][]) {
    let isEnabled = true;

    // Check minimum version requirement
    if (config.minVersion && apiVersion < config.minVersion) {
      isEnabled = false;
    }

    // Check maximum version requirement
    if (config.maxVersion && apiVersion > config.maxVersion) {
      isEnabled = false;
    }

    // Check custom condition
    if (config.condition && !config.condition(botState, apiVersion)) {
      isEnabled = false;
    }

    features[key] = isEnabled;
  }

  return features;
}

// Helper for checking individual features
export function hasFeature(features: BotFeatures, feature: FeatureKey): boolean {
  return features[feature] === true;
}
