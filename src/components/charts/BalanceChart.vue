<template>
  <e-charts
    v-if="currencies"
    :option="balanceChartOptions"
    :theme="settingsStore.chartTheme"
    autoresize
  />
</template>

<script setup lang="ts">
import ECharts from 'vue-echarts';
import { EChartsOption } from 'echarts';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import {
  DatasetComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';

import { BalanceRecords } from '@/types';
import { formatPriceCurrency } from '@/shared/formatters';
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';

use([
  PieChart,
  CanvasRenderer,
  DatasetComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  LabelLayout,
]);

const props = defineProps({
  currencies: { required: true, type: Array as () => BalanceRecords[] },
  showTitle: { required: false, type: Boolean },
});
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
      source: props.currencies.map((currency) => {
        return {
          balance: currency.balance,
          currency: currency.currency,
          est_stake: currency.est_stake,
          free: currency.free,
          used: currency.used,
          stake: currency.stake,
        };
      }),
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

<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 100%;
  min-height: 240px;
}
</style>
