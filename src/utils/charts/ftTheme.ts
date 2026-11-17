import { registerTheme } from 'echarts/core';

const palette = [
  '#22d3ee',
  '#a78bfa',
  '#34d399',
  '#fbbf24',
  '#f472b6',
  '#60a5fa',
  '#fb923c',
  '#2dd4bf',
];

function buildTheme(mode: 'dark' | 'light') {
  const dark = mode === 'dark';
  const text = dark ? '#a8b3c7' : '#475569';
  const axisLine = dark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.18)';
  const splitLine = dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.07)';

  const axis = {
    axisLine: { show: true, lineStyle: { color: axisLine } },
    axisTick: { show: false },
    axisLabel: { show: true, color: text },
    splitLine: { show: true, lineStyle: { color: splitLine } },
    splitArea: { show: false },
    nameTextStyle: { color: text },
  };

  return {
    color: palette,
    // Transparent, so the glass surface of the container shows through.
    backgroundColor: 'transparent',
    textStyle: { color: text },
    title: { textStyle: { color: dark ? '#e2e8f0' : '#0f172a' }, subtextStyle: { color: text } },
    legend: { textStyle: { color: text }, pageTextStyle: { color: text } },
    tooltip: {
      backgroundColor: dark ? 'rgba(10,16,28,0.92)' : 'rgba(255,255,255,0.95)',
      borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)',
      textStyle: { color: dark ? '#e2e8f0' : '#0f172a' },
      extraCssText: 'backdrop-filter: blur(10px); border-radius: 10px;',
      axisPointer: {
        lineStyle: { color: axisLine },
        crossStyle: { color: axisLine },
      },
    },
    categoryAxis: axis,
    valueAxis: axis,
    logAxis: axis,
    timeAxis: axis,
    dataZoom: {
      backgroundColor: 'transparent',
      dataBackgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
      fillerColor: dark ? 'rgba(34,211,238,0.14)' : 'rgba(14,165,233,0.16)',
      borderColor: 'transparent',
      textStyle: { color: text },
      handleColor: dark ? '#94a3b8' : '#64748b',
    },
    line: { smooth: false, symbolSize: 6, lineStyle: { width: 2 } },
    bar: { itemStyle: { borderRadius: [3, 3, 0, 0] } },
    visualMap: { textStyle: { color: text } },
  };
}

/**
 * Registers the freqUI "glass" ECharts themes. They intentionally replace the
 * built-in "dark" / "light" theme names, as these are what the charts reference.
 */
export function registerFtEchartsThemes() {
  registerTheme('dark', buildTheme('dark'));
  registerTheme('light', buildTheme('light'));
}
