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
        <template v-if="!result.metadata.editing">
          <div class="d-flex flex-column me-2">
            <div class="fw-bold">
              {{ result.metadata.strategyName }} - {{ result.strategy.timeframe }}
            </div>
            <div class="text-small">
              TradeCount: {{ result.strategy.total_trades }} - Profit:
              {{ formatPercent(result.strategy.profit_total) }}
            </div>
            <div class="text-small">
              {{ result.metadata.notes }}
            </div>
          </div>
          <b-button
            size="sm"
            title="Modify"
            @click.stop="result.metadata.editing = !result.metadata.editing"
          >
            <i-mdi-pencil />
          </b-button>
          <b-button size="sm" title="Delete this Result." @click.stop="emit('removeResult', key)">
            <i-mdi-delete />
          </b-button>
        </template>
        <template v-if="result.metadata.editing">
          <b-form-input v-model="result.metadata.notes" size="sm"> </b-form-input>

          <b-button
            size="sm"
            title="Confirm"
            @click.stop="result.metadata.editing = !result.metadata.editing"
          >
            <i-mdi-check />
          </b-button>
        </template>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script setup lang="ts">
import { formatPercent } from '@/shared/formatters';
import { BacktestResultInMemory } from '@/types';
import { ref } from 'vue';

const props = defineProps({
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
