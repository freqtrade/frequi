<script setup lang="ts">
import ECharts from 'vue-echarts';
import type { EChartsOption } from 'echarts';

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import { MarkLineComponent, TitleComponent, TooltipComponent } from 'echarts/components';

import type { ClosedTrade } from '@/types';
import type { ProfitBin } from '@/utils/charts/binCount';

use([BarChart, CanvasRenderer, MarkLineComponent, TitleComponent, TooltipComponent]);

const props = withDefaults(
  defineProps<{
    trades: ClosedTrade[];
    showTitle?: boolean;
  }>(),
  {
    showTitle: true,
  },
);
const settingsStore = useSettingsStore();
const colorStore = useColorStore();

const binOptions = [
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '20', value: 20 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
];

const profits = computed(() =>
  props.trades
    .filter((trade) => isDefined(trade.profit_ratio))
    .map((trade) => trade.profit_ratio ?? 0),
);

const bins = computed(() => binData(profits.value, settingsStore.profitDistributionBins));

function mean(values: number[]): number | undefined {
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : undefined;
}
const avgWin = computed(() => mean(profits.value.filter((p) => p > 0)));
const avgLoss = computed(() => mean(profits.value.filter((p) => p < 0)));

function formatPct(value: number): string {
  return `${Number((value * 100).toFixed(3))}%`;
}

function binLabel(bin: ProfitBin, idx: number): string {
  const isFirst = idx === 0;
  const isLast = idx === bins.value.length - 1;
  if (bin.clipped && isFirst) return `< ${formatPct(bin.end)}`;
  if (bin.clipped && isLast) return `≥ ${formatPct(bin.start)}`;
  return `${formatPct(bin.start)} to ${formatPct(bin.end)}`;
}

const chartOptions = computed((): EChartsOption => {
  const total = profits.value.length;
  const xMin = bins.value[0]?.start ?? 0;
  const xMax = bins.value[bins.value.length - 1]?.end ?? 0;
  const markLines = [
    { name: 'Avg. loss', value: avgLoss.value, color: colorStore.colorLoss, type: 'dashed' },
    { name: 'Avg. win', value: avgWin.value, color: colorStore.colorProfit, type: 'dashed' },
    // Break-even line - only when 0 is within the visible range
    ...(xMin < 0 && xMax > 0
      ? [{ name: 'Break-even', value: 0, color: '#9ca3af', type: 'solid' }]
      : []),
  ].filter((l) => l.value !== undefined);

  return {
    title: {
      text: 'Profit distribution',
      left: 'center',
      show: props.showTitle,
    },
    backgroundColor: 'rgba(0, 0, 0, 0)',
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0]! : params;
        if (p.componentType === 'markLine') {
          return `${p.name}: <b>${formatPct(p.value as number)}</b>`;
        }
        const bin = bins.value[p.dataIndex];
        if (!bin) return '';
        const share = total > 0 ? ((bin.count / total) * 100).toFixed(1) : '0';
        return `${binLabel(bin, p.dataIndex)}<br/><b>${bin.count}</b> trades (${share}%)`;
      },
    },
    xAxis: {
      type: 'value',
      min: xMin,
      max: xMax,
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        formatter: (value: number) => formatPct(value),
        hideOverlap: true,
      },
    },
    yAxis: {
      type: 'value',
      position: 'right',
      minInterval: 1,
      splitLine: {
        lineStyle: { type: 'dashed', opacity: 0.3 },
      },
    },
    grid: {
      left: 15,
      right: 45,
      top: props.showTitle ? 45 : 40,
      bottom: 30,
    },
    series: [
      {
        type: 'bar',
        name: 'Trades',
        animation: true,
        barWidth: '75%',
        data: bins.value.map((bin) => ({
          value: [(bin.start + bin.end) / 2, bin.count],
          itemStyle: {
            color: bin.start >= 0 ? colorStore.colorProfit : colorStore.colorLoss,
            // Outlier bins are de-emphasized, as they accumulate everything beyond the clipped range
            opacity: bin.clipped ? 0.45 : 1,
            borderRadius: [2, 2, 0, 0],
          },
        })),
        markLine: {
          silent: false,
          symbol: 'none',
          label: { show: false },
          data: markLines.map((l) => ({
            name: l.name,
            xAxis: l.value,
            lineStyle: {
              color: l.color,
              type: l.type as 'dashed' | 'solid',
              width: l.type === 'solid' ? 1 : 1.5,
            },
          })),
        },
      },
    ],
  };
});
</script>

<template>
  <div class="flex flex-col h-full relative">
    <div class="grow mb-2">
      <ECharts v-if="trades" :option="chartOptions" autoresize :theme="settingsStore.chartTheme" />
    </div>
    <UFormField
      class="z-2 absolute fixed-top flex items-center gap-10 ms-2 mt-1"
      :class="{ 'mx-auto': showTitle }"
      label-for="input-bins"
      label="Bins"
      orientation="horizontal"
    >
      <USelect
        v-model="settingsStore.profitDistributionBins"
        class="min-w-20"
        :items="binOptions"
      ></USelect>
    </UFormField>
  </div>
</template>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
  min-height: 150px;
}
</style>
