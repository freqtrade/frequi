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
const classLabel = 'w-6/12 text-neutral-700 dark:text-neutral-400 text-sm';
</script>

<template>
  <div class="flex items-center">
    <div class="px-1 flex w-7/12 flex-col text-start justify-between">
      <span>
        <span class="me-1 font-bold">{{ trade.pair }}</span>
        <small class="text-neutral-700 dark:text-neutral-400">(#{{ trade.trade_id }})</small>
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
