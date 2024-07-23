import { PlotConfig, PlotConfigTemplate } from '@/types';

const plotTemplates = ref<PlotConfigTemplate>({
  BollingerBands: {
    main_plot: {
      bb_upperband: {
        color: '#008af4',
        type: 'line',
        fill_to: 'bb_lowerband',
      },
      bb_lowerband: {
        color: '#008af4',
        type: 'line',
      },
    },
  },
  RSI: {
    subplots: {
      RSI: {
        rsi: {
          color: '#ff8000',
          type: 'line',
        },
      },
    },
  },
  MACD: {
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
  },
});

export function usePlotTemplates() {
  function applyPlotTemplate(templateName: string, currentConfig: PlotConfig) {
    const template = plotTemplates.value[templateName];
    if (!template) {
      return currentConfig;
    }
    return deepMerge(currentConfig, template);
  }

  return {
    plotTemplates,
    applyPlotTemplate,
    plotTemplateNames: computed(() => Object.keys(plotTemplates.value)),
  };
}
