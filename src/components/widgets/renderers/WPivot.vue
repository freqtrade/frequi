<script setup lang="ts">
import type { PivotResult } from '@/widgets/analytics';
import type { ValueFormat } from '@/widgets/types';
import { formatValue } from '@/widgets/helpers';

const props = withDefaults(
  defineProps<{
    result: PivotResult;
    rowLabel: string;
    format?: ValueFormat;
    /** Profit-like values get green/red cells; counts get accent cells */
    diverging?: boolean;
    stake?: string;
  }>(),
  { format: 'number', diverging: true, stake: '' },
);

const maxAbs = computed(() => {
  let m = 0;
  Object.values(props.result.cells).forEach((row) =>
    Object.values(row).forEach((v) => {
      if (v !== null) m = Math.max(m, Math.abs(v));
    }),
  );
  return m || 1;
});

function cellStyle(v: number | null) {
  if (v === null) return undefined;
  const pct = Math.round((Math.abs(v) / maxAbs.value) * 45);
  const color = !props.diverging
    ? 'var(--color-brand-400)'
    : v < 0
      ? 'var(--color-loss)'
      : 'var(--color-profit)';
  return { backgroundColor: `color-mix(in oklab, ${color} ${pct}%, transparent)` };
}

const fmt = (v: number | null) => formatValue(v, props.format, props.stake);
</script>

<template>
  <div class="h-full overflow-auto">
    <table class="w-full text-sm">
      <thead class="sticky top-0 z-10 bg-(--ui-bg)/90 backdrop-blur">
        <tr class="border-b border-(--ft-glass-border)">
          <th
            scope="col"
            class="sticky left-0 bg-(--ui-bg)/90 px-3 text-left text-xs font-semibold text-muted uppercase"
          >
            {{ rowLabel }}
          </th>
          <th
            v-for="c in result.colKeys"
            :key="c"
            scope="col"
            class="px-2 text-right text-xs font-semibold whitespace-nowrap text-muted"
          >
            {{ c }}
          </th>
          <th scope="col" class="px-3 text-right text-xs font-semibold text-muted uppercase">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in result.rowKeys" :key="r" class="border-b border-(--ft-glass-border)">
          <th
            scope="row"
            class="sticky left-0 bg-(--ui-bg)/80 px-3 text-left font-medium whitespace-nowrap"
          >
            {{ r }}
          </th>
          <td
            v-for="c in result.colKeys"
            :key="c"
            class="px-2 text-right whitespace-nowrap tabular-nums"
            :style="cellStyle(result.cells[r]?.[c] ?? null)"
          >
            {{ result.cells[r]?.[c] === null ? '' : fmt(result.cells[r]?.[c] ?? null) }}
          </td>
          <td class="px-3 text-right font-semibold whitespace-nowrap tabular-nums">
            {{ fmt(result.rowTotals[r] ?? null) }}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="font-semibold">
          <th scope="row" class="sticky left-0 bg-(--ui-bg)/80 px-3 text-left">Total</th>
          <td
            v-for="c in result.colKeys"
            :key="c"
            class="px-2 text-right whitespace-nowrap tabular-nums"
          >
            {{ fmt(result.colTotals[c] ?? null) }}
          </td>
          <td class="px-3 text-right whitespace-nowrap tabular-nums">{{ fmt(result.total) }}</td>
        </tr>
      </tfoot>
    </table>
    <p v-if="result.rowKeys.length === 0" class="py-6 text-center text-sm text-muted">
      No trades for this selection.
    </p>
  </div>
</template>
