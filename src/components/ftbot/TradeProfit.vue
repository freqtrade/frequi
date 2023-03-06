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

import { computed, PropType } from 'vue';

const props = defineProps({
  trade: { required: true, type: Object as () => Trade },
  mode: {
    required: false,
    default: 'default',
    type: String as PropType<'default' | 'total' | 'realized'>,
  },
});
const profitDesc = computed((): string => {
  let profit = `Current profit: ${formatPercent(props.trade.profit_ratio)} (${
    props.trade.profit_abs
  })`;
  profit += `\nOpen since: ${timestampms(props.trade.open_timestamp)}`;
  return profit;
});

const profitRatio = computed<number | undefined>(() => {
  switch (props.mode) {
    case 'default':
      return props.trade.profit_ratio;
    case 'total':
      return props.trade.total_profit_ratio;
    case 'realized':
      return props.trade.realized_profit_ratio;
    default:
      return undefined;
  }
});
const profitAbs = computed<number | undefined>(() => {
  switch (props.mode) {
    case 'default':
      return props.trade.profit_abs;
    case 'total':
      return props.trade.total_profit_abs;
    case 'realized':
      return props.trade.realized_profit;
    default:
      return undefined;
  }
});
</script>

<style scoped></style>
