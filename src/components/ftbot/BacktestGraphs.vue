<script setup lang="ts">
import type { ClosedTrade } from '@/types';

defineProps({
  trades: { required: true, type: Array as () => ClosedTrade[] },
});
</script>
<template>
  <div class="text-center flex-fill d-flex flex-column h-100">
    <TradesLogChart :trades="trades" class="flex-grow-1" />
    <CumProfitChart :trades="trades" class="flex-grow-1" :show-title="true" />
    <ProfitDistributionChart class="flex-grow-1" :trades="trades" :show-title="true" />
  </div>
</template>
