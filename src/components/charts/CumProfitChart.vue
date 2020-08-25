<template>
  <v-chart v-if="trades.length > 0" :options="chartOptions" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import ECharts from 'vue-echarts';

import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/title';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/visualMap';
import 'echarts/lib/component/visualMapPiecewise';

import { ClosedTrade, CumProfitData } from '@/types';

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

  get cumulativeData() {
    const res: CumProfitData[] = [];
    const closedTrades = this.trades; // .filter((t) => t.close_timestamp);

    closedTrades.sort((a, b) => (a.close_timestamp > b.close_timestamp ? 1 : -1));
    let profit = 0.0;
    for (let i = 0, len = closedTrades.length; i < len; i += 1) {
      const trade = closedTrades[i];
      if (trade.close_timestamp && trade.close_profit_abs) {
        profit += trade.close_profit_abs;
        res.push({ date: trade.close_timestamp, profit, raising: trade.close_profit_abs > 0 });
      }
    }
    console.log(res[res.length - 1]);
    return res;
  }

  get chartOptions() {
    return {
      title: {
        text: 'Cumulative Profit',
        show: true,
      },
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
          nameGap: 30,
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
          animation: false,
          color: 'black',
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
}
</style>
