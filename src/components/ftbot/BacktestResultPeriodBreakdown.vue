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
    { key: 'wins', label: 'Wins' },
    { key: 'draws', label: 'Draws' },
    { key: 'loses', label: 'Losses' },
  ];
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
