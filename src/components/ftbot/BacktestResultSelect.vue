<script setup lang="ts">
import { BacktestResultInMemory, BacktestResultUpdate } from '@/types';

defineProps({
  backtestHistory: {
    required: true,
    type: Object as () => Record<string, BacktestResultInMemory>,
  },
  selectedBacktestResultKey: { required: false, default: '', type: String },
  canUseModify: { required: false, default: false, type: Boolean },
});
const emit = defineEmits<{
  selectionChange: [value: string];
  removeResult: [value: string];
  updateResult: [value: BacktestResultUpdate];
}>();

const setBacktestResult = (key: string) => {
  emit('selectionChange', key);
};

function confirmInput(run_id: string, result: BacktestResultInMemory) {
  result.metadata.editing = !result.metadata.editing;
  if (result.metadata.filename) {
    emit('updateResult', {
      run_id: run_id,
      notes: result.metadata.notes ?? '',
      filename: result.metadata.filename,
      strategy: result.metadata.strategyName,
    });
  }
}
</script>

<template>
  <div class="container d-flex flex-column align-items-stretch">
    <h3>Available results:</h3>
    <BListGroup class="ms-2">
      <BListGroupItem
        v-for="[key, result] in Object.entries(backtestHistory)"
        :key="key"
        button
        :active="key === selectedBacktestResultKey"
        class="d-flex justify-content-between align-items-center py-1 pe-1"
        @click="setBacktestResult(key)"
      >
        <template v-if="!result.metadata.editing">
          <BacktestResultSelectEntry :backtest-result="result" />
          <div class="d-flex">
            <BButton
              v-if="canUseModify"
              class="flex-nowrap"
              size="sm"
              title="Modify result notes."
              @click.stop="result.metadata.editing = !result.metadata.editing"
            >
              <i-mdi-pencil />
            </BButton>
            <BButton
              size="sm"
              class="flex-nowrap"
              title="Delete this Result from UI."
              @click.stop="emit('removeResult', key)"
            >
              <i-mdi-delete />
            </BButton>
          </div>
        </template>
        <template v-if="result.metadata.editing">
          <BFormTextarea v-model="result.metadata.notes" placeholder="notes" size="sm">
          </BFormTextarea>

          <BButton size="sm" title="Confirm" @click.stop="confirmInput(key, result)">
            <i-mdi-check />
          </BButton>
        </template>
      </BListGroupItem>
    </BListGroup>
  </div>
</template>
