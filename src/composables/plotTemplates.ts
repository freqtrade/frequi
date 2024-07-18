import { ChartType, PlotConfig, PlotConfigTemplate } from '@/types';

const plotTemplates: PlotConfigTemplate = {
  RSI: {
    subplots: {
      RSI: {
        rsi: {
          color: 'orange',
          type: ChartType.line,
        },
      },
    },
  },
  MACD: {
    subplots: {
      MACD: {
        macdsignal: {
          color: 'orange',
          type: ChartType.line,
        },
        macd: {
          color: 'blue',
          type: ChartType.line,
        },
      },
    },
  },
};

export function usePlotTemplates() {
  function applyPlotTemplate(templateName: string, currentConfig: PlotConfig) {
    const template = plotTemplates[templateName];
    if (!template) {
      return currentConfig;
    }
    return deepMerge(currentConfig, template);
  }

  return {
    plotTemplates,
    applyPlotTemplate,
    plotTemplateNames: Object.keys(plotTemplates),
  };
}
