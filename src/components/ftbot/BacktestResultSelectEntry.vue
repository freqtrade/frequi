<script setup lang="ts">
import type { BacktestResultInMemory } from '@/types';

defineProps({
  backtestResult: {
    required: true,
    type: Object as () => BacktestResultInMemory,
  },
  selectedBacktestResultKey: { required: false, default: '', type: String },
  canUseModify: { required: false, default: false, type: Boolean },
});
</script>

<template>
  <div class="flex flex-col me-2 text-start">
    <div class="font-bold">
      {{ backtestResult.metadata.strategyName }} - {{ backtestResult.strategy.timeframe }}
    </div>
    <div class="text-sm">
      TradeCount: {{ backtestResult.strategy.total_trades }} - Profit:
      {{ formatPercent(backtestResult.strategy.profit_total) }}
    </div>
    <div v-if="canUseModify" class="text-sm" style="white-space: pre-wrap">
      {{ backtestResult.metadata.notes }}
    </div>
  </div>
</template>
