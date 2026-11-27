<script setup lang="ts">
const botStore = useBotStore();
const pairlistStore = usePairlistConfigStore();
</script>

<template>
  <div class="flex flex-col gap-3 pt-4">
    <PairlistConfigurator />
    <PairlistResultsChart
      v-if="pairlistStore.whitelist.length > 0 && botStore.activeBot.botFeatures.chartLiveData"
      class="px-3 mb-3"
    />
  </div>
</template>
