<template>
  <div class="container-flex row mr-4">
    <div class="container col-4">
      <div class="row">
        <label class="col-4">TradeId</label>
        <div class="col-8">{{ trade.trade_id }}</div>
      </div>
      <div class="row">
        <label class="col-4">Stoploss</label>
        <div class="col-8">
          {{ formatPercent(trade.stop_loss_pct / 100) }} | {{ trade.stop_loss.toFixed(8) }}
        </div>
      </div>
      <div class="row">
        <label class="col-4">Initial Stoploss</label>
        <div class="col-8">
          {{ formatPercent(trade.initial_stop_loss_pct / 100) }} |
          {{ trade.initial_stop_loss.toFixed(8) }}
        </div>
      </div>
    </div>
    <div class="container col-4">
      <div class="row">
        <label class="col-4">Open Rate</label>
        <div class="col-8">{{ trade.open_rate }}</div>
      </div>
      <div class="row">
        <label class="col-4">Close Rate</label>
        <div class="col-8">{{ trade.close_rate }}</div>
      </div>
    </div>
    <div class="container col-4">
      <div class="row">
        <label class="col-4">Min Rate</label>
        <div class="col-8">{{ trade.min_rate }}</div>
      </div>
      <div class="row">
        <label class="col-4">Max Rate</label>
        <div class="col-8">{{ trade.max_rate }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { formatPercent } from '@/shared/formatters';

export default {
  name: 'TradeDetail',
  props: {
    trade: {
      type: Object,
      required: true,
    },
  },
  methods: {
    ...mapActions(),
    formatPercent,
  },
};
</script>
<style scoped>
label {
  font-weight: bold;
}
</style>
