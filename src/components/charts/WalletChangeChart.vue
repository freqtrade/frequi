<script setup lang="ts">
import ECharts from 'vue-echarts';
// import { EChartsOption } from 'echarts';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  DataZoomComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  CalendarComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';

import type { BacktestMarketChange } from '@/types';
import type { EChartsOption } from 'echarts';

use([
  LineChart,
  CalendarComponent,
  CanvasRenderer,
  GridComponent,
  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
]);

const colorStore = useColorStore();
// Define Column labels here to avoid typos
const CHART_MARKET_CHANGE = 'Wallet change';

const props = withDefaults(
  defineProps<{
    walletData: BacktestMarketChange | null;
    showTitle?: boolean;
  }>(),
  {
    showTitle: true,
  },
);

const settingsStore = useSettingsStore();

const marketChangeChart = ref(null);

const marketChangeOptions: ComputedRef<EChartsOption> = computed(() => {
  if (!props.walletData) {
    return {};
  }
  const colDate = props.walletData.columns.findIndex((el) => el === '__date_ts');
  const colTotal = props.walletData.columns.findIndex((el) => el === 'total');
  const startingValue: number = props.walletData.data[0][colTotal] as number;
  return {
    title: {
      text: 'Wallet Change',
      left: 'center',
      show: props.showTitle,
    },
    backgroundColor: 'rgba(0, 0, 0, 0)',
    dataset: {
      source: props.walletData.data,
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
    grid: {
      ...echartsGridDefault,
    },
    legend: {
      data: [CHART_MARKET_CHANGE],
      right: '5%',
      selectedMode: false,
    },
    xAxis: [
      {
        type: 'time',
        axisLine: { onZero: false },
        axisPointer: {
          label: { show: false },
        },
        // position: 'top',
        splitNumber: 20,
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: CHART_MARKET_CHANGE,
        splitLine: {
          show: false,
        },
        nameRotate: 90,
        nameLocation: 'middle',
        axisLabel: {
          formatter: (value) => {
            return formatPrice(value, 2);
          },
        },
        nameGap: 35,
        min: 'dataMin',
        max: 'dataMax',
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        bottom: 10,
        start: 0,
        end: 100,
        ...dataZoomPartial,
      },
    ],
    visualMap: [
      {
        show: false,
        pieces: [
          {
            gte: startingValue,
            color: colorStore.colorProfit,
          },
          {
            gt: startingValue - 0.01,
            lt: startingValue + 0.01,
            color: colorStore.colorProfit,
          },
          {
            lt: startingValue - 0.01,
            color: colorStore.colorLoss,
          },
        ],
      },
    ],
    series: [
      {
        type: 'line',
        name: CHART_MARKET_CHANGE,
        showSymbol: false,
        color: settingsStore.chartTheme === 'dark' ? '#c2c2c2' : 'black',
        encode: {
          x: colDate,
          // open, close, low, high
          y: colTotal,
        },
      },
    ],
  };
});
</script>

<template>
  <ECharts
    v-if="walletData?.data"
    ref="marketChangeChart"
    :option="marketChangeOptions"
    :theme="settingsStore.chartTheme"
    autoresize
  />
</template>

<style lang="css" scoped>
.echarts {
  min-height: 240px;
  height: 100%;
}
</style>
