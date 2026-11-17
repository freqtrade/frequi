<script setup lang="ts">
const botStore = useBotStore();

function refreshOHLCV(pair: string, columns: string[]) {
  botStore.activeBot.getPairCandles({
    pair,
    timeframe: botStore.activeBot.timeframe,
    columns,
  });
}
</script>

<template>
  <CandleChartContainer
    :available-pairs="botStore.activeBot.whitelist"
    :historic-view="false"
    :timeframe="botStore.activeBot.timeframe"
    :trades="botStore.activeBot.allTrades"
    @refresh-data="refreshOHLCV"
  />
</template>
