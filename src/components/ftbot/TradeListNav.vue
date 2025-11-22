<script setup lang="ts">
import type { Trade } from '@/types';

const props = withDefaults(
  defineProps<{
    trades: Trade[];
    backtestMode?: boolean;
  }>(),
  {
    backtestMode: false,
  },
);
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
    ? props.trades.slice().sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0))
    : props.trades.slice().sort((a, b) => (a[field] ?? 0) - (b[field] ?? 0));
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
    <div class="flex justify-center">
      <span class="me-2">Sort by:</span>
      <RadioButtonGroup v-model="sortMethod" :options="sortMethodOptions" name="radio-options">
        <div v-for="opt in sortMethodOptions" :key="opt.value" class="flex items-center">
          <RadioButton :id="`id-${opt.value}`" :value="opt.value" />
          <label :for="`id-${opt.value}`">{{ opt.text }}</label>
        </div>
      </RadioButtonGroup>
    </div>
    <ul
      class="divide-y divide-surface-300 dark:divide-surface-700 divide-solid border-x border-y rounded-sm border-surface-300 dark:border-surface-700"
    >
      <Button
        severity="secondary"
        variant="text"
        class="w-full flex flex-wrap justify-center items-center"
        :title="'Trade Navigation'"
        @click="sortDescendingOrder = !sortDescendingOrder"
        >Trade Navigation {{ sortDescendingOrder ? '&#8595;' : '&#8593;' }}
      </Button>
      <li
        v-for="(trade, i) in sortedTrades"
        :key="trade.open_timestamp"
        class="flex flex-col py-1 px-1 items-stretch"
        :title="`${trade.pair}`"
        :class="{
          'bg-primary-100 dark:bg-primary-800 text-primary-contrast':
            trade.open_timestamp === selectedTrade.open_timestamp,
        }"
        @click="onTradeSelect(trade)"
      >
        <div class="flex">
          <div class="flex flex-col">
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
          <Button
            size="small"
            class="ms-auto mt-auto"
            variant="outlined"
            severity="secondary"
            @click="ordersVisible[i] = !ordersVisible[i]"
            ><i-mdi-chevron-right v-if="!ordersVisible[i]" width="24" height="24" />
            <i-mdi-chevron-down v-if="ordersVisible[i]" width="24" height="24" />
          </Button>
        </div>
        <Transition>
          <div v-if="ordersVisible[i]">
            <ul class="px-3 m-0 list-disc list-inside">
              <li
                v-for="order in trade.orders?.filter((o) => o.order_filled_timestamp !== null)"
                :key="order.order_timestamp"
              >
                {{ order.ft_order_side }} {{ order.amount }} at {{ order.safe_price }}
              </li>
            </ul>
          </div>
        </Transition>
      </li>
      <div v-if="trades.length === 0">No trades to show...</div>
    </ul>
  </div>
</template>

<style scoped>
.list-group {
  text-align: left;
}
</style>
