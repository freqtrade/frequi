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

function replaceTemplateColumns(template: Partial<PlotConfig>, nameMap: Record<string, string>) {
  // Replace column names in the template with the actual column names
  // Replace the keys of all elements in main_plot
  const newTemplate = deepClone(template);
  if (!nameMap) {
    return newTemplate;
  }
  const newMainPlot: Record<string, any> = {};
  for (const key in template.main_plot) {
    const newKey = nameMap[key] || key;
    newMainPlot[newKey] = template.main_plot[key];
  }
  newTemplate.main_plot = newMainPlot;

  // Replace the keys of all elements in subplots
  const newSubplots: Record<string, any> = {};
  for (const subplotKey in template.subplots) {
    const newSubplot: Record<string, any> = {};
    for (const key in template.subplots[subplotKey]) {
      const newKey = nameMap[key] || key;
      newSubplot[newKey] = template.subplots[subplotKey][key];
    }
    newSubplots[subplotKey] = newSubplot;
  }
  newTemplate.subplots = newSubplots;
  return newTemplate;
}

export function usePlotTemplates() {
  function getTemplateContent(templateName: string) {
    return plotTemplates.value[templateName] || {};
  }

  function applyPlotTemplate(
    templateName: string,
    currentConfig: PlotConfig,
    nameMap: Record<string, string> = {},
  ) {
    const template = getTemplateContent(templateName);
    if (!template) {
      return currentConfig;
    }
    const newTemplate = replaceTemplateColumns(template, nameMap);
    return deepMerge(currentConfig, newTemplate);
  }

  return {
    plotTemplates,
    applyPlotTemplate,
    getTemplateContent,
    plotTemplateNames: computed(() => Object.keys(plotTemplates.value)),
  };
}
