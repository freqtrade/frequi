<template>
  <v-chart v-if="trades" :option="chartOptions" autoresize :theme="settingsStore.chartTheme" />
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import ECharts from 'vue-echarts';
import { EChartsOption } from 'echarts';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import {
  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';

import { ClosedTrade } from '@/types';
import { binData } from '@/shared/charts/binCount';
import { useSettingsStore } from '@/stores/settings';

use([
  BarChart,

  CanvasRenderer,

  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
]);

// Define Column labels here to avoid typos
const CHART_PROFIT = 'Trade count';

export default defineComponent({
  name: 'ProfitDistributionChart',
  components: {
    'v-chart': ECharts,
  },
  props: {
    trades: { required: true, type: Array as () => ClosedTrade[] },
    showTitle: { default: true, type: Boolean },
  },
  setup(props) {
    console.log('setup start');
    const settingsStore = useSettingsStore();
    // registerTransform(ecStat.transform.histogram);
    const profits = props.trades.map((trade) => trade.profit_ratio);
    // console.log(profits);
    // const data = [[]];

    const bins = 10;
    const data = binData(profits, bins);
    console.log(profits, data);

    const chartOptions = computed((): EChartsOption => {
      const chartOptionsLoc: EChartsOption = {
        title: {
          text: 'Cumulative Profit',
          show: props.showTitle,
        },
        backgroundColor: 'rgba(0, 0, 0, 0)',
        dataset: {
          source: data,
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
        xAxis: {
          type: 'value',
          name: 'Profit %',
          nameLocation: 'middle',
          nameGap: 25,
        },
        yAxis: [
          {
            type: 'log',
            name: CHART_PROFIT,
            splitLine: {
              show: false,
            },
            nameRotate: 90,
            nameLocation: 'middle',
            nameGap: 35,
          },
        ],
        // grid: {
        // bottom: 80,
        // },

        series: [
          {
            type: 'bar',
            name: CHART_PROFIT,
            animation: true,
            encode: {
              x: 'x0',
              y: 'y0',
            },

            // symbol: 'none',
          },
        ],
      };
      return chartOptionsLoc;
    });
    console.log(chartOptions);
    return { settingsStore, chartOptions };
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
