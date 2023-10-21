import { describe, it, expect } from 'vitest';
import { splitTradePair } from '@/shared/formatters';

describe('splitTradePair', () => {
  it('Extracts stake and quote currencies from spot pairs', () => {
    expect(splitTradePair('BTC/USDT')).toEqual({ stakeCurrency: 'BTC', quoteCurrency: 'USDT' });
    expect(splitTradePair('USDT/BTC')).toEqual({ stakeCurrency: 'USDT', quoteCurrency: 'BTC' });
    expect(splitTradePair('USDT/USDT')).toEqual({ stakeCurrency: 'USDT', quoteCurrency: 'USDT' });
    expect(splitTradePair('USDT/USDT')).toEqual({ stakeCurrency: 'USDT', quoteCurrency: 'USDT' });
  });
  it('Extracts stake and quote currencies from spot pairs', () => {
    expect(splitTradePair('BTC/USDT:USDT')).toEqual({
      stakeCurrency: 'BTC',
      quoteCurrency: 'USDT',
    });
    expect(splitTradePair('USDT/BTC:BTC')).toEqual({ stakeCurrency: 'USDT', quoteCurrency: 'BTC' });
    expect(splitTradePair('USDT/USDT:USDT')).toEqual({
      stakeCurrency: 'USDT',
      quoteCurrency: 'USDT',
    });
    expect(splitTradePair('USDT/USDT:USDT')).toEqual({
      stakeCurrency: 'USDT',
      quoteCurrency: 'USDT',
    });
  });
  it('Does not fail on empty input', () => {
    expect(splitTradePair('')).toEqual({ stakeCurrency: '', quoteCurrency: '' });
  });
});
