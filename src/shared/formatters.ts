import * as moment from 'moment';
import humanizeDuration from 'humanize-duration';

export function formatPercent(value: number, decimals = 3): string {
  return value ? `${(value * 100).toFixed(decimals)}%` : '';
}

export function formatPrice(value: number, decimals = 8): string {
  return value ? value.toFixed(decimals) : '';
}

export function dateFromString(datestring: string, format: string): Date {
  return moment(datestring, format).toDate();
}

/**
 *
 * @param ts Timestamp as number or date (in utc!!)
 */
export function timestampms(ts: number | Date): string {
  return moment.utc(ts).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Converts timestamp or Date object to YYYY-MM-DD format.
 * @param ts
 */
export function timestampToDateString(ts: number | Date): string {
  return moment(ts).format('YYYY-MM-DD');
}

/**
 * Converts a String of the format YYYY-MM-DD to YYYYMMDD. To be used as timerange.
 * @param datestring Input string (in the format YYYY-MM-DD)
 */
export function dateStringToTimeRange(datestring: string): string {
  return datestring.replace(/-/g, '');
}

export function timestampHour(ts: number | Date): number {
  return moment.utc(ts).hour();
}

/**
 *  Get humanized Duration from seconds
 * @param duration Duration in seconds
 */
export function humanizeDurationFromSeconds(duration: number): string {
  return humanizeDuration(duration * 1000);
}

export default {
  formatPrice,
  formatPercent,
  timestampms,
  timestampToDateString,
  dateStringToTimeRange,
};
