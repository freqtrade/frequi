<script setup lang="ts">
import type { Trade } from '@/types';
import TradeProfit from './TradeProfit.vue';

withDefaults(
  defineProps<{
    trade: Trade;
    stakeCurrencyDecimals: number;
    showDetails?: boolean;
  }>(),
  {
    showDetails: false,
  },
);
const classLabel = 'w-6/12 text-surface-500 text-sm';
</script>

<template>
  <div class="flex items-center">
    <div class="px-1 flex w-7/12 flex-col text-start justify-between">
      <span>
        <span class="me-1 font-bold">{{ trade.pair }}</span>
        <small class="text-surface-500">(#{{ trade.trade_id }})</small>
      </span>
      <ValuePair description="Amount" :class-label="classLabel">
        {{ trade.amount }}
      </ValuePair>
      <ValuePair description="Open Rate" :class-label="classLabel">
        {{ formatPrice(trade.open_rate) }}
      </ValuePair>
      <ValuePair
        v-if="trade.is_open && trade.current_rate"
        description="Current Rate"
        :class-label="classLabel"
      >
        {{ formatPrice(trade.current_rate) }}
      </ValuePair>
      <ValuePair description="Open date" :class-label="classLabel">
        <DateTimeTZ :date="trade.open_timestamp" :date-only="true" />
      </ValuePair>
      <ValuePair v-if="trade.close_timestamp" description="Close date" :class-label="classLabel">
        <DateTimeTZ :date="trade.close_timestamp" :date-only="true" />
      </ValuePair>
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
