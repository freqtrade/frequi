<script setup lang="ts">
import type { PeriodicBreakdown } from '@/types';

defineProps({
  periodicBreakdown: {
    type: Object as () => PeriodicBreakdown,
    required: true,
  },
});
const periodicBreakdownSelections = [
  { value: 'day', text: 'Days' },
  { value: 'week', text: 'Weeks' },
  { value: 'month', text: 'Months' },
];

const periodicBreakdownPeriod = ref<string>('month');
</script>

<template>
  <SelectButton
    v-model="periodicBreakdownPeriod"
    :options="periodicBreakdownSelections"
    size="small"
    class="m-2"
    option-label="text"
    option-value="value"
  ></SelectButton>
  <DataTable size="small" stacked="sm" :value="periodicBreakdown[periodicBreakdownPeriod]">
    <Column field="date" header="Date"></Column>
    <Column field="wins" header="Wins"></Column>
    <Column field="draws" header="Draws"></Column>
    <Column field="loses" header="Losses"></Column>
  </DataTable>
</template>
