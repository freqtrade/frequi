<template>
  <profit-pill
    :profit-ratio="trade.profit_ratio"
    :profit-abs="trade.profit_abs"
    :profit-desc="profitDesc"
    stake-currency="USDT"
  />
</template>

<script lang="ts">
import { formatPercent, timestampms } from '@/shared/formatters';
import { Trade } from '@/types';
import { Component, Prop, Vue } from 'vue-property-decorator';
import ProfitPill from '@/components/general/ProfitPill.vue';

@Component({ components: { ProfitPill } })
export default class TradeProfit extends Vue {
  @Prop({ required: true, type: Object }) trade!: Trade;

  formatPercent = formatPercent;

  timestampms = timestampms;

  get profitDesc(): string {
    let profit = `Current profit: ${formatPercent(this.trade.profit_ratio)} (${
      this.trade.profit_abs
    })`;
    profit += `\nOpen since: ${timestampms(this.trade.open_timestamp)}`;
    return profit;
  }
}
</script>

<style scoped></style>
