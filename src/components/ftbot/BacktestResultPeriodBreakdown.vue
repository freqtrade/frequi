<script setup lang="ts">
import type { PeriodicBreakdown } from '@/types';
import type { TableField, TableItem } from 'bootstrap-vue-next';

const props = defineProps<{
  periodicBreakdown: PeriodicBreakdown;
}>();

const periodicBreakdownSelections = computed(() => {
  const res = [
    { value: 'day', text: 'Days' },
    { value: 'week', text: 'Weeks' },
    { value: 'month', text: 'Months' },
  ];
  if (props.periodicBreakdown.year) {
    res.push({ value: 'year', text: 'Years' });
  }

  return res;
});

const periodicBreakdownPeriod = ref<string>('month');

const periodicBreakdownFields = computed<TableField[]>(() => {
  return [
    { key: 'date', label: 'Date' },
    { key: 'trades', label: 'Trades' },
    { key: 'profit_abs', label: 'Total Profit', formatter: (v: number) => formatPrice(v, 3) },
    {
      key: 'profit_factor',
      label: 'Profit Factor',
      formatter: (v: number) => (v !== undefined ? v.toFixed(2) : 'N/A'),
    },
    { key: 'wins', label: 'Wins' },
    { key: 'draws', label: 'Draws' },
    {
      key: props.periodicBreakdown[periodicBreakdownPeriod.value][0].loses ? 'loses' : 'losses',
      label: 'Losses',
    },
    {
      key: 'wins',
      label: 'Win Rate',
      formatter: (v: number, k, item) =>
        ((v / (v + item.draws + (item.loses ?? item.losses))) * 100).toFixed(2) + '%',
    },
  ] as TableField[];
});
</script>

<template>
  <BFormRadioGroup
    id="order-direction"
    v-model="periodicBreakdownPeriod"
    :options="periodicBreakdownSelections"
    name="radios-btn-default"
    size="sm"
    buttons
    style="min-width: 10em"
    button-variant="outline-primary"
  ></BFormRadioGroup>
  <BTable
    small
    hover
    stacked="sm"
    :items="periodicBreakdown[periodicBreakdownPeriod] as unknown as TableItem[]"
    :fields="periodicBreakdownFields"
  >
  </BTable>
</template>
