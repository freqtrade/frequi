<script setup lang="ts">
import ECharts from 'vue-echarts';
// import { EChartsOption } from 'echarts';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent,
  VisualMapComponent,
} from 'echarts/components';

import { registerTransform } from 'echarts';

import type { TimeSummaryCols, TimeSummaryReturnValue } from '@/types';
import type { EChartsOption, LinearGradientObject } from 'echarts';

use([
  BarChart,
  LineChart,
  CanvasRenderer,
  GridComponent,
  DatasetComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  TransformComponent,
]);

const props = withDefaults(
  defineProps<{
    dailyStats: TimeSummaryReturnValue;
    showTitle?: boolean;
    profitCol: TimeSummaryCols;
  }>(),
  {
    showTitle: true,
  },
);

// Define Column labels here to avoid typos
const CHART_PROFIT = computed(() =>
  props.profitCol === 'abs_profit' ? 'Absolute profit' : 'Relative profit',
);
const CHART_TRADE_COUNT = 'Trade Count';

const settingsStore = useSettingsStore();
const colorStore = useColorStore();

const dailyChart = ref(null);

const absoluteMin = computed(
  () =>
    props.dailyStats.data.reduce(
      (min, p) => (p[props.profitCol] < min ? p[props.profitCol] : min),
      props.dailyStats.data[0]?.[props.profitCol] ?? 0,
    ) * (props.profitCol === 'rel_profit' ? 100 : 1),
);
const absoluteMax = computed(
  () =>
    props.dailyStats.data.reduce(
      (max, p) => (p[props.profitCol] > max ? p[props.profitCol] : max),
      props.dailyStats.data[0]?.[props.profitCol] ?? 0,
    ) * (props.profitCol === 'rel_profit' ? 100 : 1),
);

registerTransform(ftEchartsTransforms.multiple);

const colorStops: LinearGradientObject = {
  type: 'linear',
  x: 0,
  y: 0,
  x2: 1,
  y2: 0,
  colorStops: [
    {
      offset: 0,
      color: colorStore.colorProfit, // color at 0%
    },
    {
      offset: 0.5,
      color: colorStore.colorProfit, // color at 50%
    },
    {
      offset: 0.5,
      color: colorStore.colorLoss, // color at 50%
    },
    {
      offset: 1,
      color: colorStore.colorLoss, // color at 100%
    },
  ],
};
const dailyChartOptions: ComputedRef<EChartsOption> = computed(() => {
  return {
    title: {
      text: 'Daily profit',
      show: props.showTitle,
    },
    backgroundColor: 'rgba(0, 0, 0, 0)',
    dataset: [
      {
        dimensions: ['date', props.profitCol, 'trade_count'],
        source: props.dailyStats.data,
      },
      {
        transform: {
          type: 'ft:multiple',
          config: { dimension: props.profitCol, factor: props.profitCol == 'rel_profit' ? 100 : 1 },
        },
      },
    ],
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
      data: [
        {
          name: CHART_PROFIT.value,
          lineStyle: {
            color: colorStops,
          },
          itemStyle: {
            color: colorStops,
          },
        },
        { name: CHART_TRADE_COUNT },
      ],
      top: 0,
      right: '5%',
    },
    xAxis: [
      {
        type: 'category',
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
            min: absoluteMin.value,
            color: colorStore.colorLoss,
          },
          {
            min: 0.0,
            max: absoluteMax.value,
            color: colorStore.colorProfit,
          },
        ],
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: CHART_PROFIT.value,
        splitLine: {
          show: false,
        },
        nameRotate: 90,
        nameLocation: 'middle',
        nameGap: 35,
        axisLabel: {
          formatter: (value) => {
            return props.profitCol === 'rel_profit' ? `${value}%` : `${value}`;
          },
        },
      },
      {
        type: 'value',
        name: CHART_TRADE_COUNT,
        nameRotate: 90,
        nameLocation: 'middle',
        nameGap: 30,
      },
    ],
    grid: {
      left: '50',
      right: '45',
      bottom: '15%',
    },
    series: [
      {
        type: 'line',
        name: CHART_PROFIT.value,
        // Color is induced by visualMap
        datasetIndex: 1,
      },
      {
        type: 'bar',
        name: CHART_TRADE_COUNT,
        itemStyle: {
          color: 'rgba(150,150,150,0.3)',
        },
        yAxisIndex: 1,
        datasetIndex: 1,
      },
    ],
  };
});
</script>

<template>
  <ECharts
    v-if="dailyStats.data"
    ref="dailyChart"
    :option="dailyChartOptions"
    :theme="settingsStore.chartTheme"
    :style="{ height: '100%' }"
    autoresize
  />
</template>

<style lang="css" scoped>
.echarts {
  min-height: 240px;
  height: 100%;
}
</style>
