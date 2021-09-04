<template>
  <div
    class="profit-pill px-2"
    :class="trade.profit_ratio > 0 ? 'profit-pill-profit' : ''"
    :title="profitDesc"
  >
    {{ formatPercent(trade.profit_ratio, 2) }}
    <small :title="trade.stake_currency || stakeCurrency">
      {{ `(${formatPrice(trade.profit_abs, 3)})` }}
    </small>
  </div>
</template>

<script lang="ts">
import { formatPercent, formatPrice, timestampms } from '@/shared/formatters';
import { Trade } from '@/types';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class TradeProfit extends Vue {
  @Prop({ required: true, type: Object }) trade!: Trade;

  formatPercent = formatPercent;

  timestampms = timestampms;

  formatPrice = formatPrice;

  get profitDesc(): string {
    let profit = `Current profit: ${formatPercent(this.trade.profit_ratio)} (${
      this.trade.profit_abs
    })`;
    profit += `\nOpen since: ${timestampms(this.trade.open_timestamp)}`;
    return profit;
  }
}
</script>

<style scoped lang="scss">
.profit-pill {
  background: #ef5350;
  border-radius: 6px;
}
.profit-pill-profit {
  background: #26a69a;
}
</style>
