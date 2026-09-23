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

const { state: walletData } = useAsyncState(
  () => botStore.activeBot.getBacktestWalletChange(),
  null,
);
</script>
<template>
  <div class="text-center flex flex-col gap-1">
    <TradesLogChart :trades="trades" class="chart-equal-height" />
    <TradeDurationChart class="chart-equal-height" :trades="trades" :show-title="true" />
    <CumProfitChart :trades="trades" class="chart-equal-height" :show-title="true" />
    <WalletHistoryChart v-if="walletData" :wallet-data="walletData" class="chart-equal-height" />
    <MarketChangeChart
      v-if="marketChangeData"
      :market-change-data="marketChangeData"
      class="chart-equal-height"
    />
    <ProfitDistributionChart class="chart-equal-height" :trades="trades" :show-title="true" />
  </div>
</template>
<style scoped lang="css">
.chart-equal-height {
  height: 300px;
}
</style>
