<script setup lang="ts">
import ECharts from 'vue-echarts';
import type { EChartsOption } from 'echarts';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import {
  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';

import type { ClosedTrade } from '@/types';

use([
  BarChart,

  CanvasRenderer,

  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
]);

// Define Column labels here to avoid typos
const CHART_PROFIT = 'Trade count';

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
// registerTransform(ecStat.transform.histogram);
// console.log(profits);
// const data = [[]];
const binOptions = [
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '20', value: 20 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
];
const data = computed(() => {
  const profits = props.trades
    .filter((trade) => isDefined(trade.profit_ratio))
    .map((trade) => trade.profit_ratio ?? 0);

  return binData(profits, settingsStore.profitDistributionBins);
});

const chartOptions = computed((): EChartsOption => {
  const chartOptionsLoc: EChartsOption = {
    title: {
      text: 'Profit distribution',
      left: 'center',
      show: props.showTitle,
    },
    backgroundColor: 'rgba(0, 0, 0, 0)',
    dataset: {
      source: data.value,
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
      data: [CHART_PROFIT],
      right: '5%',
      top: 0,
      selectedMode: false,
    },
    xAxis: {
      type: 'category',
      name: 'Profit %',
      nameLocation: 'middle',
      nameGap: 25,
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
        nameGap: 35,
        position: 'left',
      },
    ],
    grid: {
      ...echartsGridDefault,
      bottom: 50,
    },

    series: [
      {
        type: 'bar',
        name: CHART_PROFIT,
        animation: true,
        encode: {
          x: 'x0',
          y: 'y0',
        },

        // symbol: 'none',
      },
    ],
  };
  return chartOptionsLoc;
});
</script>

<template>
  <div class="flex flex-col h-full relative">
    <div class="grow mb-2">
      <ECharts v-if="trades" :option="chartOptions" autoresize :theme="settingsStore.chartTheme" />
    </div>
    <UFormField
      class="z-2 absolute fixed-top flex items-center gap-10 ms-2 mt-1"
      :class="{ 'mx-auto': showTitle }"
      label-for="input-bins"
      label="Bins"
      orientation="horizontal"
    >
      <USelect
        v-model="settingsStore.profitDistributionBins"
        size="sm"
        :items="binOptions"
      ></USelect>
    </UFormField>
  </div>
</template>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
  min-height: 150px;
}
</style>
