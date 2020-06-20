import moment from 'moment';

export function formatPercent(value) {
  return value ? `${(value * 100).toFixed(3)}%` : '';
}

export function formatPrice(value) {
  return value ? value.toFixed(8) : '';
}

export function timestampms(ts) {
  return moment(ts).format('YYYY-MM-DD hh:mm:ss');
}

export default {
  formatPrice,
  formatPercent,
  timestampms,
};
