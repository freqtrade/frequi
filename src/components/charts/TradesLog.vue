<template>
  <v-chart v-if="trades.length > 0" :options="chartOptions" autoresize :theme="getChartTheme" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import ECharts from 'vue-echarts';
import { EChartOption } from 'echarts';

import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/title';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/dataZoom';
import 'echarts/lib/component/visualMap';
import 'echarts/lib/component/visualMapPiecewise';

import { ClosedTrade } from '@/types';

// Define Column labels here to avoid typos
const CHART_PROFIT = 'Profit %';
const CHART_COLOR = '#9be0a8';

@Component({
  components: {
    'v-chart': ECharts,
  },
})
export default class TradesLogChart extends Vue {
  @Prop({ required: true }) trades!: ClosedTrade[];

  @Getter getChartTheme!: string;

  get chartData() {
    const res: number[][] = [];
    const sortedTrades = this.trades
      .slice(0)
      .sort((a, b) => (a.close_timestamp > b.close_timestamp ? 1 : -1));
    for (let i = 0, len = sortedTrades.length; i < len; i += 1) {
      const trade = sortedTrades[i];
      const entry = [i, (trade.profit_ratio * 100).toFixed(2)];
      res.push(entry);
    }

    return res;
  }

  get chartOptions(): EChartOption {
    return {
      title: {
        text: 'Trades log',
        show: true,
      },
      dataset: {
        dimensions: ['date', 'profit'],
        source: this.chartData,
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
      xAxis: {
        type: 'value',
        show: false,
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
          step: 'start',
          animation: false,
          label: {
            show: true,
            position: 'top',
            formatter: '{@[1]} %',
            color: this.getChartTheme === 'dark' ? '#c2c2c2' : '#3c3c3c',
          },
          encode: {
            x: 0,
            y: 1,
          },

          areaStyle: {
            // color: CHART_COLOR,
          },
          itemStyle: {
            color: CHART_COLOR,
          },
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
