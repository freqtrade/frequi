/**
 *  Split a trade pair into stake and quote currency
 * @param pair pair to split, either <stake>/<quote> or <stake>/<quote>:<settle>
 * @returns {stakeCurrency, quoteCurrency}
 */
export function splitTradePair(pair: string): { stakeCurrency: string; quoteCurrency: string } {
  const [stakeCurrency, quoteCurrency] = pair.split('/');
  const quoteCurrencySplit = quoteCurrency.split(':');
  return { stakeCurrency, quoteCurrency: quoteCurrencySplit[0] || quoteCurrency };
}
