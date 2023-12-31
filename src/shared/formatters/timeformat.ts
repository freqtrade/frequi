import { parse, toDate } from 'date-fns';
import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import humanizeDuration from 'humanize-duration';
import { isNotUndefined } from './numberformat';

/** Parse date from string, returns date in UTC! */
export function dateFromString(datestring: string, format: string): Date {
  const localTime = parse(datestring, format, 0);
  return zonedTimeToUtc(localTime, 'UTC');
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

function formatDate(date: Date, formatPattern: string, timezone?: string): string {
  const timezoneRes = getTimeZone(timezone);
  return format(utcToZonedTime(date, timezoneRes), formatPattern, {
    timeZone: timezoneRes,
  });
}

/**
 * Convert a timestamp / Date object to String
 * @param ts Timestamp as number or date (in utc!!)
 */
export function timestampms(ts: number | Date): string {
  return formatDate(toDate(ts), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Convert a timestamp / Date object to String.
 * Returns 'N/A' if ts is null
 * @param ts Timestamp as number or date (in utc!!)
 */
export function timestampmsOrNa(ts: number | Date | null): string {
  return ts ? formatDate(toDate(ts), 'yyyy-MM-dd HH:mm:ss') : 'N/A';
}

/**
 * Convert a timestamp / Date object to String
 * @param ts Timestamp as number or date (in utc!!)
 * @param timezone timezone to use
 * @returns formatted date in desired timezone (or globally configured timezone)
 */
export function timestampmsWithTimezone(ts: number | Date | null, timezone?: string): string {
  if (!ts) {
    return 'N/A';
  }
  return formatDate(toDate(ts), 'yyyy-MM-dd HH:mm:ss (z)', timezone);
}

/**
 * Converts timestamp or Date object to yyyy-MM-dd format.
 * @param ts
 */
export function timestampToDateString(ts: number | Date): string {
  return formatDate(toDate(ts), 'yyyy-MM-dd');
}

/**
 * Converts timestamp or Date object to yyyyMMdd format.
 * Used for timerange displays
 * @param ts
 */
export function timestampToTimeRangeString(ts: number | Date): string {
  return formatDate(toDate(ts), 'yyyyMMdd');
}

/**
 * Converts a String of the format yyyy-MM-dd to YYYYMMDD. To be used as timerange.
 * @param datestring Input string (in the format yyyy-MM-dd)
 */
export function dateStringToTimeRange(datestring: string): string {
  return isNotUndefined(datestring) ? datestring.replace(/-/g, '') : '';
}

export function timestampHour(ts: number): number {
  return Number(formatDate(toDate(ts), 'HH'));
}

/**
 *  Get humanized Duration from seconds
 * @param duration Duration in seconds
 */
export function humanizeDurationFromSeconds(duration: number): string {
  return humanizeDuration(duration * 1000);
}

export default {
  timestampms,
  timestampmsWithTimezone,
  timestampToDateString,
  dateStringToTimeRange,
  setTimezone,
};

export const exportForTesting = {
  getTimeZone,
  formatDate,
};
