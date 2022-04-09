<template>
  <div class="container text-left">
    <div class="row">
      <div class="col-lg-5">
        <h5 class="detail-header">General</h5>
        <ValuePair description="TradeId">{{ trade.trade_id }}</ValuePair>
        <ValuePair description="Pair">{{ trade.pair }}</ValuePair>

        <ValuePair description="Open date">{{ timestampms(trade.open_timestamp) }}</ValuePair>
        <ValuePair v-if="trade.buy_tag" description="Entry tag">{{ trade.buy_tag }}</ValuePair>
        <ValuePair description="Stake"
          >{{ formatPriceCurrency(trade.stake_amount, stakeCurrency) }}
          {{ trade.leverage ? `(${trade.leverage}x)` : '' }}</ValuePair
        >
        <ValuePair description="Amount">{{ trade.amount }}</ValuePair>
        <ValuePair description="Open Rate">{{ formatPrice(trade.open_rate) }}</ValuePair>
        <ValuePair v-if="!trade.is_open && trade.close_rate" description="Close Rate">{{
          formatPrice(trade.close_rate)
        }}</ValuePair>

        <ValuePair v-if="trade.close_timestamp" description="Close date">{{
          timestampms(trade.close_timestamp)
        }}</ValuePair>
        <ValuePair
          v-if="trade.profit_ratio && trade.profit_abs"
          :description="`${trade.is_open ? 'Current Profit' : 'Close Profit'}`"
        >
          <trade-profit class="ml-2" :trade="trade" />
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
            {{ trade.fee_open_cost }} {{ trade.fee_open_currency }} ({{
              formatPercent(trade.fee_open)
            }})
          </ValuePair>
          <ValuePair v-if="trade.fee_close_cost && trade.fee_close" description="Fees close">
            {{ trade.fee_close_cost }} {{ trade.fee_close_currency }} ({{
              formatPercent(trade.fee_close)
            }})
          </ValuePair>
        </details>
      </div>
      <div class="mt-2 mt-lg-0 col-lg-7">
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
        <div v-if="trade.trading_mode !== undefined && trade.trading_mode !== 'SPOT'">
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
        </div>
        <details v-if="trade.orders">
          <summary>Orders</summary>
          <div v-for="(order, key) in trade.orders" :key="key">
            <span>
              (#{{ key + 1 }}) <DateTimeTZ :date="order.order_timestamp" show-timezone />
              <b class="ml-1">{{ order.ft_order_side }}</b> for
              <b>{{ formatPrice(order.safe_price) }}</b> | {{ order.remaining }} /
              {{ order.filled }}</span
            >
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { formatPercent, formatPriceCurrency, formatPrice, timestampms } from '@/shared/formatters';
import ValuePair from '@/components/general/ValuePair.vue';
import TradeProfit from '@/components/ftbot/TradeProfit.vue';
import DateTimeTZ from '@/components/general/DateTimeTZ.vue';
import { Trade } from '@/types';

@Component({
  components: { ValuePair, TradeProfit, DateTimeTZ },
})
export default class TradeDetail extends Vue {
  @Prop({ type: Object, required: true }) trade!: Trade;

  @Prop({ type: String, required: true }) stakeCurrency!: string;

  timestampms = timestampms;

  formatPercent = formatPercent;

  formatPrice = formatPrice;

  formatPriceCurrency = formatPriceCurrency;
}
</script>
<style scoped>
.detail-header {
  border-bottom: 1px solid;
  padding-bottom: 5px;
  width: 100%;
  display: block;
}
</style>
