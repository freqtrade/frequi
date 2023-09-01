<template>
  <e-charts
    v-if="currencies"
    ref="balanceChart"
    :option="balanceChartOptions"
    :theme="settingsStore.chartTheme"
    :style="{ height: width * 0.6 + 'px' }"
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

import { BalanceValues } from '@/types';
import { formatPriceCurrency } from '@/shared/formatters';
import { computed, ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useElementSize } from '@vueuse/core';

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

const props = defineProps({
  currencies: { required: true, type: Array as () => BalanceValues[] },
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

<style lang="scss" scoped>
.echarts {
  min-height: 20px;
}
</style>
