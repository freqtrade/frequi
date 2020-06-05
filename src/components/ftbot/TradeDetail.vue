<template>
  <b-card header="Trade detail">
    <div class="row">
      <label class="col-4">TradeId</label>
      <div class="col-8">{{ trade.trade_id }}</div>
    </div>
    <div class="row">
      <label class="col-4">Pair</label>
      <div class="col-8">{{ trade.pair }}</div>
    </div>
    <div class="row">
      <label class="col-4">Stoploss</label>
      <div class="col-8">
        {{ formatPercent(trade.stop_loss_pct / 100) }} | {{ formatPrice(trade.stop_loss) }}
      </div>
    </div>
    <div class="row">
      <label class="col-4">Initial Stoploss</label>
      <div class="col-8">
        {{ formatPercent(trade.initial_stop_loss_pct / 100) }} |
        {{ formatPrice(trade.initial_stop_loss) }}
      </div>
    </div>
    <div class="row">
      <label class="col-4">Current stoploss dist</label>
      <div class="col-8">
        {{ formatPercent(trade.current_stoploss_dist_ratio) }} |
        {{ formatPrice(trade.current_stoploss_dist) }}
      </div>
    </div>
    <div class="row">
      <label class="col-4">Open Rate</label>
      <div class="col-8">{{ trade.open_rate }}</div>
    </div>
    <div class="row">
      <label class="col-4">Close Rate</label>
      <div class="col-8">{{ trade.close_rate }}</div>
    </div>
    <div class="row">
      <label class="col-4">Min Rate</label>
      <div class="col-8">{{ trade.min_rate }}</div>
    </div>
    <div class="row">
      <label class="col-4">Max Rate</label>
      <div class="col-8">{{ trade.max_rate }}</div>
    </div>
    <div class="row">
      <label class="col-4">Open date</label>
      <div class="col-8">{{ timestampms(trade.open_timestamp) }}</div>
    </div>
    <div class="row" v-if="trade.close_date">
      <label class="col-4">Close date</label>
      <div class="col-8">{{ timestampms(trade.close_timestamp) }}</div>
    </div>
    <div class="row">
      <label class="col-4">Stoploss last updated</label>
      <div class="col-8">{{ timestampms(trade.stoploss_last_update_timestamp) }}</div>
    </div>
    <div class="row">
      <label class="col-4">Current profit</label>
      <div class="col-8">{{ trade.current_profit_abs }}</div>
    </div>
  </b-card>
</template>

<script>
import { formatPercent, formatPrice, timestampms } from '@/shared/formatters';

export default {
  name: 'TradeDetail',
  props: {
    trade: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatPercent,
    formatPrice,
    timestampms,
  },
};
</script>
<style scoped>
label {
  font-weight: bold;
}
</style>
