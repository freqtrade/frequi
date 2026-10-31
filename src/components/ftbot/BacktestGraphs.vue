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
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-1">
      <TradeDurationChart class="chart-equal-height min-w-0" :trades="trades" :show-title="true" />
      <ProfitDistributionChart
        class="chart-equal-height min-w-0"
        :trades="trades"
        :show-title="true"
      />
    </div>
    <CumProfitChart :trades="trades" class="chart-equal-height" :show-title="true" />
    <WalletHistoryChart v-if="walletData" :wallet-data="walletData" class="chart-equal-height" />
    <MarketChangeChart
      v-if="marketChangeData"
      :market-change-data="marketChangeData"
      class="chart-equal-height"
    />
  </div>
</template>
<style scoped lang="css">
.chart-equal-height {
  height: 300px;
}
</style>
