<script setup lang="ts">
import type { BacktestResultInMemory } from '@/types';

withDefaults(
  defineProps<{
    backtestResult: BacktestResultInMemory;
    selectedBacktestResultKey?: string;
    canUseModify?: boolean;
  }>(),
  {
    selectedBacktestResultKey: '',
    canUseModify: false,
  },
);
</script>

<template>
  <div class="flex flex-col me-2 text-start min-w-0">
    <div class="font-bold truncate">
      {{ backtestResult.metadata.strategyName }} - {{ backtestResult.strategy.timeframe }}
    </div>
    <div class="text-sm font-normal">
      <span
        :class="backtestResult.strategy.profit_total >= 0 ? 'text-success' : 'text-error'"
        class="font-semibold"
        >{{ formatPercent(backtestResult.strategy.profit_total) }}</span
      >
      · {{ backtestResult.strategy.total_trades }} trades
    </div>
    <div class="text-xs text-muted">{{ backtestResult.strategy.timerange }}</div>
    <div
      v-if="canUseModify && backtestResult.metadata.notes"
      class="text-xs font-normal whitespace-pre-wrap"
    >
      {{ backtestResult.metadata.notes }}
    </div>
  </div>
</template>
