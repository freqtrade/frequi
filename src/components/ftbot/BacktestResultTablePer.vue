<script setup lang="ts">
import type { ExitReasonResults, PairResult } from '@/types';

const props = defineProps({
  title: { type: String, required: true },
  results: { type: Array as PropType<(PairResult | ExitReasonResults)[]>, required: true },
  stakeCurrency: { type: String, required: true },
  stakeCurrencyDecimals: { type: Number, required: true },
  keyHeader: { type: String, default: '' },
  keyHeaders: { type: Array as PropType<string[]>, default: () => [] },
});

const tableItems = computed(() =>
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
    formatter: (value: string, item: any) => string;
  }[] = [];
  if (props.keyHeaders.length > 0) {
    // Keys could be an array
    for (let i = 0; i < props.keyHeaders.length; i += 1) {
      firstFields.push({
        key: `key[${i}]`,
        label: props.keyHeaders[i],
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
</script>
<template>
  <DraggableContainer :header="title">
    <DataTable size="small" hover stacked="sm" :value="tableItems">
      <Column v-for="col in perTagReason" :key="col.key" :field="col.key" :header="col.label">
        <template #body="{ data }">
          {{ col.formatter(data['key'], data) }}
        </template>
      </Column>
      <Column field="trades" header="Trades"></Column>
      <Column field="profit_mean" header="Avg Profit %">
        <template #body="{ data, field }">
          {{ formatPercent(data[field], 2) }}
        </template>
      </Column>
      <Column field="profit_total_abs" :header="`Tot Profit ${props.stakeCurrency}`">
        <template #body="{ data, field }">
          {{ formatPrice(data[field], props.stakeCurrencyDecimals) }}
        </template>
      </Column>
      <Column field="profit_total" header="Tot Profit %">
        <template #body="{ data, field }">
          {{ formatPercent(data[field], 2) }}
        </template>
      </Column>
      <Column field="wins" header="Wins"></Column>
      <Column field="draws" header="Draws"></Column>
      <Column field="losses" header="Losses"></Column>
    </DataTable>
  </DraggableContainer>
</template>
