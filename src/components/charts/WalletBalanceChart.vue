<script setup lang="ts">
import ECharts from 'vue-echarts';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  DataZoomComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  CalendarComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  MarkLineComponent,
} from 'echarts/components';

import type { WalletHistory } from '@/types';
import type { EChartsOption, MarkLineComponentOption } from 'echarts';

use([
  LineChart,
  CalendarComponent,
  CanvasRenderer,
  GridComponent,
  DatasetComponent,
  DataZoomComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  MarkLineComponent,
]);

const colorStore = useColorStore();
// Define Column labels here to avoid typos
const CHART_WALLET_BALANCE = 'Wallet balance';

const props = withDefaults(
  defineProps<{
    walletData: WalletHistory | null;
    showTitle?: boolean;
  }>(),
  {
    showTitle: true,
  },
);

const settingsStore = useSettingsStore();

const walletBalanceOptions: ComputedRef<EChartsOption> = computed(() => {
  if (!props.walletData) {
    return {};
  }
  const colDate = props.walletData.columns.findIndex((el) => el === '__date_ts');
  const colTotal = props.walletData.columns.findIndex((el) => el === 'total_quote');
  const starting_field = props.walletData.data[0];
  if (!starting_field) {
    return {};
  }
  const startingValue: number = starting_field[colTotal] as number;
  const captureStartTs = props.walletData.capture_start_ts ?? 0;
  const firstTimestamp = Number(starting_field[colDate]);
  const shouldShowCaptureLine =
    captureStartTs > 0 && Number.isFinite(firstTimestamp) && captureStartTs !== firstTimestamp;
  const captureLineColor = settingsStore.chartTheme === 'dark' ? '#c2c2c2' : '#4b5563';
  const markLineData: MarkLineComponentOption['data'] = [
    {
      name: 'Starting balance',
      yAxis: startingValue,
      emphasis: { disabled: true },
      label: {
        show: true,
        position: 'insideStartTop',
        formatter: 'Starting balance',
        color: captureLineColor,
      },
    },
    {
      name: 'Zero',
      label: {
        show: false,
      },
      emphasis: { disabled: true },
      lineStyle: {
        type: 'solid',
      },
      yAxis: 0,
    },
  ];
  if (shouldShowCaptureLine) {
    markLineData.push({
      name: 'Capture start',
      xAxis: captureStartTs,
      emphasis: { disabled: true },
      label: {
        show: true,
        position: 'insideEndTop',
        formatter: 'Capture start',
        color: captureLineColor,
      },
      lineStyle: {
        type: 'dotted',
        color: captureLineColor,
        width: 1,
      },
    });
  }
  const option: EChartsOption = {
    title: {
      text: 'Wallet Balance',
      left: 'center',
      show: props.showTitle,
    },
    backgroundColor: 'rgba(0, 0, 0, 0)',
    dataset: [
      { source: props.walletData.data },
      {
        transform: {
          // post capture start
          type: 'filter',
          config: { dimension: colDate, gte: captureStartTs - 1 },
        },
      },
      {
        transform: {
          // Pre capture start
          type: 'filter',
          config: { dimension: colDate, lte: captureStartTs + 1 },
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        label: {
          backgroundColor: '#6a7985',
        },
      },
      formatter: (params) => {
        const walletBalance = params[0].data[colTotal] as number;
        return `${timestampms(params[0].data[colDate])}<br />${
          params[0].marker
        }Wallet balance: ${formatPrice(walletBalance, 3)}`;
      },
    },
    grid: {
      ...echartsGridDefault,
    },
    legend: {
      data: [CHART_WALLET_BALANCE],
      right: '5%',
      show: false,
      selectedMode: false,
    },
    xAxis: [
      {
        type: 'time',
        axisLine: { onZero: false },
        axisPointer: {
          label: { show: false },
        },
        // position: 'top',
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: CHART_WALLET_BALANCE,
        splitLine: {
          show: false,
        },
        nameRotate: 90,
        nameLocation: 'middle',
        axisLabel: {
          formatter: (value) => {
            return formatPrice(value, 2);
          },
        },
        nameGap: 35,
        min: 'dataMin',
        max: 'dataMax',
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        bottom: 10,
        start: 0,
        end: 100,
        ...dataZoomPartial,
      },
    ],
    visualMap: [
      {
        show: false,
        dimension: 2,
        pieces: [
          {
            gte: startingValue,
            color: colorStore.colorProfit,
          },
          {
            gt: startingValue - 0.01,
            lt: startingValue + 0.01,
            color: colorStore.colorProfit,
          },
          {
            lt: startingValue - 0.01,
            color: colorStore.colorLoss,
          },
        ],
      },
    ],
    series: [
      {
        type: 'line',
        name: CHART_WALLET_BALANCE,
        showSymbol: false,
        color: settingsStore.chartTheme === 'dark' ? '#c2c2c2' : 'black',
        datasetIndex: 1,
        encode: {
          x: colDate,
          // open, close, low, high
          y: colTotal,
        },
        lineStyle: {
          type: 'solid',
        },
        markLine: {
          symbol: 'none',
          animation: false,
          data: markLineData,
        },
      },
      {
        type: 'line',
        name: CHART_WALLET_BALANCE,
        showSymbol: false,
        lineStyle: {
          //
          type: 'dashed',
        },
        color: settingsStore.chartTheme === 'dark' ? '#c2c2c2' : 'black',
        datasetIndex: 2,
        encode: {
          x: colDate,
          // open, close, low, high
          y: colTotal,
        },
      },
    ],
  };
  console.log('option', option);
  return option;
});
</script>

<template>
  <ECharts
    v-if="walletData?.data"
    :option="walletBalanceOptions"
    :theme="settingsStore.chartTheme"
    autoresize
  />
</template>

<style lang="css" scoped>
.echarts {
  min-height: 240px;
  height: 100%;
}
</style>
