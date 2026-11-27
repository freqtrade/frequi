<script setup lang="ts">
const botStore = useBotStore();
const pairlistStore = usePairlistConfigStore();
</script>

<template>
  <div class="flex flex-col gap-3 pt-4">
    <PairlistConfigurator />
    <template
      v-if="pairlistStore.whitelist.length > 0 && botStore.activeBot.botFeatures.chartLiveData"
    >
      <USeparator label="Pairlist-Chart" />
      <PairlistResultsChart class="px-3 pb-3" />
    </template>
  </div>
</template>
