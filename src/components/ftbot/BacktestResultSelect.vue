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

/** Keys of results selected for comparison */
const compareKeys = defineModel<string[]>('compareKeys', { default: () => [] });

function toggleCompare(key: string, value: boolean | 'indeterminate') {
  compareKeys.value =
    value === true ? [...compareKeys.value, key] : compareKeys.value.filter((k) => k !== key);
}

const emit = defineEmits<{
  selectionChange: [value: string];
  removeResult: [value: string];
  updateResult: [value: BacktestResultUpdate];
}>();

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
  <ul class="flex flex-col gap-1">
    <li
      v-for="[key, result] in Object.entries(backtestHistory)"
      :key="key"
      :class="
        key === selectedBacktestResultKey
          ? 'border-primary bg-primary/10'
          : 'border-default hover:bg-elevated'
      "
      class="flex justify-between items-start gap-1 p-2 border rounded-md cursor-pointer"
      @click="$emit('selectionChange', key)"
    >
      <template v-if="!result.metadata.editing">
        <BacktestResultSelectEntry :backtest-result="result" :can-use-modify="canUseModify" />
        <div class="flex flex-col items-center gap-1 shrink-0" @click.stop>
          <UTooltip text="Select for comparison">
            <UCheckbox
              :model-value="compareKeys.includes(key)"
              :aria-label="`Compare ${result.metadata.strategyName}`"
              class="p-1"
              @update:model-value="toggleCompare(key, $event)"
            />
          </UTooltip>
          <UButton
            v-if="canUseModify"
            size="xs"
            color="neutral"
            variant="ghost"
            title="Modify result notes."
            icon="i-mdi-pencil"
            @click="result.metadata.editing = !result.metadata.editing"
          />
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            title="Unload this Result from UI."
            icon="i-mdi-close"
            @click="$emit('removeResult', key)"
          />
        </div>
      </template>
      <div v-else class="flex items-start gap-1 w-full" @click.stop>
        <UTextarea
          v-model="result.metadata.notes"
          placeholder="notes"
          size="sm"
          autoresize
          class="grow"
        />
        <UButton
          size="sm"
          title="Confirm"
          variant="solid"
          color="neutral"
          icon="i-mdi-check"
          @click="confirmInput(key, result)"
        />
      </div>
    </li>
  </ul>
</template>
