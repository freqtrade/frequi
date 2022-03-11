import { parse, toDate, getHours } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';
import humanizeDuration from 'humanize-duration';

export function isUndefined(val): boolean {
  return val === undefined || val === null;
}

export function formatPercent(value: number, decimals = 3): string {
  return !isUndefined(value) ? `${(value * 100).toFixed(decimals)}%` : '';
}

/**
 * Format number to `decimals` without trailing zeros
 * @param value Number to format
 * @param decimals number of decimals (Defaults to 8)
 * @returns Formatted string
 */
export function formatPrice(value: number, decimals = 8): string {
  return !isUndefined(value) ? parseFloat(value.toFixed(decimals)).toString() : '';
}

/**
 * Formats price in the format "<price> <StakeCurrency>" using "deciaml" decimals
 * @param price Price to format
 * @param currency currency to use
 * @param decimals Decimals
 * @returns
 */
export function formatPriceCurrency(price, currency: string, decimals = 3) {
  return `${formatPrice(price, decimals)} ${currency}`;
}

export function dateFromString(datestring: string, format: string): Date {
  return parse(datestring, format, 0);
}

let locTimeZone = 'UTC';

/**
 * Set global timezone to use by conversion functions
 * @param tz Timezone to set
 */
export function setTimezone(tz: string) {
  locTimeZone = tz;
}

function getTimeZone(tz?: string): string {
  return tz || locTimeZone;
}

/**
 *
 * @param ts Convert timestamp or Date to datetime (in correct timezone)
 * @param timezone timezone to use
 * @returns Date object (in timezone)
 */
function convertToDate(ts: number | Date, timezone?: string): Date {
  const date = toDate(ts);
  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (getTimeZone(timezone) === 'UTC') {
    return utcToZonedTime(date, currentTz);
  }
  return date;
}

/**
 * Convert a timestamp / Date object to String
 * @param ts Timestamp as number or date (in utc!!)
 */
export function timestampms(ts: number | Date): string {
  return format(convertToDate(ts), 'yyyy-MM-dd HH:mm:ss', { timeZone: locTimeZone });
}

/**
 * Convert a timestamp / Date object to String
 * @param ts Timestamp as number or date (in utc!!)
 * @param timezone timezone to use
 * @returns formatted date in desired timezone (or globally configured timezone)
 */
export function timestampmsWithTimezone(ts: number | Date, timezone?: string): string {
  return format(convertToDate(ts, timezone), 'yyyy-MM-dd HH:mm:ss (z)', {
    timeZone: getTimeZone(timezone),
  });
}

/**
 * Converts timestamp or Date object to yyyy-MM-dd format.
 * @param ts
 */
export function timestampToDateString(ts: number | Date): string {
  return format(convertToDate(ts), 'yyyy-MM-dd');
}

/**
 * Converts a String of the format yyyy-MM-dd to YYYYMMDD. To be used as timerange.
 * @param datestring Input string (in the format yyyy-MM-dd)
 */
export function dateStringToTimeRange(datestring: string): string {
  return datestring.replace(/-/g, '');
}

export function timestampHour(ts: number): number {
  return getHours(convertToDate(ts));
}

/**
 *  Get humanized Duration from seconds
 * @param duration Duration in seconds
 */
export function humanizeDurationFromSeconds(duration: number): string {
  return humanizeDuration(duration * 1000);
}

export function heikinAshiDataset(columns: string[], data: Array<number[]>) {
  const openIdx = columns.indexOf('open');
  const closeIdx = columns.indexOf('close');
  const highIdx = columns.indexOf('high');
  const lowIdx = columns.indexOf('low');

  // Prevent mutation of original data
  const dataCopy = data.map((original) => original.slice());

  return dataCopy.map((candle, idx, candles) => {
    if (idx === 0) {
      const close = (candle[openIdx] + candle[highIdx] + candle[lowIdx] + candle[closeIdx]) / 4;
      const open = (candle[openIdx] + candle[closeIdx]) / 2;

      candle[openIdx] = open;
      candle[closeIdx] = close;

      return candle;
    }

    const prevCandle = candles[idx - 1];
    const close = (candle[openIdx] + candle[highIdx] + candle[lowIdx] + candle[closeIdx]) / 4;
    const open = (prevCandle[openIdx] + prevCandle[closeIdx]) / 2;
    const high = Math.max(candle[highIdx], candle[openIdx], candle[closeIdx]);
    const low = Math.min(candle[lowIdx], candle[openIdx], candle[closeIdx]);

    candle[openIdx] = open;
    candle[closeIdx] = close;
    candle[highIdx] = high;
    candle[lowIdx] = low;

    return candle;
  });
}

export default {
  formatPrice,
  formatPercent,
  timestampms,
  timestampmsWithTimezone,
  timestampToDateString,
  dateStringToTimeRange,
  setTimezone,
  heikinAshiDataset,
};
