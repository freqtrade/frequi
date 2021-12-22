<template>
  <div class="my-1 d-flex">
    <div class="d-flex flex-column flex-fill text-left">
      <div class="d-flex justify-content-between">
        <span class="mr-2 font-weight-bold">{{ trade.pair }}</span>
        <small>{{ trade.trade_id }} </small>
      </div>
      <ValuePair description="Amount">{{ trade.amount }}</ValuePair>
      <ValuePair description="Open Rate">{{ formatPrice(trade.open_rate) }}</ValuePair>
      <!-- <span>Open rate {{ formatPrice(trade.open_rate) }} </span> -->
      <ValuePair v-if="trade.close_rate || trade.current_rate" description="Close Rate">{{
        formatPrice(trade.close_rate || trade.current_rate || 0)
      }}</ValuePair>
      <DateTimeTZ :date="trade.open_timestamp" />
      <DateTimeTZ :date="trade.close_timestamp" />
      <trade-profit :trade="trade" class="align-self-end" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { formatPercent, formatPrice } from '@/shared/formatters';
import { Trade } from '@/types';
import DateTimeTZ from '@/components/general/DateTimeTZ.vue';
import ValuePair from '@/components/general/ValuePair.vue';
import TradeProfit from './TradeProfit.vue';

export default defineComponent({
  components: {
    DateTimeTZ,
    TradeProfit,
    ValuePair,
  },
  props: {
    trade: {
      type: Object as () => Trade,
      required: true,
    },
    stakeCurrencyDecimals: {
      type: Number,
      required: true,
    },
  },
  setup() {
    return {
      formatPrice,
      formatPercent,
    };
  },
});
</script>

<style lang="scss" scoped>
.card-body {
  padding: 0 0.2em;
}
.table-sm {
  font-size: $fontsize-small;
}
.btn-xs {
  padding: 0.1rem 0.25rem;
  font-size: 0.75rem;
}
</style>
