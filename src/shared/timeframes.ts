/**
 * Available timeframe options for candle charts and selectors.
 * This list must always remain sorted from smallest to largest timeframe.
 */
export const AVAILABLE_TIMEFRAMES = [
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
  '2h',
  '4h',
  '6h',
  '8h',
  '12h',
  '1d',
  '3d',
  '1w',
  '2w',
  '1M',
  '1y',
] as const;

/** Type for valid timeframe values */
export type Timeframe = (typeof AVAILABLE_TIMEFRAMES)[number];

/**
 * Base timeframe options including placeholder for strategy default.
 * Used by TimeframeSelect component.
 */
export const TIMEFRAME_OPTIONS_BASE = [
  // Placeholder value
  { value: '', text: 'Use strategy default' },
  ...AVAILABLE_TIMEFRAMES,
];
