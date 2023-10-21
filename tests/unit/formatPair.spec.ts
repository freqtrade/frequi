import { describe, it, expect } from 'vitest';
import { splitTradePair } from '@/shared/formatters';

describe('splitTradePair', () => {
  it('Extracts stake and quote currencies from spot pairs', () => {
    expect(splitTradePair('BTC/USDT')).toEqual({ baseCurrency: 'BTC', quoteCurrency: 'USDT' });
    expect(splitTradePair('USDT/BTC')).toEqual({ baseCurrency: 'USDT', quoteCurrency: 'BTC' });
    expect(splitTradePair('USDT/USDT')).toEqual({ baseCurrency: 'USDT', quoteCurrency: 'USDT' });
    expect(splitTradePair('USDT/USDT')).toEqual({ baseCurrency: 'USDT', quoteCurrency: 'USDT' });
  });
  it('Extracts stake and quote currencies from spot pairs', () => {
    expect(splitTradePair('BTC/USDT:USDT')).toEqual({
      baseCurrency: 'BTC',
      quoteCurrency: 'USDT',
    });
    expect(splitTradePair('USDT/BTC:BTC')).toEqual({ baseCurrency: 'USDT', quoteCurrency: 'BTC' });
    expect(splitTradePair('USDT/USDT:USDT')).toEqual({
      baseCurrency: 'USDT',
      quoteCurrency: 'USDT',
    });
    expect(splitTradePair('USDT/USDT:USDT')).toEqual({
      baseCurrency: 'USDT',
      quoteCurrency: 'USDT',
    });
  });
  it('Does not fail on empty input', () => {
    expect(splitTradePair('')).toEqual({ baseCurrency: '', quoteCurrency: '' });
    expect(splitTradePair('USDT')).toEqual({ baseCurrency: '', quoteCurrency: 'USDT' });
  });
});
