export function formatPercent(value) {
  return value ? `${(value * 100).toFixed(3)}%` : '';
}

export function formatPrice(value) {
  return value ? value.toFixed(8) : '';
}

export default {
  formatPrice,
  formatPercent,
};
