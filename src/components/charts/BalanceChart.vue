<template>
  <v-chart v-if="currencies" :option="balanceChartOptions" :theme="getChartTheme" autoresize />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
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

use([
  PieChart,
  CanvasRenderer,
  DatasetComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  LabelLayout,
]);

@Component({
  components: {
    'v-chart': ECharts,
  },
})
export default class BalanceChart extends Vue {
  @Prop({ required: true }) currencies!: BalanceRecords[];

  @Prop({ default: false, type: Boolean }) showTitle!: boolean;

  @Getter getChartTheme!: string;

  get balanceChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Balance',
        show: this.showTitle,
      },
      center: ['50%', '50%'],
      backgroundColor: 'rgba(0, 0, 0, 0)',
      dataset: {
        dimensions: ['balance', 'currency', 'est_stake', 'free', 'used', 'stake'],
        source: this.currencies,
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          console.log(params);
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
  }
}
</script>

<style lang="scss" scoped>
.echarts {
  width: 100%;
  height: 100%;
  min-height: 240px;
}
</style>
