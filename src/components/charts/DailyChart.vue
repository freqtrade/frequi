<template>
  <v-chart v-if="dailyStats.data" :options="dailyChartOptions" />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import ECharts from 'vue-echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/title';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';

import { DailyReturnValue } from '@/store/types';

// Define Column labels here to avoid typos
const CHART_ABS_PROFIT = 'Absolute profit';
const CHART_TRADE_COUNT = 'Trade Count';

@Component({
  components: {
    'v-chart': ECharts,
  },
})
export default class DailyChart extends Vue {
  @Prop({ required: true }) dailyStats!: DailyReturnValue;

  get absoluteMin() {
    return Number(
      this.dailyStats.data.reduce(
        (min, p) => (p.abs_profit < min ? p.abs_profit : min),
        this.dailyStats.data[0].abs_profit,
      ),
    );
  }

  get absoluteMax() {
    return Number(
      this.dailyStats.data.reduce(
        (max, p) => (p.abs_profit > max ? p.abs_profit : max),
        this.dailyStats.data[0].abs_profit,
      ),
    );
  }

  get dailyChartOptions() {
    return {
      title: {
        text: 'Daily profit',
        show: true,
      },
      dataset: {
        dimensions: ['date', 'abs_profit', 'trade_count'],
        source: this.dailyStats.data,
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
        data: [CHART_ABS_PROFIT, CHART_TRADE_COUNT],
        right: '5%',
      },
      xAxis: {
        type: 'category',
        inverse: true,
      },
      visualMap: {
        dimension: 1,
        seriesIndex: 0,
        show: false,
        pieces: [
          {
            max: -0.01,
            min: this.absoluteMin - 2,
            color: 'red',
          },
          {
            min: -0.00001,
            color: 'green',
          },
        ],
      },
      yAxis: [
        {
          type: 'value',
          name: CHART_ABS_PROFIT,
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
      series: [
        {
          type: 'line',
          name: CHART_ABS_PROFIT,
          color: 'black',
        },
        {
          type: 'bar',
          name: CHART_TRADE_COUNT,
          color: 'rgba(150,150,150,0.3)',
          yAxisIndex: 1,
        },
      ],
    };
  }
}
</script>

<style scoped></style>
