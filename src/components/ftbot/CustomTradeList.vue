<script setup lang="ts">
import type { Trade } from '@/types';

const props = withDefaults(
  defineProps<{
    trades: Trade[];
    title?: string;
    stakeCurrency?: string;
    activeTrades?: boolean;
    showFilter?: boolean;
    multiBotView?: boolean;
    emptyText?: string;
    stakeCurrencyDecimals?: number;
  }>(),
  {
    title: 'Trades',
    stakeCurrency: '',
    activeTrades: false,
    showFilter: false,
    multiBotView: false,
    emptyText: 'No Trades to show.',
    stakeCurrencyDecimals: 3,
  },
);
const botStore = useBotStore();
const currentPage = ref(1);
const filterText = ref('');
const perPage = props.activeTrades ? 200 : 25;

const rows = computed(() => props.trades.length);

const filteredTrades = computed(() => {
  return props.trades.slice((currentPage.value - 1) * perPage, currentPage.value * perPage);
});

const tradeClick = (trade) => {
  botStore.activeBot.setDetailTrade(trade);
};
</script>

<template>
  <div class="h-full overflow-auto p-1">
    <div id="tradeList">
      <div
        v-for="trade in filteredTrades"
        :key="trade.trade_id"
        class="border border-surface-500 rounded-sm my-0.5 px-1 py-2"
        @click="tradeClick(trade)"
      >
        <CustomTradeListEntry :trade="trade" :stake-currency-decimals="stakeCurrencyDecimals" />
      </div>
    </div>

    <span v-if="trades.length == 0" class="mt-5">{{ emptyText }}</span>

    <div class="w-full flex justify-content-between mt-1">
      <Paginator
        v-if="!activeTrades"
        v-model="currentPage"
        :total-records="rows"
        :rows="perPage"
        aria-controls="tradeList"
      ></Paginator>
      <InputText
        v-if="showFilter"
        v-model="filterText"
        type="text"
        placeholder="Filter"
        size="sm"
      />
    </div>
  </div>
</template>
