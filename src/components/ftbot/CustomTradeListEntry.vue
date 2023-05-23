<template>
  <div class="d-flex">
    <div
      class="px-1 d-flex flex-row flex-fill text-start justify-content-between align-items-center"
    >
      <span>
        <span class="me-1 fw-bold">{{ trade.pair }}</span>
        <small class="text-secondary">(#{{ trade.trade_id }})</small>
      </span>
      <small>
        <DateTimeTZ :date="trade.open_timestamp" :date-only="true" />
      </small>
    </div>
    <trade-profit class="col-5" :trade="trade" />
  </div>
</template>

<script setup lang="ts">
import { Trade } from '@/types';
import DateTimeTZ from '@/components/general/DateTimeTZ.vue';
import TradeProfit from './TradeProfit.vue';

defineProps({
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
