<template>
  <profit-pill
    :profit-ratio="trade.profit_ratio"
    :profit-abs="trade.profit_abs"
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
});
const profitDesc = computed((): string => {
  let profit = `Current profit: ${formatPercent(props.trade.profit_ratio)} (${
    props.trade.profit_abs
  })`;
  profit += `\nOpen since: ${timestampms(props.trade.open_timestamp)}`;
  return profit;
});
</script>

<style scoped></style>
