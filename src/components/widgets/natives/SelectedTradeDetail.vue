<script setup lang="ts">
const botStore = useBotStore();
</script>

<template>
  <TradeDetail
    v-if="botStore.activeBot?.detailTradeId && botStore.activeBot.tradeDetail"
    :trade="botStore.activeBot.tradeDetail"
    :stake-currency="botStore.activeBot.stakeCurrency"
  />
  <div v-else class="flex h-full items-center justify-center gap-2 p-4 text-sm text-muted">
    <UIcon name="i-mdi-cursor-default-click-outline" class="size-5" />
    Select a trade in a trade list to see its details.
  </div>
</template>
