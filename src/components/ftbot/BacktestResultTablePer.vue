<script setup lang="ts">
import type { ExitReasonResults, PairResult } from '@/types';

type ResultsType = PairResult | ExitReasonResults;
type ResultsTypeWithKey = ResultsType & { key?: string | string[] };
const props = withDefaults(
  defineProps<{
    title: string;
    results: ResultsType[];
    stakeCurrency: string;
    stakeCurrencyDecimals: number;
    keyHeader?: string;
    keyHeaders?: string[];
  }>(),
  {
    keyHeader: '',
    keyHeaders: () => [],
  },
);

const tableItems = computed<ResultsTypeWithKey[]>(() =>
  props.results.map((v) => {
    if (props.keyHeaders.length > 0) {
      return {
        ...v,
        key:
          typeof v['key'] === 'string' ? Array(props.keyHeaders.length).fill(v['key']) : v['key'],
      };
    }
    return v;
  }),
);

const perTagReason = computed(() => {
  const firstFields: {
    key: string;
    label: string;
    formatter: (value: string, item: ResultsTypeWithKey) => string;
  }[] = [];
  if (props.keyHeaders.length > 0) {
    // Keys could be an array
    for (const [i, header] of props.keyHeaders.entries()) {
      firstFields.push({
        key: `key[${i}]`,
        label: header,
        formatter: (value, item) =>
          Array.isArray(value) ? value[i] : value || item['exit_reason'] || 'OTHER',
      });
    }
  } else {
    firstFields.push({
      key: 'key',
      label: props.keyHeader,
      formatter: (value, item) => (value || item['exit_reason'] || 'OTHER') as string,
    });
  }
  return firstFields;
});

const settingsStore = useSettingsStore();

const metrics = computed(() =>
  availableBacktestMetrics.value.filter(
    (metric) =>
      metric.field !== 'key' && settingsStore.backtestAdditionalMetrics.includes(metric.field),
  ),
);

const tableColumns = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cols: any[] = [];

  // Dynamic first columns (key/tags)
  perTagReason.value.forEach((col, i) => {
    cols.push({
      id: `key_${i}`,
      header: col.label,
      cell: ({ row }) => col.formatter(row.original['key'] as string, row.original),
    });
  });

  // Fixed metric columns
  cols.push({ accessorKey: 'trades', header: 'Trades' });
  cols.push({
    id: 'profit_mean',
    header: 'Avg Profit %',
    cell: ({ row }) => formatPercent(row.original.profit_mean, 2),
  });
  cols.push({
    id: 'profit_total_abs',
    header: `Tot Profit ${props.stakeCurrency}`,
    cell: ({ row }) => formatPrice(row.original.profit_total_abs, props.stakeCurrencyDecimals),
  });
  cols.push({
    id: 'profit_total',
    header: 'Tot Profit %',
    cell: ({ row }) => formatPercent(row.original.profit_total, 2),
  });
  cols.push({ accessorKey: 'wins', header: 'Wins' });
  cols.push({ accessorKey: 'draws', header: 'Draws' });
  cols.push({ accessorKey: 'losses', header: 'Losses' });

  // Dynamic additional metric columns
  metrics.value.forEach((col) => {
    cols.push({
      accessorKey: col.field,
      header: col.header,
      cell: ({ row }) =>
        col.is_ratio
          ? formatPercent(row.original[col.field as keyof ResultsTypeWithKey] as number, 2)
          : formatPrice(row.original[col.field as keyof ResultsTypeWithKey] as number, 2),
    });
  });

  return cols;
});
</script>
<template>
  <DraggableContainer>
    <template #header>
      <div class="flex flex-row w-full justify-between items-center text-">
        {{ title }}
        <div>
          Shown metrics:
          <USelectMenu
            multiple
            id="backtestMetrics"
            v-model="settingsStore.backtestAdditionalMetrics"
            :items="availableBacktestMetrics"
            label-key="header"
            value-key="field"
          />
        </div>
      </div>
    </template>
    <UTable :data="tableItems" :columns="tableColumns" />
  </DraggableContainer>
</template>
