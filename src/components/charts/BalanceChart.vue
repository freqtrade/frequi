<template>
  <v-chart
    v-if="balance.currencies"
    :option="balanceChartOptions"
    :theme="getChartTheme"
    autoresize
  />
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

import { BalanceInterface } from '@/types';

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
  @Prop({ required: true }) balance!: BalanceInterface;

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
        source: this.balance.currencies,
      },
      tooltip: {
        trigger: 'item',
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
            x: 'est_stake',
            itemName: ['currency'],
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
