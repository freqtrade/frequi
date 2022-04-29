export function isUndefined(val): boolean {
  return val === undefined || val === null;
}

export function formatPercent(value: number, decimals = 3): string {
  return !isUndefined(value) ? `${(value * 100).toFixed(decimals)}%` : '';
}

/**
 * Format number to `decimals` without trailing zeros
 * @param value Number to format
 * @param decimals number of decimals (Defaults to 15)
 * @returns Formatted string
 */
export function formatPrice(value: number, decimals = 15): string {
  // const format = new Intl.NumberFormat('', {maximumFractionDigits: decimals}
  // return !isUndefined(value) ? parseFloat(value.toFixed(decimals)).toString() : '';
  return !isUndefined(value)
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
export function formatPriceCurrency(price, currency: string, decimals = 3) {
  return `${formatPrice(price, decimals)} ${currency}`;
}

export default {
  isUndefined,
  formatPrice,
  formatPercent,
};
