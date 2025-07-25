<script setup lang="ts">
import ECharts from 'vue-echarts';

import type { Trade } from '@/types';
import type { EChartsOption } from 'echarts';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import {
  DatasetComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  VisualMapPiecewiseComponent,
} from 'echarts/components';

use([
  BarChart,
  LineChart,
  CanvasRenderer,

  DatasetComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  VisualMapPiecewiseComponent,
]);

// Define Column labels here to avoid typos
const CHART_PROFIT = 'Profit %';
const CHART_TRADE_COUNT = 'Trade Count';

const props = withDefaults(
  defineProps<{
    trades: Trade[];
    showTitle?: boolean;
  }>(),
  {
    showTitle: true,
  },
);
const settingsStore = useSettingsStore();
const colorStore = useColorStore();

const hourlyData = computed(() => {
  const res = new Array(24);
  for (let i = 0; i < 24; i += 1) {
    res[i] = { hour: i, hourDesc: `${i}h`, profit: 0.0, count: 0.0 };
  }

  for (let i = 0, len = props.trades.length; i < len; i += 1) {
    const trade = props.trades[i];
    if (trade.close_timestamp) {
      const hour = timestampHour(trade.close_timestamp);

      res[hour].profit += trade.profit_ratio;
      res[hour].count += 1;
    }
  }
  return res;
});
const hourlyChartOptions = computed((): EChartsOption => {
  return {
    title: {
      text: 'Hourly Profit',
      show: props.showTitle,
    },
    backgroundColor: 'rgba(0, 0, 0, 0)',
    dataset: {
      dimensions: ['hourDesc', 'profit', 'count'],
      source: hourlyData.value,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: [CHART_PROFIT, CHART_TRADE_COUNT],
      right: '5%',
    },
    xAxis: {
      type: 'category',
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
      {
        type: 'value',
        name: CHART_TRADE_COUNT,
        nameRotate: 90,
        nameLocation: 'middle',
        nameGap: 30,
      },
    ],
    visualMap: [
      {
        dimension: 1,
        seriesIndex: 0,
        show: false,
        pieces: [
          {
            max: 0.0,
            min: -2,
            color: colorStore.colorLoss,
          },
          {
            min: 0.0,
            max: 2,
            color: colorStore.colorProfit,
          },
        ],
      },
    ],
    series: [
      {
        type: 'line',
        name: CHART_PROFIT,
        animation: false,
        // symbol: 'none',
      },
      {
        type: 'bar',
        name: CHART_TRADE_COUNT,
        animation: false,
        itemStyle: {
          color: 'rgba(150,150,150,0.3)',
        },
        yAxisIndex: 1,
      },
    ],
  };
});
</script>

<template>
  <ECharts
    v-if="trades.length > 0"
    :option="hourlyChartOptions"
    autoresize
    :theme="settingsStore.chartTheme"
  />
</template>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
  min-height: 240px;
}
</style>
