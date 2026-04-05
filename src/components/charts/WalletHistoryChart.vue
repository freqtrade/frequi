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
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  MarkLineComponent,
  TransformComponent,
} from 'echarts/components';

import type { WalletHistoryPerBot } from '@/types';
import type { EChartsOption, MarkLineComponentOption } from 'echarts';

use([
  LineChart,
  CanvasRenderer,
  DatasetComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  MarkLineComponent,
  TransformComponent,
]);

const colorStore = useColorStore();
// Define Column labels here to avoid typos
const CHART_WALLET_HISTORY = 'Wallet history';
const SERIES_COLORS = ['#1d4ed8', '#d931e5', '#059669', '#b45309', '#be123c', '#7c3aed', '#0f766e'];

const props = withDefaults(
  defineProps<{
    walletData: WalletHistoryPerBot;
    showTitle?: boolean;
  }>(),
  {
    showTitle: true,
  },
);

const settingsStore = useSettingsStore();
const legendSelection = ref<Record<string, boolean>>({});

const handleLegendSelectChanged = (params: { selected: Record<string, boolean> }) => {
  legendSelection.value = params.selected;
};

const hasWalletData = computed(() =>
  Object.values(props.walletData).some(
    (history) => Array.isArray(history.data) && history.data.length > 0,
  ),
);

const walletHistoryOptions: ComputedRef<EChartsOption> = computed(() => {
  const walletEntries = Object.entries(props.walletData).filter(
    ([, history]) => Array.isArray(history?.data) && history.data.length > 0,
  );

  if (walletEntries.length === 0) {
    return {};
  }

  const dataset: EChartsOption['dataset'] = [];
  const series: EChartsOption['series'] = [];
  const visualMap: EChartsOption['visualMap'] = [];
  const legendData: string[] = [];
  const selectedBotIds = walletEntries
    .map(([botId]) => botId)
    .filter((botId) => legendSelection.value[botId] ?? true);
  const useProfitLossVisualMap = selectedBotIds.length === 1;
  const selectedBotId = selectedBotIds[0];
  const captureLineColor = settingsStore.chartTheme === 'dark' ? '#c2c2c2' : '#4b5563';

  walletEntries.forEach(([botId, history], botIndex) => {
    const botName = history.botName ?? botId;
    const colDate = history.columns.findIndex((el) => el === '__date_ts');
    const colTotal = history.columns.findIndex((el) => el === 'total_quote');
    const startingField = history.data[0];
    if (!startingField || colDate < 0 || colTotal < 0) {
      return;
    }

    const startingValue = startingField[colTotal] as number;
    const captureStartTs = history.capture_start_ts ?? 0;
    const firstTimestamp = Number(startingField[colDate]);
    const shouldShowCaptureLine =
      captureStartTs > 0 && Number.isFinite(firstTimestamp) && captureStartTs !== firstTimestamp;

    const sourceDatasetIndex = dataset.length;
    const postCaptureDatasetIndex = sourceDatasetIndex + 1;
    const preCaptureDatasetIndex = sourceDatasetIndex + 2;
    const seriesStartIndex = series.length + 1; // +1 to account for the dummy series inserted below
    const seriesColor = SERIES_COLORS[botIndex % SERIES_COLORS.length];

    dataset.push(
      { source: history.data },
      {
        fromDatasetIndex: sourceDatasetIndex,
        transform: {
          // post capture start
          type: 'filter',
          config: { dimension: colDate, gte: captureStartTs - 1 },
        },
      },
      {
        fromDatasetIndex: sourceDatasetIndex,
        transform: {
          // pre capture start
          type: 'filter',
          config: { dimension: colDate, lte: captureStartTs + 1 },
        },
      },
    );

    const markLineData: MarkLineComponentOption['data'] = [
      {
        name: 'Starting balance',
        yAxis: startingValue,
        emphasis: { disabled: true },
        label: {
          show: true,
          position: 'insideStartTop',
          formatter: `Starting balance ${botName}`,
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
          formatter: `Capture start ${botName}`,
          color: captureLineColor,
        },
        lineStyle: {
          type: 'dotted',
          color: captureLineColor,
          width: 1,
        },
      });
    }

    legendData.push(botName);

    if (useProfitLossVisualMap && selectedBotId === botId) {
      visualMap.push({
        show: false,
        seriesIndex: [seriesStartIndex, seriesStartIndex + 1],
        dimension: colTotal,
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
      });
    }

    series.push(
      { type: 'line', data: [] },
      // Empty, hidden series to stabilize data zoom
      // https://github.com/apache/echarts/issues/21245
      {
        type: 'line',
        name: botName,
        showSymbol: false,
        color: seriesColor,
        datasetIndex: postCaptureDatasetIndex,
        encode: {
          x: colDate,
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
        name: botName,
        showSymbol: false,
        lineStyle: {
          type: 'dashed',
        },
        color: seriesColor,
        datasetIndex: preCaptureDatasetIndex,
        encode: {
          x: colDate,
          y: colTotal,
        },
      },
    );
  });

  if (series.length === 0) {
    return {};
  }

  const option: EChartsOption = {
    title: {
      text: 'Wallet Balance',
      left: 'center',
      show: props.showTitle,
    },
    backgroundColor: 'rgba(0, 0, 0, 0)',
    dataset,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        label: {
          backgroundColor: '#6a7985',
        },
      },
      formatter: (params) => {
        const seriesParams = Array.isArray(params) ? params : [params];
        if (seriesParams.length === 0) {
          return '';
        }

        const firstPoint = seriesParams[0] as { data: unknown[]; encode?: { x?: number[] } };
        const xIdx = firstPoint.encode?.x?.[0] ?? 0;
        const label = `${timestampms(Number(firstPoint.data[xIdx]))}`;
        const lines = seriesParams.map((seriesPoint) => {
          const typedPoint = seriesPoint as {
            marker: string;
            seriesName: string;
            data: unknown[];
            encode?: { y?: number[] };
          };
          const yIdx = typedPoint.encode?.y?.[0] ?? 0;
          const walletHistory = Number(typedPoint.data[yIdx]);
          return `${typedPoint.marker}${typedPoint.seriesName}: ${formatPrice(walletHistory, 3)}`;
        });

        return `${label}<br />${lines.join('<br />')}`;
      },
    },
    grid: {
      ...echartsGridDefault,
    },
    legend: {
      data: legendData,
      right: '5%',
      top: 0,
      show: walletEntries.length > 1,
      selectedMode: true,
      selected: legendSelection.value,
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
        name: CHART_WALLET_HISTORY,
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
    visualMap,
    series,
  };
  console.log('Wallet balance chart options', option);
  return option;
});
</script>

<template>
  <ECharts
    v-if="hasWalletData"
    :option="walletHistoryOptions"
    :theme="settingsStore.chartTheme"
    @legendselectchanged="handleLegendSelectChanged"
    autoresize
  />
  <div v-else class="flex flex-col items-center justify-center h-full gap-2">
    <p class="text-gray-500">No historic wallet data available.</p>
    <p class="text-gray-500 text-sm">
      You may need to update your freqtrade version to have historic wallet balance data available.
    </p>
  </div>
</template>

<style lang="css" scoped>
.echarts {
  min-height: 150px;
  height: 100%;
  width: 100%;
}
</style>
