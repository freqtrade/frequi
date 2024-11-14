<script setup lang="ts">
import type { ExitReasonResults, PairResult } from '@/types';
import { TableItem } from 'bootstrap-vue-next';

const props = defineProps({
  title: { type: String, required: true },
  results: { type: Array as PropType<(PairResult | ExitReasonResults)[]>, required: true },
  stakeCurrency: { type: String, required: true },
  stakeCurrencyDecimals: { type: Number, required: true },
  keyHeader: { type: String, default: '' },
  keyHeaders: { type: Array as PropType<string[]>, default: () => [] },
});

const tableItems = computed(
  () =>
    props.results.map((v) => {
      if (props.keyHeaders.length > 0) {
        return {
          ...v,
          key:
            typeof v['key'] === 'string' ? Array(props.keyHeaders.length).fill(v['key']) : v['key'],
        };
      }
      return v;
    }) as unknown as TableItem[],
);

const perTagReason = computed(() => {
  // TODO: should be TableField - but it's not working correctly
  const firstFields: any[] = [];
  if (props.keyHeaders.length > 0) {
    // Keys could be an array
    for (let i = 0; i < props.keyHeaders.length; i += 1) {
      firstFields.push({
        key: `key[${i}]`,
        label: props.keyHeaders[i],
        formatter: (value, _, item) =>
          Array.isArray(value) ? value[i] : value || item['exit_reason'] || 'OTHER',
      });
    }
  } else {
    firstFields.push({
      key: 'key',
      label: props.keyHeader,
      formatter: (value, _, item) => (value || item['exit_reason'] || 'OTHER') as string,
    });
  }

  return [
    ...firstFields,
    { key: 'trades', label: 'Trades' },
    {
      key: 'profit_mean',
      label: 'Avg Profit %',
      formatter: (value: number) => formatPercent(value, 2),
    },
    {
      key: 'profit_total_abs',
      label: `Tot Profit ${props.stakeCurrency}`,

      formatter: (value) => formatPrice(value as number, props.stakeCurrencyDecimals),
    },
    {
      key: 'profit_total',
      label: 'Tot Profit %',
      formatter: (value) => formatPercent(value as number, 2),
    },
    { key: 'wins', label: 'Wins' },
    { key: 'draws', label: 'Draws' },
    { key: 'losses', label: 'Losses' },
  ];
});
console.log(props.title, 'xxx', perTagReason);
</script>
<template>
  <BCard :header="title">
    <BTable small hover stacked="sm" :items="tableItems" :fields="perTagReason"> </BTable>
  </BCard>
</template>
