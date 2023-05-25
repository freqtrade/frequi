<template>
  <e-charts v-if="trades" ref="chart" autoresize manual-update :theme="settingsStore.chartTheme" />
</template>

<script setup lang="ts">
import { EChartsOption } from 'echarts';
import ECharts from 'vue-echarts';

import { BarChart, LineChart } from 'echarts/charts';
import {
  DataZoomComponent,
  DatasetComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

import { dataZoomPartial } from '@/shared/charts/chartZoom';
import { useSettingsStore } from '@/stores/settings';
import {
  ClosedTrade,
  CumProfitChartData,
  CumProfitData,
  CumProfitDataPerDate,
  Trade,
} from '@/types';
import { watchThrottled } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

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

const props = defineProps({
  trades: { required: true, type: Array as () => ClosedTrade[] },
  openTrades: { required: false, type: Array as () => Trade[], default: () => [] },
  showTitle: { default: true, type: Boolean },
  profitColumn: { default: 'profit_abs', type: String },
});
const settingsStore = useSettingsStore();
// const botList = ref<string[]>([]);
// const cumulativeData = ref<{ date: number; profit: any }[]>([]);

const chart = ref<typeof ECharts>();

const openProfit = computed<number>(() => {
  return props.openTrades.reduce((a, v) => a + v[props.profitColumn], 0);
});

const cumulativeData = computed<CumProfitChartData[]>(() => {
  const res: CumProfitData[] = [];
  const resD: CumProfitDataPerDate = {};
  const closedTrades = props.trades
    .slice()
    .sort((a, b) => (a.close_timestamp > b.close_timestamp ? 1 : -1));
  let profit = 0.0;

  for (let i = 0, len = closedTrades.length; i < len; i += 1) {
    const trade = closedTrades[i];

    if (trade.close_timestamp && trade[props.profitColumn]) {
      profit += trade[props.profitColumn];
      if (!resD[trade.close_timestamp]) {
        // New timestamp
        resD[trade.close_timestamp] = { profit, [trade.botId]: profit };
      } else {
        // Add to existing profit
        resD[trade.close_timestamp].profit += trade[props.profitColumn];
        if (resD[trade.close_timestamp][trade.botId]) {
          resD[trade.close_timestamp][trade.botId] += trade[props.profitColumn];
        } else {
          resD[trade.close_timestamp][trade.botId] = profit;
        }
      }
      res.push({ date: trade.close_timestamp, profit, [trade.botId]: profit });
    }
  }

  const valueArray: CumProfitChartData[] = Object.entries(resD).map(
    ([k, v]: [string, CumProfitData]) => {
      const obj = { date: parseInt(k, 10), profit: v.profit };
      // TODO: The below could allow "lines" per bot"
      // this.botList.forEach((botId) => {
      // obj[botId] = v[botId];
      // });
      return obj;
    },
  );

  if (props.openTrades.length > 0 && valueArray.length > 0) {
    const lastPoint = valueArray[valueArray.length - 1];
    if (lastPoint) {
      const resultWitHOpen = (lastPoint.profit ?? 0) + openProfit.value;
      valueArray.push({ date: lastPoint.date, currentProfit: lastPoint.profit });
      // Add one day to date to ensure it's showing properly
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      valueArray.push({ date: tomorrow, currentProfit: resultWitHOpen });
    }
  }
  return valueArray;
});

function updateChart(initial = false) {
  const chartOptionsLoc: EChartsOption = {
    dataset: {
      dimensions: ['date', 'profit', 'currentProfit'],
      source: cumulativeData.value,
    },

    series: [
      {
        // Keep  current-profit before profit, so the starting symbol is behind
        type: 'line',
        name: 'currentProfit',

        animation: initial,
        tooltip: {
          show: false,
        },
        lineStyle: {
          color: openProfit.value > 0 ? 'green' : 'red',
          type: 'dotted',
        },
        itemStyle: {
          color: openProfit.value > 0 ? 'green' : 'red',
        },
        encode: {
          x: 'date',
          y: 'currentProfit',
        },
      },
      {
        type: 'line',
        name: CHART_PROFIT,
        animation: initial,
        step: 'end',
        lineStyle: {
          color: settingsStore.chartTheme === 'dark' ? '#c2c2c2' : 'black',
        },
        itemStyle: {
          color: settingsStore.chartTheme === 'dark' ? '#c2c2c2' : 'black',
        },
        encode: {
          x: 'date',
          y: 'profit',
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
  //       color: settingsStore.chartTheme === 'dark' ? '#c2c2c2' : 'black',
  //     },
  //     itemStylesettingsStore.chartTheme === 'dark' ? '#c2c2c2' : 'black',
  //     },
  //     // symbol: 'none',
  //   });
  // });
  chart.value?.setOption(chartOptionsLoc, {
    replaceMerge: ['series', 'dataset'],
    noMerge: !initial,
  });
}

function initializeChart() {
  chart.value?.setOption({}, { noMerge: true });
  const chartOptionsLoc: EChartsOption = {
    title: {
      text: 'Cumulative Profit',
      show: props.showTitle,
    },
    backgroundColor: 'rgba(0, 0, 0, 0)',

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
        // xAxisIndex: [0],
        bottom: 10,
        start: 0,
        end: 100,
        ...dataZoomPartial,
      },
    ],
  };
  chart.value?.setOption(chartOptionsLoc, { noMerge: true });
  updateChart(true);
}

onMounted(() => {
  initializeChart();
});

watchThrottled(
  () => props.openTrades,
  () => {
    updateChart();
  },
  { throttle: 60 * 1000 },
);
watchThrottled(
  () => props.trades,
  () => {
    updateChart();
  },
  { throttle: 60 * 1000 },
);
</script>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
  min-height: 150px;
}
</style>
