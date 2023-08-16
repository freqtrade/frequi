<script setup lang="ts">
import { PeriodicBreakdown } from '@/types';
import { TableField, TableItem } from 'bootstrap-vue-next';
import { computed, ref } from 'vue';

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
  <b-form-radio-group
    id="order-direction"
    v-model="periodicBreakdownPeriod"
    :options="periodicBreakdownSelections"
    name="radios-btn-default"
    size="sm"
    buttons
    style="min-width: 10em"
    button-variant="outline-primary"
  ></b-form-radio-group>
  <b-table
    small
    hover
    stacked="sm"
    :items="periodicBreakdown[periodicBreakdownPeriod] as unknown as TableItem[]"
    :fields="periodicBreakdownFields"
  >
  </b-table>
</template>
