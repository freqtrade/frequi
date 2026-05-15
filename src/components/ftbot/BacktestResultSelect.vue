<script setup lang="ts">
import type { BacktestResultInMemory, BacktestResultUpdate } from '@/types';

withDefaults(
  defineProps<{
    backtestHistory: Record<string, BacktestResultInMemory>;
    selectedBacktestResultKey?: string;
    canUseModify?: boolean;
  }>(),
  {
    selectedBacktestResultKey: '',
    canUseModify: false,
  },
);

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
    <ul
      class="ms-2 divide-y border-x border-neutral-500 rounded-sm border-y divide-solid divide-neutral-500"
    >
      <li
        v-for="[key, result] in Object.entries(backtestHistory)"
        :key="key"
        button
        :class="{
          'bg-primary dark:border-primary text-white': key === selectedBacktestResultKey,
        }"
        class="flex justify-between items-center py-1 px-1"
        @click="setBacktestResult(key)"
      >
        <template v-if="!result.metadata.editing">
          <BacktestResultSelectEntry :backtest-result="result" :can-use-modify="canUseModify" />
          <div class="flex">
            <UButton
              v-if="canUseModify"
              class="flex-nowrap"
              size="sm"
              color="neutral"
              title="Modify result notes."
              icon="mdi:pencil"
              @click.stop="result.metadata.editing = !result.metadata.editing"
            />
            <UButton
              size="sm"
              class="flex-nowrap"
              color="neutral"
              title="Delete this Result from UI."
              icon="mdi:delete"
              @click.stop="$emit('removeResult', key)"
            />
          </div>
        </template>
        <template v-if="result.metadata.editing">
          <UTextarea v-model="result.metadata.notes" placeholder="notes" size="sm"> </UTextarea>
          <UButton
            size="sm"
            title="Confirm"
            variant="solid"
            color="neutral"
            icon="mdi:check"
            @click.stop="confirmInput(key, result)"
          />
        </template>
      </li>
    </ul>
  </div>
</template>
