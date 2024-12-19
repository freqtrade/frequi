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
  VisualMapComponent,
} from 'echarts/components';

import type { TimeSummaryReturnValue } from '@/types';
import { useSettingsStore } from '@/stores/settings';
import type { EChartsOption } from 'echarts';
import { useElementSize } from '@vueuse/core';
import { useColorStore } from '@/stores/colors';

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
]);

const props = withDefaults(
  defineProps<{
    dailyStats: TimeSummaryReturnValue;
    showTitle?: boolean;
    profitCol?: 'rel_profit' | 'abs_profit';
  }>(),
  {
    showTitle: true,
    // TODO: rel_profit doesn't render properly.
    profitCol: 'abs_profit',
  },
);

// Define Column labels here to avoid typos
const CHART_PROFIT = props.profitCol === 'abs_profit' ? 'Absolute profit' : 'Relative profit';
const CHART_TRADE_COUNT = 'Trade Count';

const settingsStore = useSettingsStore();
const colorStore = useColorStore();

const dailyChart = ref(null);
const { width } = useElementSize(dailyChart);

const absoluteMin = computed(() =>
  props.dailyStats.data.reduce(
    (min, p) => (p[props.profitCol] < min ? p[props.profitCol] : min),
    props.dailyStats.data[0]?.[props.profitCol],
  ),
);
const absoluteMax = computed(() =>
  props.dailyStats.data.reduce(
    (max, p) => (p[props.profitCol] > max ? p[props.profitCol] : max),
    props.dailyStats.data[0]?.[props.profitCol],
  ),
);
const dailyChartOptions: ComputedRef<EChartsOption> = computed(() => {
  return {
    title: {
      text: 'Daily profit',
      show: props.showTitle,
    },
    backgroundColor: 'rgba(0, 0, 0, 0)',
    dataset: {
      dimensions: ['date', props.profitCol, 'trade_count'],
      source: props.dailyStats.data,
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
        name: CHART_PROFIT,
        splitLine: {
          show: false,
        },
        nameRotate: 90,
        nameLocation: 'middle',
        nameGap: 35,
      },
      {
        type: 'value',
        name: CHART_TRADE_COUNT,
        nameRotate: 90,
        nameLocation: 'middle',
        nameGap: 30,
      },
    ],
    series: [
      {
        type: 'line',
        name: CHART_PROFIT,
        // Color is induced by visualMap
      },
      {
        type: 'bar',
        name: CHART_TRADE_COUNT,
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
    v-if="dailyStats.data"
    ref="dailyChart"
    :option="dailyChartOptions"
    :theme="settingsStore.chartTheme"
    :style="{ height: width * 0.6 + 'px' }"
    autoresize
  />
</template>

<style lang="scss" scoped>
.echarts {
  min-height: 240px;
}
</style>
