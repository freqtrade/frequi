<template>
  <div class="d-flex flex-column me-2 text-start">
    <div class="fw-bold">
      {{ backtestResult.metadata.strategyName }} - {{ backtestResult.strategy.timeframe }}
    </div>
    <div class="text-small">
      TradeCount: {{ backtestResult.strategy.total_trades }} - Profit:
      {{ formatPercent(backtestResult.strategy.profit_total) }}
    </div>
    <div v-if="canUseModify" class="text-small" style="white-space: pre-wrap">
      {{ backtestResult.metadata.notes }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPercent } from '@/shared/formatters';
import { BacktestResultInMemory } from '@/types';

defineProps({
  backtestResult: {
    required: true,
    type: Object as () => BacktestResultInMemory,
  },
  selectedBacktestResultKey: { required: false, default: '', type: String },
  canUseModify: { required: false, default: false, type: Boolean },
});
</script>

<style scoped></style>
