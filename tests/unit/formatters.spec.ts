import {
  formatPercent,
  formatNumber,
  formatPriceCurrency,
  formatDecimal,
} from '@/utils/formatters/numberformat';
import { describe, it, expect } from 'vitest';

describe('formatters.ts', () => {
  it('Format percent correctly', () => {
    expect(formatPercent(0.5)).toEqual('50.000%');
    expect(formatPercent(0.5023, 2)).toEqual('50.23%');
    expect(formatPercent(0.5023, 3)).toEqual('50.230%');
    expect(formatPercent(0.5023, 4)).toEqual('50.2300%');
    expect(formatPercent(0.5023, 1)).toEqual('50.2%');
    expect(formatPercent(null, 1)).toEqual('N/A%');
    expect(formatPercent(undefined, 1)).toEqual('N/A%');
  });

  it('format price currency as expected', () => {
    expect(formatPriceCurrency(5123.551123, 'USDT', 3)).toEqual('5123.551 USDT');
    expect(formatPriceCurrency(5123.551123, 'USDT')).toEqual('5123.551 USDT');
    expect(formatPriceCurrency(5123.551123, 'USDT', 5)).toEqual('5123.55112 USDT');
    expect(formatPriceCurrency(5123.551123000001, 'USDT', 5)).toEqual('5123.55112 USDT');
    expect(formatPriceCurrency(0.00001, 'BTC', 5)).toEqual('0.00001 BTC');
  });

  it('Format price correctly', () => {
    expect(formatNumber(5123.5123512)).toEqual('5123.5123512');
    expect(formatNumber(5123.5123512, 8)).toEqual('5123.5123512');
    expect(formatNumber(5123.5123512, 3)).toEqual('5123.512');
    expect(formatNumber(5123.512000000001, 8)).toEqual('5123.512');
    expect(formatNumber(0.001, 3)).toEqual('0.001');
    expect(formatNumber(0.0019, 3)).toEqual('0.002');
    expect(formatNumber(2.701e-9, 3)).toEqual('0');
    expect(formatNumber(2.701e-9, 8)).toEqual('0');
    expect(formatNumber(2.701e-9, 11)).toEqual('0.0000000027');
    expect(formatNumber(null)).toEqual('N/A');
    expect(formatNumber(undefined)).toEqual('N/A');
  });
  it('Format decimal correctly', () => {
    expect(formatDecimal(1051230.5123512)).toEqual('1051230.51');
    expect(formatDecimal(105123.5123512)).toEqual('105123.51');
    expect(formatDecimal(10512.35123512)).toEqual('10512.35');
    expect(formatDecimal(5123.5123512)).toEqual('5123.51');
    expect(formatDecimal(5123.512000000001)).toEqual('5123.51');
    expect(formatDecimal(123.51245)).toEqual('123.51');
    expect(formatDecimal(92.51245)).toEqual('92.512');
    expect(formatDecimal(12.51245)).toEqual('12.512');
    expect(formatDecimal(1.251245)).toEqual('1.2512');
    expect(formatDecimal(0.001)).toEqual('0.001');
    expect(formatDecimal(0.0019)).toEqual('0.0019');
    expect(formatDecimal(0.001900000000001)).toEqual('0.0019');
    expect(formatDecimal(0.001952123)).toEqual('0.00195');
    expect(formatDecimal(2.701e-9)).toEqual('0.000000002701');
    expect(formatDecimal(null)).toEqual('N/A');
    expect(formatDecimal(-0.001952123)).toEqual('-0.00195');
    expect(formatDecimal(-1051230.5123512)).toEqual('-1051230.51');
  });
});
