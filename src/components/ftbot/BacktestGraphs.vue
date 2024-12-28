<script setup lang="ts">
import type { ClosedTrade } from '@/types';

defineProps({
  trades: { required: true, type: Array as () => ClosedTrade[] },
});

const botStore = useBotStore();

const { state: marketChangeData } = useAsyncState(
  () => botStore.activeBot.getBacktestMarketChange(),
  null,
);
</script>
<template>
  <div class="text-center flex-fill d-flex flex-column h-100 gap-1">
    <TradesLogChart :trades="trades" class="flex-grow-1" />
    <CumProfitChart :trades="trades" class="flex-grow-1" :show-title="true" />
    <MarketChangeChart
      v-if="marketChangeData"
      :market-change-data="marketChangeData"
      class="flex-grow-1"
    />
    <ProfitDistributionChart class="flex-grow-1" :trades="trades" :show-title="true" />
  </div>
</template>
