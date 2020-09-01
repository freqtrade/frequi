<template>
  <div class="container">
    <div class="row">
      <div class="col-lg-5">
        <h5 class="detail-header">General</h5>
        <ValuePair description="TradeId">{{ trade.trade_id }}</ValuePair>
        <ValuePair description="Pair">{{ trade.pair }}</ValuePair>
        <ValuePair description="Open date">{{ timestampms(trade.open_timestamp) }}</ValuePair>
        <ValuePair description="Open Rate">{{ trade.open_rate }}</ValuePair>
        <ValuePair v-if="!trade.is_open" description="Close Rate">{{ trade.close_rate }}</ValuePair>
        <ValuePair description="Min Rate">{{ trade.min_rate }}</ValuePair>
        <ValuePair description="Max Rate">{{ trade.max_rate }}</ValuePair>
        <ValuePair v-if="trade.close_timestamp" description="Close date">{{
          timestampms(trade.close_timestamp)
        }}</ValuePair>
        <ValuePair v-if="trade.current_profit_pct" description="Current Profit">
          {{ formatPercent(trade.current_profit_pct) }} | {{ trade.current_profit_abs }}
        </ValuePair>
        <ValuePair v-if="trade.close_profit" description="Close % profit">
          {{ formatPercent(trade.close_profit) }} | {{ trade.close_profit_abs }}
        </ValuePair>
        <ValuePair v-if="trade.close_profit_abs" description="Close profit"> </ValuePair>
      </div>
      <div class="col-lg-7">
        <h5 class="detail-header">Stoploss</h5>
        <ValuePair description="Stoploss">
          {{ formatPercent(trade.stop_loss_pct / 100) }} |
          {{ formatPrice(trade.stop_loss) }}
        </ValuePair>
        <ValuePair description="Initial Stoploss">
          {{ formatPercent(trade.initial_stop_loss_pct / 100) }} |
          {{ formatPrice(trade.initial_stop_loss) }}
        </ValuePair>
        <ValuePair v-if="trade.is_open" description="Current stoploss dist">
          {{ formatPercent(trade.stoploss_current_dist_ratio) }} |
          {{ formatPrice(trade.stoploss_current_dist) }}
        </ValuePair>
        <ValuePair description="Stoploss last updated">
          {{ timestampms(trade.stoploss_last_update_timestamp) }}
        </ValuePair>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { formatPercent, formatPrice, timestampms } from '@/shared/formatters';
import ValuePair from '@/components/ftbot/ValuePair.vue';
import { Trade } from '@/types';

@Component({
  components: { ValuePair },
})
export default class TradeDetail extends Vue {
  @Prop({ type: Object, required: true }) trade!: Trade;

  timestampms = timestampms;

  formatPercent = formatPercent;

  formatPrice = formatPrice;
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
