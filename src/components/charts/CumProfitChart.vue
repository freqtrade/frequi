<template>
  <v-chart v-if="trades" :option="chartOptions" autoresize :theme="getChartTheme" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

import ECharts from 'vue-echarts';
import { EChartsOption } from 'echarts';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import {
  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';

import { ClosedTrade, CumProfitData, CumProfitDataPerDate } from '@/types';

use([
  BarChart,
  LineChart,

  CanvasRenderer,

  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
]);

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

  botList: string[] = [];

  get cumulativeData() {
    this.botList = [];
    const res: CumProfitData[] = [];
    const resD: CumProfitDataPerDate = {};
    const closedTrades = this.trades
      .slice()
      .sort((a, b) => (a.close_timestamp > b.close_timestamp ? 1 : -1));
    let profit = 0.0;

    for (let i = 0, len = closedTrades.length; i < len; i += 1) {
      const trade = closedTrades[i];

      if (trade.close_timestamp && trade[this.profitColumn]) {
        profit += trade[this.profitColumn];
        if (!resD[trade.close_timestamp]) {
          // New timestamp
          resD[trade.close_timestamp] = { profit, [trade.botId]: profit };
        } else {
          // Add to existing profit
          resD[trade.close_timestamp].profit += trade[this.profitColumn];
          if (resD[trade.close_timestamp][trade.botId]) {
            resD[trade.close_timestamp][trade.botId] += trade[this.profitColumn];
          } else {
            resD[trade.close_timestamp][trade.botId] = profit;
          }
        }
        // console.log(trade.close_date, profit);
        res.push({ date: trade.close_timestamp, profit, [trade.botId]: profit });
        if (!this.botList.includes(trade.botId)) {
          this.botList.push(trade.botId);
        }
      }
    }
    // console.log(resD);

    return Object.entries(resD).map(([k, v]) => {
      const obj = { date: parseInt(k, 10), profit: v.profit };
      // TODO: The below could allow "lines" per bot"
      // this.botList.forEach((botId) => {
      // obj[botId] = v[botId];
      // });
      return obj;
    });
  }

  get chartOptions(): EChartsOption {
    const chartOptionsLoc: EChartsOption = {
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
    // TODO: maybe have profit lines per bot?
    // this.botList.forEach((botId: string) => {
    //   console.log('bot', botId);
    //   chartOptionsLoc.series.push({
    //     type: 'line',
    //     name: botId,
    //     animation: true,
    //     step: 'end',
    //     lineStyle: {
    //       color: this.getChartTheme === 'dark' ? '#c2c2c2' : 'black',
    //     },
    //     itemStyle: {
    //       color: this.getChartTheme === 'dark' ? '#c2c2c2' : 'black',
    //     },
    //     // symbol: 'none',
    //   });
    // });
    return chartOptionsLoc;
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
