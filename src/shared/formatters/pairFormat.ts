/**
 *  Split a trade pair into stake and quote currency
 * @param pair pair to split, either <stake>/<quote> or <stake>/<quote>:<settle>
 * @returns {baseCurrency, quoteCurrency}
 */
export function splitTradePair(pair: string): { baseCurrency: string; quoteCurrency: string } {
  if (!pair) return { baseCurrency: '', quoteCurrency: '' };
  const [baseCurrency, quoteCurrency] = pair.split('/');
  if (quoteCurrency !== undefined) {
    const quoteCurrencySplit = quoteCurrency.split(':');
    return { baseCurrency: baseCurrency, quoteCurrency: quoteCurrencySplit[0] || quoteCurrency };
  }
  // In case only one asset is passed in (e.g. USDT) we invert the values, assuming this is the quote currency.
  return { baseCurrency: quoteCurrency ?? '', quoteCurrency: baseCurrency ?? '' };
}
