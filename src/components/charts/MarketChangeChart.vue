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

// Define Column labels here to avoid typos
const CHART_MARKET_CHANGE = 'Market change %';

const props = withDefaults(
  defineProps<{
    marketChangeData: BacktestMarketChange | null;
    showTitle?: boolean;
  }>(),
  {
    showTitle: true,
  },
);

const settingsStore = useSettingsStore();

const marketChangeChart = ref(null);

const marketChangeOptions: ComputedRef<EChartsOption> = computed(() => {
  if (!props.marketChangeData) {
    return {};
  }
  const colDate = props.marketChangeData.columns.findIndex((el) => el === '__date_ts');
  const colRelMean = props.marketChangeData.columns.findIndex((el) => el === 'rel_mean');
  return {
    title: {
      text: 'Market change %',
      left: 'center',
      show: props.showTitle,
    },
    backgroundColor: 'rgba(0, 0, 0, 0)',
    dataset: {
      source: props.marketChangeData.data,
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
        axisTick: { show: true },
        axisLabel: { show: true },
        axisPointer: {
          label: { show: false },
        },
        // position: 'top',
        splitLine: { show: false },
        splitNumber: 20,
        min: 'dataMin',
        max: 'dataMax',
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
        nameGap: 35,
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
    series: [
      {
        type: 'line',
        name: CHART_MARKET_CHANGE,
        showSymbol: false,
        color: settingsStore.chartTheme === 'dark' ? '#c2c2c2' : 'black',
        encode: {
          x: colDate,
          // open, close, low, high
          y: colRelMean,
        },
      },
    ],
  };
});
</script>

<template>
  <ECharts
    v-if="marketChangeData?.data"
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
