<script setup lang="ts">
import type { Lock, Trade } from '@/types';

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

const props = withDefaults(
  defineProps<{
    pairlist: string[];
    currentLocks?: Lock[];
    trades: Trade[];
    sortMethod?: string;
    backtestMode?: boolean;
    startingBalance?: number;
  }>(),
  {
    currentLocks: () => [],
    sortMethod: 'normal',
    backtestMode: false,
    startingBalance: 0,
  },
);
const botStore = useBotStore();

const filterText = ref('');
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
      lockReason = `${timestampms(locks.lock_end_timestamp)} - ${locks.side} - ${locks.reason}`;
    }
    let profitString = '';
    let profit = 0;
    let profitAbs = 0;
    trades.forEach((trade) => {
      profit += trade.profit_ratio ?? 0;
      profitAbs += trade.profit_abs ?? 0;
    });
    if (props.sortMethod == 'profit' && props.startingBalance) {
      profit = profitAbs / props.startingBalance;
    }
    const tradeCount = trades.length;
    const trade = tradeCount ? trades[0] : undefined;
    if (trades.length > 0) {
      profitString = `Current profit: ${formatPercent(profit)}`;
    }
    if (trade) {
      profitString += `\nOpen since: ${timestampms(trade.open_timestamp)}`;
    }
    if (
      filterText.value === '' ||
      pair.toLocaleLowerCase().includes(filterText.value.toLocaleLowerCase())
    ) {
      comb.push({ pair, trade, locks, lockReason, profitString, profit, profitAbs, tradeCount });
    }
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

<template>
  <div>
    <div
      label-for="trade-filter"
      class="mb-2"
      :class="{
        'me-4': backtestMode,
        'me-2': !backtestMode,
      }"
    >
      <InputText
        id="trade-filter"
        v-model="filterText"
        type="text"
        placeholder="Filter"
        class="w-full"
      />
    </div>
    <ul
      class="divide-y divide-surface-300 dark:divide-surface-700 divide-solid border-x border-y rounded-sm border-surface-300 dark:border-surface-700"
    >
      <li
        v-for="comb in combinedPairList"
        :key="comb.pair"
        button
        class="flex cursor-pointer last:rounded-b justify-between items-center px-1 py-1.5"
        :class="{
          'bg-primary dark:border-primary text-primary-contrast':
            comb.pair === botStore.activeBot.selectedPair,
        }"
        :title="`${formatPriceCurrency(comb.profitAbs, botStore.activeBot.stakeCurrency, botStore.activeBot.stakeCurrencyDecimals)} - ${comb.pair} - ${comb.tradeCount} trades`"
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
      </li>
    </ul>
  </div>
</template>

<style scoped>
.list-group {
  text-align: left;
}
</style>
