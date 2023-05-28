<script setup lang="ts">
import { ClosedTrade } from '@/types';
import ProfitDistributionChart from '@/components/charts/ProfitDistributionChart.vue';
import CumProfitChart from '@/components/charts/CumProfitChart.vue';
import TradesLogChart from '@/components/charts/TradesLog.vue';

defineProps({
  trades: { required: true, type: Array as () => ClosedTrade[] },
});
</script>
<template>
  <div class="text-center flex-fill mt-2 d-flex flex-column">
    <TradesLogChart :trades="trades" class="trades-log" />
    <CumProfitChart :trades="trades" class="cum-profit" :show-title="true" />
    <hr />
    <ProfitDistributionChart class="mt-3" :trades="trades" :show-title="true" />
  </div>
</template>

<style lang="scss" scoped>
.trades-log {
  height: 350px !important;
  max-height: 350px;
}
.cum-profit {
  height: 350px !important;
  max-height: 350px;
}
</style>
