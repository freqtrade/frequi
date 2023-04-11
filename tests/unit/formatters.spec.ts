import { describe, it, expect } from 'vitest';
import { formatPercent, formatPrice, formatPriceCurrency } from '@/shared/formatters';

describe('formatters.ts', () => {
  it('Format percent correctly', () => {
    expect(formatPercent(0.5)).toEqual('50.000%');
  });

  it('format price currency as expected', () => {
    expect(formatPriceCurrency(5123.551123, 'USDT', 3)).toEqual('5123.551 USDT');
    expect(formatPriceCurrency(5123.551123, 'USDT')).toEqual('5123.551 USDT');
    expect(formatPriceCurrency(5123.551123, 'USDT', 5)).toEqual('5123.55112 USDT');
    expect(formatPriceCurrency(5123.5511230000000001, 'USDT', 5)).toEqual('5123.55112 USDT');
    expect(formatPriceCurrency(0.00001, 'BTC', 5)).toEqual('0.00001 BTC');
  });

  it('Format price correctly', () => {
    expect(formatPrice(5123.5123512)).toEqual('5123.5123512');
    expect(formatPrice(5123.5123512, 8)).toEqual('5123.5123512');
    expect(formatPrice(5123.5123512, 3)).toEqual('5123.512');
    expect(formatPrice(5123.51200000000000001, 8)).toEqual('5123.512');
    expect(formatPrice(0.001, 3)).toEqual('0.001');
    expect(formatPrice(0.0019, 3)).toEqual('0.002');
    expect(formatPrice(2.701e-9, 3)).toEqual('0');
    expect(formatPrice(2.701e-9, 8)).toEqual('0');
    expect(formatPrice(2.701e-9, 11)).toEqual('0.0000000027');
  });
});
