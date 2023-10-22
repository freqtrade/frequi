<template>
  <b-list-group>
    <b-list-group-item
      v-for="comb in combinedPairList"
      :key="comb.pair"
      button
      class="d-flex justify-content-between align-items-center py-1"
      :active="comb.pair === botStore.activeBot.selectedPair"
      :title="`${comb.pair} - ${comb.tradeCount} trades`"
      @click="botStore.activeBot.selectedPair = comb.pair"
    >
      <div>
        {{ comb.pair }}
        <span v-if="comb.locks" :title="comb.lockReason"> <i-mdi-lock /> </span>
      </div>

      <TradeProfit v-if="comb.trade && !backtestMode" :trade="comb.trade" />
      <ProfitPill
        v-if="backtestMode && comb.tradeCount > 0"
        :profit-ratio="comb.profit"
        :stake-currency="botStore.activeBot.stakeCurrency"
      />
    </b-list-group-item>
  </b-list-group>
</template>

<script setup lang="ts">
import { formatPercent, timestampms } from '@/shared/formatters';
import { Lock, Trade } from '@/types';
import TradeProfit from '@/components/ftbot/TradeProfit.vue';
import ProfitPill from '@/components/general/ProfitPill.vue';
import { computed } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

interface CombinedPairList {
  pair: string;
  lockReason: string;
  profitString: string;
  trade?: Trade;
  locks?: Lock;
  profit: number;
  profitAbs: number;
  tradeCount: number;
}

const props = defineProps({
  // TOOD: Should be string list
  pairlist: { required: true, type: Array as () => string[] },
  currentLocks: { required: false, type: Array as () => Lock[], default: () => [] },
  trades: { required: true, type: Array as () => Trade[] },
  sortMethod: { default: 'normal', type: String },
  backtestMode: { required: false, default: false, type: Boolean },
});
const botStore = useBotStore();
const combinedPairList = computed(() => {
  const comb: CombinedPairList[] = [];

  props.pairlist.forEach((pair) => {
    const trades: Trade[] = props.trades.filter((el) => el.pair === pair);
    const allLocks = props.currentLocks.filter((el) => el.pair === pair);
    let lockReason = '';
    let locks;

    // Sort to have longer timeframe in front
    allLocks.sort((a, b) => (a.lock_end_timestamp > b.lock_end_timestamp ? -1 : 1));
    if (allLocks.length > 0) {
      [locks] = allLocks;
      lockReason = `${timestampms(locks.lock_end_timestamp)} - ${locks.reason}`;
    }
    let profitString = '';
    let profit = 0;
    let profitAbs = 0;
    trades.forEach((trade) => {
      profit += trade.profit_ratio;
      profitAbs += trade.profit_abs ?? 0;
    });
    const tradeCount = trades.length;
    const trade = tradeCount ? trades[0] : undefined;
    if (trades.length > 0) {
      profitString = `Current profit: ${formatPercent(profit)}`;
    }
    if (trade) {
      profitString += `\nOpen since: ${timestampms(trade.open_timestamp)}`;
    }
    comb.push({ pair, trade, locks, lockReason, profitString, profit, profitAbs, tradeCount });
  });
  if (props.sortMethod === 'profit') {
    comb.sort((a, b) => {
      if (a.profit > b.profit) {
        return -1;
      }
      return 1;
    });
  } else {
    // sort Pairs: "with open trade" -> available -> locked
    comb.sort((a, b) => {
      if (a.trade && !b.trade) {
        return -1;
      }
      if (a.trade && b.trade) {
        // 2 open trade pairs
        return a.trade.trade_id > b.trade.trade_id ? 1 : -1;
      }
      if (!a.locks && b.locks) {
        return -1;
      }
      if (a.locks && b.locks) {
        // Both have locks
        return a.locks.lock_end_timestamp > b.locks.lock_end_timestamp ? 1 : -1;
      }
      return 1;
    });
  }
  return comb;
});
</script>

<style scoped>
.list-group {
  text-align: left;
}
</style>
