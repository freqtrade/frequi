<script setup lang="ts">
import type { ClosedTrade } from '@/types';
import TradeDurationChart from '../charts/TradeDurationChart.vue';

defineProps<{
  trades: ClosedTrade[];
}>();

const botStore = useBotStore();

const { state: marketChangeData } = useAsyncState(
  () => botStore.activeBot.getBacktestMarketChange(),
  null,
);
</script>
<template>
  <div class="text-center flex-fill flex flex-col h-full gap-1">
    <TradesLogChart :trades="trades" class="flex-grow-1 chart-equal-height" />
    <TradeDurationChart
      class="flex-grow-1 chart-equal-height"
      :trades="trades"
      :show-title="true"
    />
    <CumProfitChart :trades="trades" class="flex-grow-1 chart-equal-height" :show-title="true" />
    <MarketChangeChart
      v-if="marketChangeData"
      :market-change-data="marketChangeData"
      class="flex-grow-1 chart-equal-height"
    />
    <ProfitDistributionChart
      class="flex-grow-1 chart-equal-height"
      :trades="trades"
      :show-title="true"
    />
  </div>
</template>
<style scoped lang="css">
.chart-equal-height {
  min-height: 300px !important;
}
</style>
