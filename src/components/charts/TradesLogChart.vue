<script setup lang="ts">
import ECharts from 'vue-echarts';
import type { EChartsOption } from 'echarts';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import {
  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  VisualMapPiecewiseComponent,
} from 'echarts/components';

import type { ClosedTrade } from '@/types';

use([
  BarChart,
  LineChart,

  CanvasRenderer,

  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  VisualMapPiecewiseComponent,
]);

// Define Column labels here to avoid typos
const CHART_PROFIT = 'Profit %';
const CHART_COLOR = '#9be0a8';

const props = withDefaults(
  defineProps<{
    trades: ClosedTrade[];
    showTitle?: boolean;
  }>(),
  {
    showTitle: true,
  },
);
const settingsStore = useSettingsStore();
const colorStore = useColorStore();
const chartData = computed(() => {
  const res: (number | string)[][] = [];
  const sortedTrades = props.trades
    .slice(0)
    .sort((a, b) => (a.close_timestamp > b.close_timestamp ? 1 : -1));
  for (let i = 0, len = sortedTrades.length; i < len; i += 1) {
    const trade = sortedTrades[i];
    const entry = [
      i,
      (trade.profit_ratio * 100).toFixed(2),
      trade.pair,
      trade.botName,
      timestampms(trade.close_timestamp),
      trade.is_short === undefined || !trade.is_short ? 'Long' : 'Short',
    ];
    res.push(entry);
  }
  return res;
});

const chartOptions = computed((): EChartsOption => {
  // const { chartData } = this;
  // Show a maximum of 50 trades by default - allowing to zoom out further.
  const datazoomStart = chartData.value.length > 0 ? (1 - 50 / chartData.value.length) * 100 : 100;
  return {
    title: {
      text: 'Trades log',
      left: 'center',
      show: props.showTitle,
    },
    backgroundColor: 'rgba(0, 0, 0, 0)',
    dataset: {
      dimensions: ['date', 'profit'],
      source: chartData.value,
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const botName = params[0].data[3] ? ` | ${params[0].data[3]}` : '';
        return `${params[0].data[2]} | ${params[0].data[5]} ${botName}<br>${params[0].data[4]}<br>Profit ${params[0].data[1]} %`;
      },
      axisPointer: {
        type: 'line',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    xAxis: {
      type: 'category',
      show: false,
    },
    yAxis: [
      {
        type: 'value',
        name: CHART_PROFIT,
        splitLine: {
          show: false,
        },
        nameRotate: 90,
        nameLocation: 'middle',
        nameGap: 30,
      },
    ],
    grid: {
      ...echartsGridDefault,
      left: 80,
    },
    dataZoom: [
      {
        type: 'inside',
        start: datazoomStart,
        end: 100,
      },
      {
        bottom: 10,
        start: datazoomStart,
        end: 100,
        ...dataZoomPartial,
      },
    ],
    visualMap: [
      {
        show: true,
        seriesIndex: 0,
        pieces: [
          {
            max: 0.0,
            color: colorStore.colorLoss,
          },
          {
            min: 0.0,
            color: colorStore.colorProfit,
          },
        ],
      },
    ],
    series: [
      {
        type: 'bar',
        name: CHART_PROFIT,
        barCategoryGap: '0%',
        animation: false,
        label: {
          show: true,
          position: 'top',
          rotate: 90,
          offset: [7.5, 7.5],
          formatter: '{@[1]} %',
          color: settingsStore.chartTheme === 'dark' ? '#c2c2c2' : '#3c3c3c',
        },
        encode: {
          x: 0,
          y: 1,
        },

        itemStyle: {
          color: CHART_COLOR,
        },
      },
    ],
  };
});
</script>

<template>
  <ECharts
    v-if="trades.length > 0"
    :option="chartOptions"
    autoresize
    :theme="settingsStore.chartTheme"
  />
</template>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
  min-height: 150px;
}
</style>
