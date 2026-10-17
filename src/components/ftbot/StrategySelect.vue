<script setup lang="ts">
import type { StrategyResult } from '@/types';

withDefaults(
  defineProps<{
    showDetails?: boolean;
  }>(),
  {
    showDetails: false,
  },
);

const strategy = defineModel<string>();
const strategyDetails = defineModel<StrategyResult | undefined>('details');

const botStore = useBotStore();

const strategyCode = computed((): string => strategyDetails.value?.code ?? '');

watch(
  strategy,
  async (newStrategy, oldStrategy) => {
    if (!newStrategy) {
      strategyDetails.value = undefined;
      return;
    }
    if (newStrategy === oldStrategy && strategyDetails.value?.strategy === newStrategy) {
      return;
    }

    strategyDetails.value = undefined;

    try {
      const strategyResult = await botStore.activeBot.getStrategy(newStrategy);
      // ensure the response corresponds to the currently selected strategy
      if (strategy.value === newStrategy && strategyResult.strategy === newStrategy) {
        strategyDetails.value = strategyResult;
      }
    } catch {
      if (strategy.value === newStrategy) {
        strategyDetails.value = undefined;
      }
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (botStore.activeBot.strategyList.length === 0) {
    botStore.activeBot.getStrategyList();
  }
});
</script>

<template>
  <div>
    <div class="w-full flex">
      <USelectMenu
        id="strategy-select"
        v-model="strategy"
        filter
        class="w-full"
        :items="botStore.activeBot.strategyList"
      >
      </USelectMenu>
      <div class="ms-1">
        <UButton
          color="neutral"
          variant="outline"
          icon="mdi:refresh"
          @click="botStore.activeBot.getStrategyList()"
        />
      </div>
    </div>

    <textarea
      v-if="showDetails && strategyDetails"
      :value="strategyCode"
      class="w-full h-full"
      readonly
    ></textarea>
  </div>
</template>
