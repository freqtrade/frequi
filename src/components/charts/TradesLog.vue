<template>
  <v-chart
    v-if="trades.length > 0"
    :option="chartOptions"
    autoresize
    :theme="settingsStore.chartTheme"
  />
</template>

<script lang="ts">
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
  VisualMapComponent,
  VisualMapPiecewiseComponent,
} from 'echarts/components';

import { ClosedTrade } from '@/types';
import { useSettingsStore } from '@/stores/settings';
import { defineComponent, computed } from 'vue';
import { timestampms } from '@/shared/formatters';

use([
  BarChart,
  LineChart,

  CanvasRenderer,

  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  VisualMapPiecewiseComponent,
]);

// Define Column labels here to avoid typos
const CHART_PROFIT = 'Profit %';
const CHART_COLOR = '#9be0a8';

export default defineComponent({
  name: 'TradesLogChart',
  components: {
    'v-chart': ECharts,
  },
  props: {
    trades: { required: true, type: Array as () => ClosedTrade[] },
    showTitle: { default: true, type: Boolean },
  },
  setup(props) {
    const settingsStore = useSettingsStore();
    const chartData = computed(() => {
      const res: (number | string)[][] = [];
      const sortedTrades = props.trades
        .slice(0)
        .sort((a, b) => (a.close_timestamp > b.close_timestamp ? 1 : -1));
      for (let i = 0, len = sortedTrades.length; i < len; i += 1) {
        const trade = sortedTrades[i];
        const entry = [
          i,
          (trade.profit_ratio * 100).toFixed(2),
          trade.pair,
          trade.botName,
          timestampms(trade.close_timestamp),
          trade.is_short === undefined || !trade.is_short ? 'Long' : 'Short',
        ];
        res.push(entry);
      }
      return res;
    });

    const chartOptions = computed((): EChartsOption => {
      // const { chartData } = this;
      // Show a maximum of 50 trades by default - allowing to zoom out further.
      const datazoomStart =
        chartData.value.length > 0 ? (1 - 50 / chartData.value.length) * 100 : 100;
      return {
        title: {
          text: 'Trades log',
          show: props.showTitle,
        },
        backgroundColor: 'rgba(0, 0, 0, 0)',
        dataset: {
          dimensions: ['date', 'profit'],
          source: chartData.value,
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const botName = params[0].data[3] ? ` | ${params[0].data[3]}` : '';
            return `${params[0].data[2]} | ${params[0].data[5]} ${botName}<br>${params[0].data[4]}<br>Profit ${params[0].data[1]} %`;
          },
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
            start: datazoomStart,
            end: 100,
          },
          {
            show: true,
            type: 'slider',
            bottom: 10,
            start: datazoomStart,
            end: 100,
          },
        ],
        visualMap: [
          {
            show: true,
            seriesIndex: 0,
            pieces: [
              {
                max: 0.0,
                color: '#f84960',
              },
              {
                min: 0.0,
                color: '#2ed191',
              },
            ],
          },
        ],
        series: [
          {
            type: 'bar',
            name: CHART_PROFIT,
            barGap: '0%',
            barCategoryGap: '0%',
            animation: false,
            label: {
              show: true,
              position: 'top',
              rotate: 90,
              offset: [7.5, 7.5],
              formatter: '{@[1]} %',
              color: settingsStore.chartTheme === 'dark' ? '#c2c2c2' : '#3c3c3c',
            },
            encode: {
              x: 0,
              y: 1,
            },

            itemStyle: {
              color: CHART_COLOR,
            },
          },
        ],
      };
    });

    return { settingsStore, chartData, chartOptions };
  },
});
</script>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
  min-height: 150px;
}
</style>
