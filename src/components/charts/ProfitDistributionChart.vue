<template>
  <div class="d-flex flex-column h-100 position-relative">
    <div class="flex-grow-1 order-2">
      <e-charts v-if="trades" :option="chartOptions" autoresize :theme="settingsStore.chartTheme" />
    </div>
    <b-form-group
      class="w-25 order-1"
      :class="showTitle ? 'ms-5 ps-5' : 'position-absolute'"
      label="Bins"
      label-for="input-bins"
      label-cols="6"
      content-cols="6"
      size="sm"
    >
      <b-form-select
        id="input-bins"
        v-model="settingsStore.profitDistributionBins"
        size="sm"
        :options="binOptions"
      ></b-form-select>
    </b-form-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ECharts from 'vue-echarts';
import { EChartsOption } from 'echarts';

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

import { ClosedTrade } from '@/types';
import { binData } from '@/shared/charts/binCount';
import { useSettingsStore } from '@/stores/settings';

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

const props = defineProps({
  trades: { required: true, type: Array as () => ClosedTrade[] },
  showTitle: { default: true, type: Boolean },
});
const settingsStore = useSettingsStore();
// registerTransform(ecStat.transform.histogram);
// console.log(profits);
// const data = [[]];
const binOptions = [10, 15, 20, 25, 50];
const data = computed(() => {
  const profits = props.trades.map((trade) => trade.profit_ratio);

  return binData(profits, settingsStore.profitDistributionBins);
});

const chartOptions = computed((): EChartsOption => {
  const chartOptionsLoc: EChartsOption = {
    title: {
      text: 'Profit distribution',
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
    // grid: {
    // bottom: 80,
    // },

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

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
  min-height: 150px;
}
</style>
