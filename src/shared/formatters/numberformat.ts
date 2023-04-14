export function isNotUndefined<T>(val: T | undefined | null): val is T {
  return !(val === undefined || val === null);
}

export function formatPercent(value: number, decimals = 3): string {
  return isNotUndefined(value) ? `${(value * 100).toFixed(decimals)}%` : '';
}

/**
 * Format number to `decimals` without trailing zeros
 * @param value Number to format
 * @param decimals number of decimals (Defaults to 15)
 * @returns Formatted string
 */
export function formatPrice(value: number | null, decimals = 15): string {
  // const format = new Intl.NumberFormat('', {maximumFractionDigits: decimals}
  return isNotUndefined(value)
    ? value.toLocaleString('fullwide', {
        useGrouping: false,
        maximumFractionDigits: decimals,
      })
    : 'N/A';
}

/**
 * Formats price in the format "<price> <StakeCurrency>" using "deciaml" decimals
 * @param price Price to format
 * @param currency currency to use
 * @param decimals Decimals
 * @returns
 */
export function formatPriceCurrency(price: number | null, currency: string, decimals = 3) {
  return `${formatPrice(price, decimals)} ${currency}`;
}

export default {
  isNotUndefined,
  formatPrice,
  formatPercent,
};
