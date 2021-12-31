<template>
  <div class="d-flex">
    <div
      class="px-1 d-flex flex-row flex-fill text-left justify-content-between align-items-center"
    >
      <span>
        <span class="mr-1 font-weight-bold">{{ trade.pair }}</span>
        <small class="text-secondary">(#{{ trade.trade_id }})</small>
      </span>
      <small>
        <DateTimeTZ :date="trade.open_timestamp" :date-only="true" title="open Date" />
      </small>
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
import TradeProfit from './TradeProfit.vue';

export default defineComponent({
  components: {
    DateTimeTZ,
    TradeProfit,
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
