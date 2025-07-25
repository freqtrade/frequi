<script setup lang="ts">
import type { Trade } from '@/types';

const colorStore = useColorStore();

defineProps<{
  trade: Trade;
  stakeCurrency: string;
}>();
</script>

<template>
  <div class="text-start grid grid-cols-1 lg:grid-cols-2 gap-4 px-2">
    <div class="">
      <h5 class="detail-header">General</h5>
      <ValuePair description="Trade Id">{{ trade.trade_id }}</ValuePair>
      <ValuePair description="Pair">{{ trade.pair }}</ValuePair>

      <ValuePair description="Open date">{{ timestampms(trade.open_timestamp) }}</ValuePair>
      <ValuePair v-if="trade.enter_tag" description="Entry tag">{{ trade.enter_tag }}</ValuePair>
      <ValuePair v-if="trade.is_open" description="Stake"
        >{{ formatPriceCurrency(trade.stake_amount, stakeCurrency) }}
        {{ trade.leverage && trade.leverage !== 1 ? `(${trade.leverage}x)` : '' }}</ValuePair
      >
      <ValuePair v-if="!trade.is_open" description="Total Stake"
        >{{ formatPriceCurrency(trade.max_stake_amount ?? trade.stake_amount, stakeCurrency) }}
        {{ trade.leverage && trade.leverage !== 1 ? `(${trade.leverage}x)` : '' }}</ValuePair
      >
      <ValuePair description="Amount">{{ trade.amount }}</ValuePair>
      <ValuePair description="Open Rate">{{ formatPrice(trade.open_rate) }}</ValuePair>
      <ValuePair v-if="trade.is_open && trade.current_rate" description="Current Rate">{{
        formatPrice(trade.current_rate)
      }}</ValuePair>
      <ValuePair v-if="!trade.is_open && trade.close_rate" description="Close Rate">{{
        formatPrice(trade.close_rate)
      }}</ValuePair>

      <ValuePair v-if="trade.close_timestamp" description="Close date">{{
        timestampms(trade.close_timestamp)
      }}</ValuePair>
      <ValuePair
        v-if="trade.is_open && trade.realized_profit && !trade.total_profit_abs"
        description="Realized Profit"
      >
        <TradeProfit class="ms-2" :trade="trade" mode="realized" />
      </ValuePair>
      <ValuePair v-if="trade.is_open && trade.total_profit_abs" description="Total Profit">
        <TradeProfit class="ms-2" :trade="trade" mode="total" />
      </ValuePair>
      <ValuePair
        v-if="trade.profit_ratio && trade.profit_abs"
        :description="`${trade.is_open ? 'Current Profit' : 'Close Profit'}`"
      >
        <TradeProfit class="ms-2" :trade="trade" />
      </ValuePair>
      <details>
        <summary>Details</summary>
        <ValuePair v-if="trade.min_rate" description="Min Rate">{{
          formatPrice(trade.min_rate)
        }}</ValuePair>
        <ValuePair v-if="trade.max_rate" description="Max Rate">{{
          formatPrice(trade.max_rate)
        }}</ValuePair>
        <ValuePair description="Open-Fees">
          {{ trade.fee_open_cost }} {{ trade.quote_currency }}
          <span v-if="trade.quote_currency !== trade.fee_open_currency">
            (in {{ trade.fee_open_currency }})
          </span>
          ({{ formatPercent(trade.fee_open) }})
        </ValuePair>
        <ValuePair v-if="trade.fee_close_cost && trade.fee_close" description="Fees close">
          {{ trade.fee_close_cost }} {{ trade.fee_close_currency }} ({{
            formatPercent(trade.fee_close)
          }})
        </ValuePair>
      </details>
    </div>
    <div class="mt-2 lg:mt-0">
      <h5 class="detail-header">Stoploss</h5>
      <ValuePair description="Stoploss">
        {{ formatPercent(trade.stop_loss_pct / 100) }} |
        {{ formatPrice(trade.stop_loss_abs) }}
      </ValuePair>
      <ValuePair
        v-if="trade.initial_stop_loss_pct && trade.initial_stop_loss_abs"
        description="Initial Stoploss"
      >
        {{ formatPercent(trade.initial_stop_loss_pct / 100) }} |
        {{ formatPrice(trade.initial_stop_loss_abs) }}
      </ValuePair>
      <ValuePair
        v-if="trade.is_open && trade.stoploss_current_dist_ratio && trade.stoploss_current_dist"
        description="Current stoploss dist"
      >
        {{ formatPercent(trade.stoploss_current_dist_ratio) }} |
        {{ formatPrice(trade.stoploss_current_dist) }}
      </ValuePair>
      <ValuePair v-if="trade.stoploss_last_update_timestamp" description="Stoploss last updated">
        {{ timestampms(trade.stoploss_last_update_timestamp) }}
      </ValuePair>
      <div v-if="trade.trading_mode !== undefined && trade.trading_mode !== 'spot'">
        <h5 class="detail-header">Futures/Margin</h5>
        <ValuePair description="Direction">
          {{ trade.is_short ? 'short' : 'long' }} - {{ trade.leverage }}x
        </ValuePair>
        <ValuePair v-if="trade.funding_fees !== undefined" description="Funding fees">
          {{ formatPrice(trade.funding_fees) }}
        </ValuePair>
        <ValuePair v-if="trade.interest_rate !== undefined" description="Interest rate">
          {{ formatPrice(trade.interest_rate) }}
        </ValuePair>
        <ValuePair v-if="trade.liquidation_price !== undefined" description="Liquidation Price">
          {{ formatPrice(trade.liquidation_price) }}
        </ValuePair>
      </div>
      <details v-if="trade.orders">
        <summary>Orders {{ trade.orders.length > 1 ? `[${trade.orders.length}]` : '' }}</summary>
        <div
          v-for="(order, key) in trade.orders"
          :key="key"
          class="flex items-center gap-1 2"
          :title="`${order.ft_order_side} ${order.order_type} order for ${formatPriceCurrency(
            order.amount,
            trade.base_currency ?? '',
          )} at ${formatPriceCurrency(
            order.safe_price,
            trade.quote_currency ?? '',
          )}, filled ${formatPrice(order.filled)}`"
        >
          (#{{ key + 1 }})
          <i-mdi-triangle
            v-if="order.ft_order_side === 'buy'"
            class="me-1 color-up"
            style="font-size: 0.6rem"
          />
          <i-mdi-triangle-down v-else class="me-1 color-down" style="font-size: 0.6rem" />
          <DateTimeTZ v-if="order.order_timestamp" :date="order.order_timestamp" show-timezone />
          <b class="ms-1" :class="order.ft_order_side === 'buy' ? 'color-up' : 'color-down'">{{
            order.ft_order_side
          }}</b>
          for <b>{{ formatPrice(order.safe_price) }}</b> |
          <span v-if="order.remaining && order.remaining !== 0" title="remaining"
            >{{ formatPrice(order.remaining, 8) }} /
          </span>
          <span title="Filled">{{ formatPrice(order.filled ?? 0, 8) }}</span>
          <template v-if="order.ft_order_tag"> | {{ order.ft_order_tag ?? '' }}</template>
        </div>
      </details>
    </div>
  </div>
</template>
<style scoped>
@reference '../../styles/tailwind.css';

.detail-header {
  @apply text-xl font-semibold border-b pb-1 w-full block mb-1;
}
.color-up {
  color: v-bind('colorStore.colorUp');
}

.color-down {
  color: v-bind('colorStore.colorDown');
}
</style>
