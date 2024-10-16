<script setup lang="ts">
import { Trade } from '@/types';

import { useBotStore } from '@/stores/ftbotwrapper';

const props = defineProps({
  trades: { required: true, type: Array as () => Trade[] },
  backtestMode: { required: false, default: false, type: Boolean },
});
const emit = defineEmits<{ 'trade-select': [trade: Trade] }>();

const botStore = useBotStore();
const selectedTrade = ref({} as Trade);
const sortDescendingOrder = ref(true);
const sortMethod = ref('openDate');
const sortMethodOptions = [
  { text: 'Open date', value: 'openDate' },
  { text: 'Profit %', value: 'profit' },
];

const onTradeSelect = (trade: Trade) => {
  selectedTrade.value = trade;
  emit('trade-select', trade);
};

const sortedTrades = computed(() => {
  const field: keyof Trade = sortMethod.value === 'profit' ? 'profit_ratio' : 'open_timestamp';
  return sortDescendingOrder.value
    ? props.trades.slice().sort((a, b) => b[field] - a[field])
    : props.trades.slice().sort((a, b) => a[field] - b[field]);
});

const ordersVisible = ref(sortedTrades.value.map(() => false));

watch(
  () => botStore.activeBot.selectedPair,
  () => {
    ordersVisible.value = sortedTrades.value.map(() => false);
  },
);
</script>

<template>
  <div>
    <div class="d-flex justify-content-center">
      <span class="me-2">Sort by:</span>
      <BFormRadioGroup v-model="sortMethod" :options="sortMethodOptions" name="radio-options" />
    </div>
    <BListGroup>
      <BListGroupItem
        button
        class="d-flex flex-wrap justify-content-center align-items-center"
        :title="'Trade Navigation'"
        @click="sortDescendingOrder = !sortDescendingOrder"
        >Trade Navigation {{ sortDescendingOrder ? '&#8595;' : '&#8593;' }}
      </BListGroupItem>
      <BListGroupItem
        v-for="(trade, i) in sortedTrades"
        :key="trade.open_timestamp"
        button
        class="d-flex flex-column py-1 pe-1 align-items-stretch"
        :title="`${trade.pair}`"
        :active="trade.open_timestamp === selectedTrade.open_timestamp"
        @click="onTradeSelect(trade)"
      >
        <div class="d-flex">
          <div class="d-flex flex-column">
            <div>
              <span v-if="botStore.activeBot.botState.trading_mode !== 'spot'">{{
                trade.is_short ? 'S-' : 'L-'
              }}</span>
              <DateTimeTZ :date="trade.open_timestamp" />
            </div>
            <TradeProfit :trade="trade" class="my-1" />
            <ProfitPill
              v-if="backtestMode"
              :profit-ratio="trade.profit_ratio"
              :stake-currency="botStore.activeBot.stakeCurrency"
            />
          </div>
          <BButton
            size="sm"
            class="ms-auto mt-auto"
            variant="outline-secondary"
            @click="ordersVisible[i] = !ordersVisible[i]"
            ><i-mdi-chevron-right v-if="!ordersVisible[i]" width="24" height="24" />
            <i-mdi-chevron-down v-if="ordersVisible[i]" width="24" height="24" />
          </BButton>
        </div>
        <BCollapse v-model="ordersVisible[i]">
          <ul class="px-3 m-0">
            <li
              v-for="order in trade.orders?.filter((o) => o.order_filled_timestamp !== null)"
              :key="order.order_timestamp"
            >
              {{ order.ft_order_side }} {{ order.amount }} at {{ order.safe_price }}
            </li>
          </ul>
        </BCollapse>
      </BListGroupItem>
      <BListGroupItem v-if="trades.length === 0">No trades to show...</BListGroupItem>
    </BListGroup>
  </div>
</template>

<style scoped>
.list-group {
  text-align: left;
}
</style>
