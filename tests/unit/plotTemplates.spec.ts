import { describe, it, expect } from 'vitest';

import { usePlotTemplates } from '@/composables/plotTemplates';
import { PlotConfig } from '@/types';

describe('plotTemplates.ts', () => {
  it('Updates main plot values', () => {
    const { replaceTemplateColumns } = usePlotTemplates();
    const reMapping = { ema: 'ema_14' };
    const template: Partial<PlotConfig> = {
      main_plot: {
        ema: {
          color: '#ff8000',
          type: 'line',
        },
      },
    };
    const expected: Partial<PlotConfig> = {
      main_plot: {
        ema_14: {
          color: '#ff8000',
          type: 'line',
        },
      },
    };
    expect(replaceTemplateColumns(template, reMapping)).toEqual(expected);
  });
  it('Updates subplot plot values', () => {
    const { replaceTemplateColumns } = usePlotTemplates();
    const reMapping = { rsi: 'rsi_14' };
    const template: Partial<PlotConfig> = {
      subplots: {
        RSI: {
          rsi: {
            color: '#ff8000',
            type: 'line',
          },
        },
      },
    };
    const expected: Partial<PlotConfig> = {
      subplots: {
        RSI: {
          rsi_14: {
            color: '#ff8000',
            type: 'line',
          },
        },
      },
    };
    expect(replaceTemplateColumns(template, reMapping)).toEqual(expected);
  });
  it('Updates both main and subplot values', () => {
    const { replaceTemplateColumns } = usePlotTemplates();
    const reMapping = { ema: 'ema_200', macd: 'macd_5m', macdsignal: 'macdsignal_5m' };
    const template: Partial<PlotConfig> = {
      main_plot: {
        ema: {
          color: '#ff8000',
          type: 'line',
        },
      },
      subplots: {
        MACD: {
          macdsignal: {
            color: '#ff8000',
            type: 'line',
          },
          macd: {
            color: '#1370f4',
            type: 'line',
          },
        },
      },
    };
    const expected: Partial<PlotConfig> = {
      main_plot: {
        ema_200: {
          color: '#ff8000',
          type: 'line',
        },
      },
      subplots: {
        MACD: {
          macdsignal_5m: {
            color: '#ff8000',
            type: 'line',
          },
          macd_5m: {
            color: '#1370f4',
            type: 'line',
          },
        },
      },
    };
    expect(replaceTemplateColumns(template, reMapping)).toEqual(expected);
  });
});
