<template>
  <v-chart v-if="trades.length > 0" :option="chartOptions" autoresize :theme="getChartTheme" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import ECharts from 'vue-echarts';
import { EChartsOption } from 'echarts';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';

import { ClosedTrade, CumProfitData } from '@/types';

use([BarChart, LineChart, CanvasRenderer, TitleComponent, TooltipComponent, LegendComponent]);

// Define Column labels here to avoid typos
const CHART_PROFIT = 'Profit';
const CHART_TRADE_COUNT = 'Trade Count';

@Component({
  components: {
    'v-chart': ECharts,
  },
})
export default class CumProfitChart extends Vue {
  @Prop({ required: true }) trades!: ClosedTrade[];

  @Prop({ default: true, type: Boolean }) showTitle!: boolean;

  @Prop({ default: 'close_profit_abs' }) profitColumn!: string;

  @Getter getChartTheme!: string;

  get cumulativeData() {
    const res: CumProfitData[] = [];
    const closedTrades = this.trades
      .slice()
      .sort((a, b) => (a.close_timestamp > b.close_timestamp ? 1 : -1));
    let profit = 0.0;
    for (let i = 0, len = closedTrades.length; i < len; i += 1) {
      const trade = closedTrades[i];
      if (trade.close_timestamp && trade[this.profitColumn]) {
        profit += trade[this.profitColumn];
        res.push({ date: trade.close_timestamp, profit });
      }
    }
    return res;
  }

  get chartOptions(): EChartsOption {
    return {
      title: {
        text: 'Cumulative Profit',
        show: this.showTitle,
      },
      backgroundColor: 'rgba(0, 0, 0, 0)',
      dataset: {
        dimensions: ['date', 'profit'],
        source: this.cumulativeData,
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
      useUTC: false,
      xAxis: {
        type: 'time',
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
          nameGap: 40,
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
        bottom: 80,
      },
      dataZoom: [
        {
          type: 'inside',
          // xAxisIndex: [0],
          start: 0,
          end: 100,
        },
        {
          show: true,
          // xAxisIndex: [0],
          type: 'slider',
          bottom: 10,
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          type: 'line',
          name: CHART_PROFIT,
          animation: true,
          step: 'end',
          lineStyle: {
            color: this.getChartTheme === 'dark' ? '#c2c2c2' : 'black',
          },
          itemStyle: {
            color: this.getChartTheme === 'dark' ? '#c2c2c2' : 'black',
          },
          // symbol: 'none',
        },
      ],
    };
  }
}
</script>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
  min-height: 150px;
}
</style>
