<script setup lang="ts">
const botStore = useBotStore();

onMounted(() => {
  botStore.allGetDaily({ timescale: 30 });
  botStore.activeBot?.getOpenTrades();
  botStore.activeBot?.getProfit();
});
</script>

<template>
  <WidgetBoard board-id="dashboard" />
</template>
