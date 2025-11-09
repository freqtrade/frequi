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
  if (props.periodicBreakdown.weekday) {
    res.push({ value: 'weekday', text: 'Weekday' });
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
    :allow-empty="false"
    class="m-2"
    option-label="text"
    option-value="value"
  ></SelectButton>
  <DataTable size="small" stacked="sm" :value="periodicBreakdown[periodicBreakdownPeriod]">
    <Column field="date" header="Date"></Column>
    <Column field="trades" header="Trades">
      <template #body="{ data, field }">
        {{ data[field] ?? 'N/A' }}
      </template>
    </Column>
    <Column field="profit_abs" header="Total Profit" :body="formatPrice">
      <template #body="{ data, field }">
        {{ formatNumber(data[field], 2) }}
      </template>
    </Column>
    <Column field="profit_factor" header="Profit Factor">
      <template #body="{ data, field }">
        {{ formatPrice(data[field], 2) }}
      </template>
    </Column>
    <Column field="wins" header="Wins"></Column>
    <Column field="draws" header="Draws"></Column>
    <Column field="losses" header="Losses">
      <template #body="{ data }">
        {{ data.loses ?? data.losses ?? 'N/A' }}
      </template>
    </Column>
    <Column field="wins" header="Win Rate">
      <template #body="{ data }">
        {{ formatPercent(data.wins / (data.wins + data.draws + (data.loses ?? data.losses)), 2) }}
      </template>
    </Column>
  </DataTable>
</template>
