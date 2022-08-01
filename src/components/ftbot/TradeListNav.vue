<template>
  <b-list-group>
    <b-list-group-item
      v-for="trade in sortedTrades"
      :key="trade.open_timestamp"
      button
      class="d-flex justify-content-between align-items-center py-1"
      :title="`${trade.pair}`"
      :active="trade.open_timestamp === selectedTrade.open_timestamp"
      @click="onTradeSelect(trade)"
    >
      <div>
        <DateTimeTZ :date="trade.open_timestamp" />
      </div>

      <TradeProfit :trade="trade" />
      <ProfitPill
        v-if="backtestMode"
        :profit-ratio="trade.profit_ratio"
        :stake-currency="botStore.activeBot.stakeCurrency"
      />
    </b-list-group-item>
    <b-list-group-item v-if="trades.length === 0">No trades to show...</b-list-group-item>
  </b-list-group>
</template>

<script lang="ts">
import { Trade } from '@/types';
import TradeProfit from '@/components/ftbot/TradeProfit.vue';
import ProfitPill from '@/components/general/ProfitPill.vue';
import { defineComponent, computed, ref } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import DateTimeTZ from '@/components/general/DateTimeTZ.vue';

export default defineComponent({
  name: 'TradeListNav',
  components: { TradeProfit, ProfitPill, DateTimeTZ },
  props: {
    trades: { required: true, type: Array as () => Trade[] },
    backtestMode: { required: false, default: false, type: Boolean },
  },
  emits: ['trade-select'],

  setup(props, { emit }) {
    const botStore = useBotStore();
    const selectedTrade = ref({} as Trade);

    const onTradeSelect = (trade: Trade) => {
      selectedTrade.value = trade;
      emit('trade-select', trade);
    };

    const sortedTrades = computed(() => {
      return props.trades.slice().sort((a, b) => b.open_timestamp - a.open_timestamp);
    });

    return {
      botStore,
      selectedTrade,
      sortedTrades,
      onTradeSelect,
    };
  },
});
</script>

<style scoped>
.list-group {
  text-align: left;
}
</style>
