<script setup lang="ts">
import type { KpiDef } from '@/widgets/types';
import { formatValue, toneColor } from '@/widgets/helpers';

const props = withDefaults(
  defineProps<{
    tiles: KpiDef[];
    values: Record<string, number | string | null>;
    /** Values of the previous period, to show deltas */
    previous?: Record<string, number | string | null>;
    spark?: number[];
    stake?: string;
    variant?: 'tiles' | 'big';
  }>(),
  { previous: () => ({}), spark: () => [], stake: '', variant: 'tiles' },
);

/** Small inline SVG sparkline - cheaper than a chart instance per tile row. */
const sparkPath = computed(() => {
  const pts = props.spark.slice(-120);
  if (pts.length < 2) return '';
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  return pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * 100;
      const y = 28 - ((v - min) / range) * 26;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
});

const sparkUp = computed(() => {
  const s = props.spark;
  return s.length < 2 || s[s.length - 1]! >= s[0]!;
});

function delta(tile: KpiDef) {
  const cur = props.values[tile.key];
  const prev = props.previous[tile.key];
  if (typeof cur !== 'number' || typeof prev !== 'number') return undefined;
  const diff = cur - prev;
  // Percentages compare in points; everything else as a change of the value.
  const text =
    tile.format === 'percent'
      ? `${diff >= 0 ? '+' : ''}${(diff * 100).toFixed(2)} pp`
      : `${diff >= 0 ? '+' : ''}${formatValue(diff, tile.format, props.stake)}`;
  const good = tile.lowerIsBetter ? diff <= 0 : diff >= 0;
  return {
    text,
    icon: diff === 0 ? 'i-mdi-minus' : diff > 0 ? 'i-mdi-arrow-up' : 'i-mdi-arrow-down',
    color: diff === 0 ? undefined : good ? 'var(--color-profit)' : 'var(--color-loss)',
  };
}
</script>

<template>
  <div
    class="grid h-full gap-2 overflow-auto p-2"
    :class="variant === 'big' ? 'auto-rows-[minmax(6rem,1fr)]' : 'auto-rows-[minmax(4rem,1fr)]'"
    :style="{
      gridTemplateColumns: `repeat(auto-fill, minmax(${variant === 'big' ? '13rem' : '9.5rem'}, 1fr))`,
    }"
  >
    <div
      v-for="tile in tiles"
      :key="tile.key"
      class="flex min-w-0 flex-col justify-center rounded-xl border border-(--ft-glass-border) bg-white/3 px-3 py-2"
    >
      <div class="flex items-center gap-1.5 text-xs font-medium text-muted">
        <UIcon v-if="tile.icon" :name="tile.icon" class="size-4 shrink-0" />
        <span class="truncate">{{ tile.label }}</span>
      </div>
      <div
        class="truncate font-semibold tabular-nums"
        :class="variant === 'big' ? 'text-3xl' : 'text-xl'"
        :style="tile.tone ? { color: toneColor(values[tile.key]) } : undefined"
        :title="formatValue(values[tile.key], tile.format, stake)"
      >
        {{ formatValue(values[tile.key], tile.format, stake) }}
      </div>
      <div
        v-if="delta(tile)"
        class="flex items-center gap-1 text-xs tabular-nums"
        :style="{ color: delta(tile)!.color }"
      >
        <UIcon :name="delta(tile)!.icon" class="size-3.5" />
        {{ delta(tile)!.text }}
        <span class="text-muted">vs previous</span>
      </div>
    </div>
    <!-- Trend gets its own tile, so it never draws over the numbers -->
    <div
      v-if="sparkPath"
      class="flex min-w-0 flex-col justify-center rounded-xl border border-(--ft-glass-border) bg-white/3 px-3 py-2"
    >
      <div class="flex items-center gap-1.5 text-xs font-medium text-muted">
        <UIcon name="i-mdi-chart-line-variant" class="size-4 shrink-0" />
        <span class="truncate">Profit trend</span>
      </div>
      <svg class="h-7 w-full" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
        <path
          :d="sparkPath"
          fill="none"
          :stroke="sparkUp ? 'var(--color-profit)' : 'var(--color-loss)'"
          stroke-width="1.5"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </div>
  </div>
</template>
