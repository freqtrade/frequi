<template>
  <div>
    <b-list-group>
      <b-list-group-item
        button
        class="d-flex flex-wrap justify-content-center align-items-center"
        :title="'Trade Navigation'"
        @click="sortNewestFirst = !sortNewestFirst"
        >Trade Navigation {{ sortNewestFirst ? '&#8595;' : '&#8593;' }}
      </b-list-group-item>
      <b-list-group-item
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
          <b-button
            size="sm"
            class="ms-auto"
            variant="outline-secondary"
            @click="ordersVisible[i] = !ordersVisible[i]"
            ><i-mdi-chevron-right v-if="!ordersVisible[i]" width="24" height="24" />
            <i-mdi-chevron-down v-if="ordersVisible[i]" width="24" height="24" />
          </b-button>
        </div>
        <b-collapse v-model="ordersVisible[i]">
          <ul class="px-3 m-0">
            <li
              v-for="order in trade.orders?.filter((o) => o.order_filled_timestamp !== null)"
              :key="order.order_timestamp"
            >
              {{ order.ft_order_side }} {{ order.amount }} at {{ order.safe_price }}
            </li>
          </ul>
        </b-collapse>
      </b-list-group-item>
      <b-list-group-item v-if="trades.length === 0">No trades to show...</b-list-group-item>
    </b-list-group>
  </div>
</template>

<script setup lang="ts">
import { Trade } from '@/types';
import TradeProfit from '@/components/ftbot/TradeProfit.vue';
import ProfitPill from '@/components/general/ProfitPill.vue';
import { computed, ref, watch } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import DateTimeTZ from '@/components/general/DateTimeTZ.vue';

const props = defineProps({
  trades: { required: true, type: Array as () => Trade[] },
  backtestMode: { required: false, default: false, type: Boolean },
});
const emit = defineEmits(['trade-select']);

const botStore = useBotStore();
const selectedTrade = ref({} as Trade);
const sortNewestFirst = ref(true);

const onTradeSelect = (trade: Trade) => {
  selectedTrade.value = trade;
  emit('trade-select', trade);
};

const sortedTrades = computed(() => {
  return props.trades
    .slice()
    .sort((a, b) =>
      sortNewestFirst.value
        ? b.open_timestamp - a.open_timestamp
        : a.open_timestamp - b.open_timestamp,
    );
});

const ordersVisible = ref(sortedTrades.value.map(() => false));

watch(
  () => botStore.activeBot.selectedPair,
  () => {
    ordersVisible.value = sortedTrades.value.map(() => false);
  },
);
</script>

<style scoped>
.list-group {
  text-align: left;
}
</style>
