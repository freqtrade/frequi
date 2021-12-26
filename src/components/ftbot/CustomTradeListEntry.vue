<template>
  <div class="d-flex">
    <div
      class="col-7 px-1 d-flex flex-row flex-fill text-left justify-content-between align-items-center"
    >
      <span>
        <span class="mr-1 font-weight-bold">{{ trade.pair }}</span>
        <small class="text-secondary">(#{{ trade.trade_id }})</small>
      </span>
      <!-- <ValuePair description="Amount">{{ trade.amount }}</ValuePair> -->
      <ValuePair v-if="showDetails" description="Open Rate">{{
        formatPrice(trade.open_rate)
      }}</ValuePair>
      <!-- <span>Open rate {{ formatPrice(trade.open_rate) }} </span> -->
      <ValuePair
        v-if="showDetails && (trade.close_rate || trade.current_rate)"
        description="Close Rate"
        >{{ formatPrice(trade.close_rate || trade.current_rate || 0) }}</ValuePair
      >
      <small>
        <DateTimeTZ :date="trade.open_timestamp" :date-only="true" title="open Date" />
      </small>
      <ValuePair v-if="showDetails && trade.close_timestamp" description="Close date"
        ><DateTimeTZ :date="trade.close_timestamp"
      /></ValuePair>
    </div>
    <trade-profit class="col-5" :trade="trade" />
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
    showDetails: {
      type: Boolean,
      default: false,
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
