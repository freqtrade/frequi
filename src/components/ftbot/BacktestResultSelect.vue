<template>
  <div class="container d-flex flex-column align-items-center">
    <h3>Available results:</h3>
    <b-list-group class="ml-2">
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

<script lang="ts">
import { formatPercent } from '@/shared/formatters';
import { StrategyBacktestResult } from '@/types';

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BacktestResultSelect',
  props: {
    backtestHistory: {
      required: true,
      type: Object as () => Record<string, StrategyBacktestResult>,
    },
    selectedBacktestResultKey: { required: false, default: '', type: String },
  },
  emits: ['selectionChange'],
  setup(_, { emit }) {
    const setBacktestResult = (key) => {
      emit('selectionChange', key);
    };
    return {
      formatPercent,
      setBacktestResult,
    };
  },
});
</script>

<style scoped></style>
