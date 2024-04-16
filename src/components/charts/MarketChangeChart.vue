<template>
  <e-charts
    v-if="marketChangeData?.data"
    ref="dailyChart"
    :option="dailyChartOptions"
    :theme="settingsStore.chartTheme"
    :style="{ height: width * 0.6 + 'px' }"
    autoresize
  />
</template>

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

import { BacktestMarketChange } from '@/types';
import { useSettingsStore } from '@/stores/settings';
import { EChartsOption } from 'echarts';
import { useElementSize } from '@vueuse/core';
import { dataZoomPartial } from '@/shared/charts/chartZoom';

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
const CHART_MARKET_CHANGE = 'Market change';

const props = defineProps({
  marketChangeData: {
    type: Object as () => BacktestMarketChange | null,
    required: true,
  },
  showTitle: {
    type: Boolean,
    default: true,
  },
});

const settingsStore = useSettingsStore();

const dailyChart = ref(null);
const { width } = useElementSize(dailyChart);

const dailyChartOptions: ComputedRef<EChartsOption> = computed(() => {
  if (!props.marketChangeData) {
    return {};
  }
  const colDate = props.marketChangeData.columns.findIndex((el) => el === '__date_ts');
  const colRelMean = props.marketChangeData.columns.findIndex((el) => el === 'rel_mean');
  return {
    title: {
      text: 'Market change',
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
    legend: {
      data: [CHART_MARKET_CHANGE],
      right: '5%',
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
        // xAxisIndex: [0],
        start: 0,

        end: 100,
      },
      {
        // xAxisIndex: [0],
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

<style lang="scss" scoped>
.echarts {
  min-height: 240px;
}
</style>
