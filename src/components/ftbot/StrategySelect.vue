<script setup lang="ts">
withDefaults(
  defineProps<{
    showDetails?: boolean;
  }>(),
  {
    showDetails: false,
  },
);

const strategy = defineModel<string>();

const botStore = useBotStore();

const strategyCode = computed((): string => botStore.activeBot.strategy?.code ?? '');

watch(strategy, (newStrategy, oldStrategy) => {
  if (!newStrategy || newStrategy === oldStrategy) return;
  botStore.activeBot.getStrategy(newStrategy);
});

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
      v-if="showDetails && botStore.activeBot.strategy"
      v-model="strategyCode"
      class="w-full h-full"
    ></textarea>
  </div>
</template>
