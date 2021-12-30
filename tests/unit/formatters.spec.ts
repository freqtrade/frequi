import { formatPercent, formatPriceCurrency } from '@/shared/formatters';

describe('formatters.ts', () => {
  it('Format percent correctly', () => {
    expect(formatPercent(0.5)).toEqual('50.000%');
  });

  it('format price currency as expected', () => {
    expect(formatPriceCurrency(5123.551123, 'USDT', 3)).toEqual('5123.551 USDT');
    expect(formatPriceCurrency(5123.551123, 'USDT')).toEqual('5123.551 USDT');
    expect(formatPriceCurrency(5123.551123, 'USDT', 5)).toEqual('5123.55112 USDT');
  });
});
