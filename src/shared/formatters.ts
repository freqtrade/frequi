import * as moment from 'moment';

export function formatPercent(value: number): string {
  return value ? `${(value * 100).toFixed(3)}%` : '';
}

export function formatPrice(value: number): string {
  return value ? value.toFixed(8) : '';
}

export function timestampms(ts: number | Date): string {
  return moment(ts).format('YYYY-MM-DD HH:mm:ss');
}

export default {
  formatPrice,
  formatPercent,
  timestampms,
};
