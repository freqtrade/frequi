<script setup lang="ts">
import ECharts from 'vue-echarts';
import { GaugeChart } from 'echarts/charts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import type { KpiDef } from '@/widgets/types';
import { formatValue } from '@/widgets/helpers';

use([GaugeChart, CanvasRenderer]);

const props = withDefaults(
  defineProps<{
    tiles: KpiDef[];
    values: Record<string, number | string | null>;
    variant?: 'dial' | 'bar';
    stake?: string;
  }>(),
  { variant: 'dial', stake: '' },
);

const colorStore = useColorStore();
const settingsStore = useSettingsStore();

const gauges = computed(() =>
  props.tiles
    .filter((t) => typeof props.values[t.key] === 'number' || props.values[t.key] === null)
    .map((t) => {
      const value = (props.values[t.key] as number | null) ?? 0;
      const rawMax = typeof t.max === 'function' ? t.max(props.values) : t.max;
      // Without a known maximum, scale to the value so the gauge is still readable.
      const max = rawMax && rawMax > 0 ? rawMax : Math.max(1, Math.abs(value) * 1.25);
      const ratio = Math.max(0, Math.min(1, value / max));
      const good = t.lowerIsBetter ? ratio < 0.5 : ratio >= 0.5;
      return {
        tile: t,
        value,
        max,
        ratio,
        color: good ? colorStore.colorProfit : colorStore.colorLoss,
        label: formatValue(value, t.format, props.stake),
        maxLabel: formatValue(max, t.format, props.stake),
      };
    }),
);

function dialOption(g: (typeof gauges.value)[number]): EChartsOption {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 1,
        radius: '95%',
        center: ['50%', '58%'],
        progress: { show: true, width: 10, roundCap: true, itemStyle: { color: g.color } },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 10,
            color: [
              [1, settingsStore.isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'],
            ],
          },
        },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, 0],
          fontSize: 18,
          fontWeight: 600,
          color: g.color,
          formatter: () => g.label,
        },
        data: [{ value: g.ratio }],
      },
    ],
  };
}
</script>

<template>
  <div
    v-if="variant === 'dial'"
    class="grid h-full gap-2 p-2"
    style="grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr))"
  >
    <div
      v-for="g in gauges"
      :key="g.tile.key"
      class="flex min-h-32 flex-col rounded-xl border border-(--ft-glass-border) bg-white/3 p-2"
    >
      <div class="truncate text-center text-xs font-medium text-muted">{{ g.tile.label }}</div>
      <ECharts :option="dialOption(g)" autoresize class="min-h-0 grow" />
    </div>
  </div>
  <div v-else class="flex flex-col gap-3 p-3">
    <div v-for="g in gauges" :key="g.tile.key">
      <div class="mb-1 flex items-baseline justify-between text-sm">
        <span class="text-muted">{{ g.tile.label }}</span>
        <span class="tabular-nums">
          <b :style="{ color: g.color }">{{ g.label }}</b>
          <span class="text-muted"> / {{ g.maxLabel }}</span>
        </span>
      </div>
      <div
        class="h-2.5 overflow-hidden rounded-full bg-white/8"
        role="progressbar"
        :aria-label="g.tile.label"
        :aria-valuenow="Math.round(g.ratio * 100)"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          class="h-full rounded-full transition-[width] duration-500"
          :style="{ width: `${g.ratio * 100}%`, backgroundColor: g.color }"
        />
      </div>
    </div>
  </div>
  <p v-if="gauges.length === 0" class="p-4 text-sm text-muted">No values to show.</p>
</template>
