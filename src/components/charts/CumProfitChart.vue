<script setup lang="ts">
import type { EChartsOption } from 'echarts';
import ECharts from 'vue-echarts';

import { BarChart, LineChart } from 'echarts/charts';
import {
  DataZoomComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

import type {
  ClosedTrade,
  CumProfitChartData,
  CumProfitData,
  CumProfitDataPerDate,
  Trade,
} from '@/types';
import type { ComputedRefWithControl } from '@vueuse/core';

use([
  BarChart,
  LineChart,

  CanvasRenderer,

  DatasetComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
]);

// Define Column labels here to avoid typos
const CHART_PROFIT = 'Profit';

const props = withDefaults(
  defineProps<{
    trades: ClosedTrade[];
    openTrades?: Trade[];
    showTitle?: boolean;
    profitColumn?: string;
  }>(),
  {
    openTrades: () => [],
    showTitle: true,
    profitColumn: 'profit_abs',
  },
);
const settingsStore = useSettingsStore();
const colorStore = useColorStore();
// const botList = ref<string[]>([]);

const chart = ref<InstanceType<typeof ECharts>>();

const openProfit = computed<number>(() => {
  return props.openTrades.reduce(
    (a, v) => a + (v['total_profit_abs'] ?? v[props.profitColumn] ?? 0),
    0,
  );
});

const cumulativeData = computed<CumProfitChartData[]>(() => {
  // const res: CumProfitData[] = [];
  const resD: CumProfitDataPerDate = {};
  const closedTrades = props.trades
    .slice()
    .sort((a, b) => (a.close_timestamp > b.close_timestamp ? 1 : -1));
  let profit = 0.0;
  let first = true;

  for (let i = 0, len = closedTrades.length; i < len; i += 1) {
    const trade = closedTrades[i];
    if (first) {
      // Start with chart with a 0 entry
      first = false;
      if (!resD[trade.open_timestamp]) {
        // New timestamp
        resD[trade.open_timestamp] = { profit, [trade.botId]: profit };
      } else {
        // Add to existing profit
        resD[trade.open_timestamp][trade.botId] = profit;
      }
    }

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
      // res.push({ date: trade.close_timestamp, profit, [trade.botId]: profit });
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

  if (props.openTrades.length > 0) {
    let lastProfit = 0;
    let lastDate = 0;
    if (valueArray.length > 0) {
      const lastPoint = valueArray[valueArray.length - 1];
      lastProfit = lastPoint.profit ?? 0;
      lastDate = lastPoint.date ?? 0;
    } else {
      lastDate = props.openTrades[0].open_timestamp;
    }
    const resultWitHOpen = (lastProfit ?? 0) + openProfit.value;
    valueArray.push({ date: lastDate, currentProfit: lastProfit });
    // Add one day to date to ensure it's showing properly
    const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
    valueArray.push({ date: tomorrow, currentProfit: resultWitHOpen });
  }
  return valueArray;
});

function generateChart(initial = false) {
  const { colorProfit, colorLoss } = colorStore;
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

        lineStyle: {
          color: openProfit.value > 0 ? colorProfit : colorLoss,
          type: 'dotted',
        },
        itemStyle: {
          color: openProfit.value > 0 ? colorProfit : colorLoss,
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
  return chartOptionsLoc;
}
function updateChart(initial = false) {
  const chartOptionsLoc = generateChart(initial);
  chart.value?.setOption(chartOptionsLoc, {
    replaceMerge: ['series', 'dataset'],
  });
}

const cumProfitChartOptions: ComputedRefWithControl<EChartsOption> = computedWithControl(
  () => props.trades,
  () => {
    const chartOptionsLoc: EChartsOption = {
      title: {
        text: 'Cumulative Profit',
        left: 'center',
        show: props.showTitle,
      },
      backgroundColor: 'rgba(0, 0, 0, 0)',
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const profit = params[0].data.profit;
          const currentProfit = params[0].data['currentProfit'];
          const profitText = currentProfit
            ? `Projected profit (incl. unrealized): ${formatPrice(currentProfit, 3)}`
            : `Profit: ${formatPrice(profit, 3)}`;
          return `${timestampToDateString(params[1].data.date)}<br />${
            params[1].marker
          }${profitText}`;
        },
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
        selectedMode: false,
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
        ...echartsGridDefault,
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

    const chartOptionsLoc1 = generateChart(false);
    // Merge the series and dataset, but not the rest
    chartOptionsLoc.series = chartOptionsLoc1.series;
    chartOptionsLoc.dataset = chartOptionsLoc1.dataset;
    // console.log('computed chartOptionsLoc', chartOptionsLoc);
    return chartOptionsLoc;
  },
);

onMounted(() => {
  // initializeChart();
});

watchThrottled(
  () => props.openTrades,
  () => {
    // cumProfitChartOptions.trigger();
    updateChart();
  },
  { throttle: 60 * 1000 },
);
watch(
  () => settingsStore.chartTheme,
  () => {
    cumProfitChartOptions.trigger();
  },
);
</script>

<template>
  <ECharts
    v-if="trades"
    ref="chart"
    :option="cumProfitChartOptions"
    :theme="settingsStore.chartTheme"
    autoresize
  />
</template>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
  min-height: 150px;
}
</style>
