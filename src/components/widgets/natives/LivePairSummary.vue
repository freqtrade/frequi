<script setup lang="ts">
const botStore = useBotStore();
</script>

<template>
  <PairSummary
    :pairlist="botStore.activeBot.whitelist"
    :current-locks="botStore.activeBot.activeLocks"
    :trades="botStore.activeBot.openTrades"
  />
</template>
