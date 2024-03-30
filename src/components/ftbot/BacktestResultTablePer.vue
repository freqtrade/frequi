<script setup lang="ts">
import { formatPercent, formatPrice } from '@/shared/formatters';
import type { ExitReasonResults, PairResult } from '@/types';
import { TableItem } from 'bootstrap-vue-next';

const props = defineProps({
  title: { type: String, required: true },
  results: { type: Array as PropType<(PairResult | ExitReasonResults)[]>, required: true },
  stakeCurrency: { type: String, required: true },
  stakeCurrencyDecimals: { type: Number, required: true },
  keyHeader: { type: String, default: 'Tag' },
});

const tableItems = computed(() => props.results as unknown as TableItem[]);

const perTagReason = computed(() => {
  return [
    {
      key: 'key',
      label: props.keyHeader,
      formatter: (value, _, item) => value || item['exit_reason'] || 'OTHER',
    },
    { key: 'trades', label: 'Entries' },
    {
      key: 'profit_mean',
      label: 'Avg Profit %',
      formatter: (value) => formatPercent(value, 2),
    },
    {
      key: 'profit_total_abs',
      label: `Tot Profit ${props.stakeCurrency}`,

      formatter: (value) => formatPrice(value, props.stakeCurrencyDecimals),
    },
    {
      key: 'profit_total',
      label: 'Tot Profit %',
      formatter: (value) => formatPercent(value, 2),
    },
    { key: 'wins', label: 'Wins' },
    { key: 'draws', label: 'Draws' },
    { key: 'losses', label: 'Losses' },
  ];
});
</script>
<template>
  <b-card :header="title">
    <b-table small hover stacked="sm" :items="tableItems" :fields="perTagReason"> </b-table>
  </b-card>
</template>
