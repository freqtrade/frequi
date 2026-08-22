/**
 * Helpers to convert between freqtrade timerange strings and date/time input values.
 *
 * One side of a timerange is either `yyyyMMdd`, `yyyyMMddTHHmm` or `yyyyMMddTHHmmss`
 * (all interpreted as UTC), or a unix timestamp in seconds or milliseconds.
 */

const timeRangePartRe = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?$/;
const dateInputRe = /^(\d{4})-(\d{2})-(\d{2})$/;
const timeInputRe = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;

export interface TimeRangePart {
  /** Date in `yyyy-MM-dd` format (UTC) */
  date: string;
  /** Time in `HH:mm` or `HH:mm:ss` format (UTC) - empty for midnight aligned parts */
  time: string;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Convert one side of a timerange to date and time input values.
 * @param part one side of a timerange (`20220427`, `20220427T1105` or a unix timestamp)
 * @returns date and time (UTC), or null if the part is empty or in an unknown format
 */
export function timeRangePartToInput(part: string): TimeRangePart | null {
  if (!part) {
    return null;
  }
  const match = part.match(timeRangePartRe);
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    return {
      date: `${year}-${month}-${day}`,
      time: hour ? `${hour}:${minute}${second ? `:${second}` : ''}` : '',
    };
  }
  if (/^\d{10}$/.test(part) || /^\d{13}$/.test(part)) {
    const d = new Date(part.length === 10 ? parseInt(part) * 1000 : parseInt(part));
    const hasTime = d.getUTCHours() || d.getUTCMinutes() || d.getUTCSeconds();
    return {
      date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
      time: hasTime
        ? `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}${
            d.getUTCSeconds() ? `:${pad(d.getUTCSeconds())}` : ''
          }`
        : '',
    };
  }
  return null;
}

/**
 * Convert date and time input values to one side of a timerange.
 * Uses the lowest precision that keeps all information - `yyyyMMdd` for midnight,
 * seconds are only added if they're set.
 * @param date date in `yyyy-MM-dd` format (UTC)
 * @param time time in `HH:mm` or `HH:mm:ss` format (UTC) - ignored if empty or invalid
 */
export function inputToTimeRangePart(date: string, time: string = ''): string {
  const dateMatch = date.match(dateInputRe);
  if (!dateMatch) {
    return '';
  }
  const datePart = `${dateMatch[1]}${dateMatch[2]}${dateMatch[3]}`;
  const timeMatch = time.match(timeInputRe);
  if (!timeMatch) {
    return datePart;
  }
  const [, hour, minute, second] = timeMatch;
  if (second && second !== '00') {
    return `${datePart}T${hour}${minute}${second}`;
  }
  if (hour === '00' && minute === '00') {
    return datePart;
  }
  return `${datePart}T${hour}${minute}`;
}
