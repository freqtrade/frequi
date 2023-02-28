<template>
  <profit-pill
    :profit-ratio="profitRatio"
    :profit-abs="profitAbs"
    :profit-desc="profitDesc"
    :stake-currency="trade.quote_currency || 'USDT'"
  />
</template>

<script setup lang="ts">
import { formatPercent, timestampms } from '@/shared/formatters';
import { Trade } from '@/types';
import ProfitPill from '@/components/general/ProfitPill.vue';

import { computed } from 'vue';

const props = defineProps({
  trade: { required: true, type: Object as () => Trade },
  mode: { required: false, default: 'default', type: String },
});
const profitDesc = computed((): string => {
  let profit = `Current profit: ${formatPercent(props.trade.profit_ratio)} (${
    props.trade.profit_abs
  })`;
  profit += `\nOpen since: ${timestampms(props.trade.open_timestamp)}`;
  return profit;
});

const profitRatio = computed<number | undefined>(() => {
  return props.trade.profit_ratio;
});
const profitAbs = computed<number | undefined>(() => {
  return props.trade.profit_abs;
});
</script>

<style scoped></style>
