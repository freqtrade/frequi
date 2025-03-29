<script setup lang="ts">
import type { Trade } from '@/types';
import TradeProfit from './TradeProfit.vue';

defineProps({
  trade: {
    type: Object as () => Trade,
    required: true,
  },
  stakeCurrencyDecimals: {
    type: Number,
    required: true,
  },
  showDetails: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="flex">
    <div class="px-1 flex w-full flex-row text-start justify-between items-center">
      <span>
        <span class="me-1 font-bold">{{ trade.pair }}</span>
        <small class="text-surface-500">(#{{ trade.trade_id }})</small>
      </span>
      <small>
        <DateTimeTZ :date="trade.open_timestamp" :date-only="true" />
      </small>
    </div>
    <TradeProfit class="w-5/12" :trade="trade" />
  </div>
</template>

<style lang="css" scoped>
.card-body {
  padding: 0 0.2em;
}

.btn-xs {
  padding: 0.1rem 0.25rem;
  font-size: 0.75rem;
}
</style>
