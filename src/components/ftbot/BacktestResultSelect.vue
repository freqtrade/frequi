<template>
  <div class="container d-flex flex-column align-items-center">
    <h3>Available results:</h3>
    <b-list-group class="ms-2">
      <b-list-group-item
        v-for="[key, strat] in Object.entries(backtestHistory)"
        :key="key"
        button
        :active="key === selectedBacktestResultKey"
        class="d-flex justify-content-between align-items-center py-1"
        @click="setBacktestResult(key)"
      >
        {{ key }} {{ strat.total_trades }} {{ formatPercent(strat.profit_total) }}
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script setup lang="ts">
import { formatPercent } from '@/shared/formatters';
import { StrategyBacktestResult } from '@/types';

defineProps({
  backtestHistory: {
    required: true,
    type: Object as () => Record<string, StrategyBacktestResult>,
  },
  selectedBacktestResultKey: { required: false, default: '', type: String },
});
const emit = defineEmits(['selectionChange']);
const setBacktestResult = (key) => {
  emit('selectionChange', key);
};
</script>

<style scoped></style>
