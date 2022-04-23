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
import ProfitPill from '@/components/general/ProfitPill.vue';

import { defineComponent, computed } from '@vue/composition-api';

export default defineComponent({
  name: 'TradeProfit',
  components: { ProfitPill },
  props: {
    trade: { required: true, type: Object as () => Trade },
  },
  setup(props) {
    const profitDesc = computed((): string => {
      let profit = `Current profit: ${formatPercent(props.trade.profit_ratio)} (${
        props.trade.profit_abs
      })`;
      profit += `\nOpen since: ${timestampms(props.trade.open_timestamp)}`;
      return profit;
    });
    return { profitDesc };
  },
});
</script>

<style scoped></style>
