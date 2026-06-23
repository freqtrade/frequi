<script setup lang="ts">
import type { RecursiveResult } from '@/types';

const props = defineProps<{
  result: RecursiveResult;
}>();

// Indicators that show a difference for at least one startup candle count.
const indicators = computed(() => Object.keys(props.result.results));
// Column headers - the candle counts reported by the backend.
const candleColumns = computed(() => props.result.startup_candles ?? []);

const tableColumns = computed(() => [
  { accessorKey: 'indicator', header: 'Indicator', meta: { class: { td: 'font-mono' } } },
  ...candleColumns.value.map((c) => ({
    accessorKey: String(c),
    header: String(c),
  })),
]);

const tableData = computed(() =>
  indicators.value.map((ind) => ({ indicator: ind, ...props.result.results[ind] })),
);
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap gap-x-6 gap-y-1">
      <span><span class="font-bold">Strategy:</span> {{ result.strategy }}</span>
      <span>
        <span class="font-bold">Recommended startup candle count:</span>
        {{ result.strategy_scc }}
      </span>
    </div>

    <UAlert
      v-if="indicators.length === 0"
      color="success"
      class="py-2"
      icon="i-mdi-check-circle"
      title="No recursive formula issues detected"
      description="None of the strategy indicators changed when varying the startup candle count."
    />

    <div v-else class="overflow-x-auto">
      <UAlert
        color="warning"
        class="mb-2 py-2"
        icon="i-mdi-alert"
        :title="`${indicators.length} indicator(s) affected by startup candle count`"
        description="The values below show the percentage difference compared to the analysis
          with the most startup candles. Non-zero values indicate a recursive formula issue."
      />
      <UTable :data="tableData" :columns="tableColumns">
        <template v-for="c in candleColumns" #[`${c}-cell`]="{ row }" :key="c">
          {{ formatPercent(row.original[String(c)], 3, '-') }}
        </template>
      </UTable>
    </div>
  </div>
</template>
