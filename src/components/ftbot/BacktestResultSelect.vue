<template>
  <div class="container d-flex flex-column align-items-center">
    <h3>Available results:</h3>
    <b-list-group class="ms-2">
      <b-list-group-item
        v-for="[key, result] in Object.entries(backtestHistory)"
        :key="key"
        button
        :active="key === selectedBacktestResultKey"
        class="d-flex justify-content-between align-items-center py-1 pe-1"
        @click="setBacktestResult(key)"
      >
        {{ key }} {{ result.strategy.total_trades }}
        {{ formatPercent(result.strategy.profit_total) }}
        <b-button
          class="ms-2"
          size="sm"
          title="Delete this Result."
          @click.stop="emit('removeResult', key)"
        >
          <i-mdi-delete />
        </b-button>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script setup lang="ts">
import { formatPercent } from '@/shared/formatters';
import { BacktestResultInMemory } from '@/types';

defineProps({
  backtestHistory: {
    required: true,
    type: Object as () => Record<string, BacktestResultInMemory>,
  },
  selectedBacktestResultKey: { required: false, default: '', type: String },
});
const emit = defineEmits<{
  selectionChange: [value: string];
  removeResult: [value: string];
}>();

const setBacktestResult = (key: string) => {
  emit('selectionChange', key);
};
</script>

<style scoped></style>
