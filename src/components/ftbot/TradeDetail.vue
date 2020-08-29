<template>
  <div>
    <b-card header="Trade detail" class="mt-1">
      <b-card-text>
        <ValuePair description="TradeId">{{ trade.trade_id }}</ValuePair>
        <ValuePair description="Pair">{{ trade.pair }}</ValuePair>
        <ValuePair description="Open date">{{ timestampms(trade.open_timestamp) }}</ValuePair>
        <ValuePair description="Open Rate">{{ trade.open_rate }}</ValuePair>
        <ValuePair description="Close Rate" v-if="!trade.is_open">{{ trade.close_rate }}</ValuePair>
        <ValuePair description="Min Rate">{{ trade.min_rate }}</ValuePair>
        <ValuePair description="Max Rate">{{ trade.max_rate }}</ValuePair>
        <ValuePair description="Close date" v-if="trade.close_timestamp">{{
          timestampms(trade.close_timestamp)
        }}</ValuePair>
      </b-card-text>
      <h5 class="detail-header">Profit</h5>
      <b-card-text>
        <ValuePair description="Current % profit" v-if="trade.current_profit_pct">
          {{ formatPercent(trade.current_profit_pct) }}
        </ValuePair>
        <ValuePair description="Current profit" v-if="trade.current_profit_abs">
          {{ trade.current_profit_abs }}
        </ValuePair>
        <ValuePair description="Close % profit" v-if="trade.close_profit">
          {{ formatPercent(trade.close_profit) }}
        </ValuePair>
        <ValuePair description="Close profit" v-if="trade.close_profit_abs">
          {{ trade.close_profit_abs }}
        </ValuePair>
      </b-card-text>
      <h5 class="detail-header">Stoploss</h5>
      <b-card-text>
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
      </b-card-text>
    </b-card>
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
