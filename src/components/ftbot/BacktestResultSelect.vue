<script setup lang="ts">
import type { BacktestResultInMemory, BacktestResultUpdate } from '@/types';

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
  <div class="flex flex-col items-stretch">
    <h3 class="font-bold text-2xl">Available results:</h3>
    <div
      class="ms-2 divide-y border-x border-surface-500 rounded border-y divide-solid divide-y-3 divide-surface-500"
    >
      <div
        v-for="[key, result] in Object.entries(backtestHistory)"
        :key="key"
        button
        :active="key === selectedBacktestResultKey"
        class="flex justify-between items-center py-1 pe-1"
        @click="setBacktestResult(key)"
      >
        <template v-if="!result.metadata.editing">
          <BacktestResultSelectEntry :backtest-result="result" :can-use-modify="canUseModify" />
          <div class="flex">
            <Button
              v-if="canUseModify"
              class="flex-nowrap"
              size="small"
              severity="secondary"
              title="Modify result notes."
              @click.stop="result.metadata.editing = !result.metadata.editing"
            >
              <template #icon>
                <i-mdi-pencil />
              </template>
            </Button>
            <Button
              size="small"
              class="flex-nowrap"
              severity="secondary"
              title="Delete this Result from UI."
              @click.stop="emit('removeResult', key)"
            >
              <template #icon>
                <i-mdi-delete />
              </template>
            </Button>
          </div>
        </template>
        <template v-if="result.metadata.editing">
          <Textarea v-model="result.metadata.notes" placeholder="notes" size="small"> </Textarea>

          <Button size="small" title="Confirm" @click.stop="confirmInput(key, result)">
            <template #icon>
              <i-mdi-check />
            </template>
          </Button>
        </template>
      </div>
    </div>
  </div>
</template>
