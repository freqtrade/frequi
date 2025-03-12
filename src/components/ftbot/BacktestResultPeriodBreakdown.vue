<script setup lang="ts">
import type { PeriodicBreakdown } from '@/types';

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
