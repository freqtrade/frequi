<template>
  <v-chart v-if="currencies" :option="balanceChartOptions" :theme="getChartTheme" autoresize />
</template>

<script lang="ts">
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
import { defineComponent, computed } from '@vue/composition-api';
import { useGetters } from 'vuex-composition-helpers';

use([
  PieChart,
  CanvasRenderer,
  DatasetComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  LabelLayout,
]);

export default defineComponent({
  name: 'BalanceChart',
  components: {
    'v-chart': ECharts,
  },
  props: {
    currencies: { required: true, type: Array as () => BalanceRecords[] },
    showTitle: { required: false, type: Boolean },
  },
  setup(props) {
    const { getChartTheme } = useGetters(['getChartTheme']);

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

    return { getChartTheme, balanceChartOptions };
  },
});
</script>

<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 100%;
  min-height: 240px;
}
</style>
