<script setup lang="ts">
import type { EChartsOption } from 'echarts';
import ECharts from 'vue-echarts';

import { PieChart } from 'echarts/charts';
import {
  DatasetComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

import type { BalanceValues } from '@/types';

use([
  PieChart,
  CanvasRenderer,
  DatasetComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  LabelLayout,
]);

const balanceChart = ref(null);
const { width } = useElementSize(balanceChart);

const props = withDefaults(
  defineProps<{
    currencies: BalanceValues[];
    showTitle?: boolean;
  }>(),
  {
    showTitle: true,
  },
);
const settingsStore = useSettingsStore();

const balanceChartOptions = computed((): EChartsOption => {
  return {
    title: {
      text: 'Balance',
      show: props.showTitle,
    },
    center: ['50%', '50%'],
    backgroundColor: 'rgba(0, 0, 0, 0)',
    dataset: {
      dimensions: ['balance', 'currency', 'est_stake', 'free', 'used', 'stake'],
      source: props.currencies,
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${formatPriceCurrency(params.value.balance, params.value.currency, 8)}<br />${
          params.percent
        }% (${formatPriceCurrency(params.value.est_stake, params.value.stake)})`;
      },
    },
    // legend: {
    //   orient: 'vertical',
    //   right: 10,
    //   top: 20,
    //   bottom: 20,
    // },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],

        encode: {
          value: 'est_stake',
          itemName: 'currency',
          tooltip: ['balance', 'currency'],
        },
        label: {
          formatter: '{b} - {d}%',
        },
        tooltip: {
          show: true,
        },
      },
    ],
  };
});
</script>

<template>
  <ECharts
    v-if="currencies"
    ref="balanceChart"
    :option="balanceChartOptions"
    :theme="settingsStore.chartTheme"
    :style="{ height: width * 0.6 + 'px' }"
    autoresize
  />
</template>

<style lang="css" scoped>
.echarts {
  min-height: 20px;
}
</style>
