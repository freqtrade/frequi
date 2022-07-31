<template>
  <b-list-group>
    <b-list-group-item
      v-for="trade in trades"
      :key="trade.open_timestamp"
      button
      class="d-flex justify-content-between align-items-center py-1"
      :title="`${trade.pair}`"
      :active="trade.open_timestamp === selectedTrade"
      @click="tradeSelect(trade)"
    >
      <div>
        <DateTimeTZ :date="trade.open_timestamp" />
      </div>

      <TradeProfit :trade="trade" />
      <ProfitPill
        v-if="backtestMode"
        :profit-ratio="trade.profit"
        :stake-currency="botStore.activeBot.stakeCurrency"
      />
    </b-list-group-item>
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
    sortMethod: { default: 'normal', type: String },
    backtestMode: { required: false, default: false, type: Boolean },
  },

  setup(props) {
    const botStore = useBotStore();
    const selectedTrade = ref(0)

    const tradeSelect = (trade: Trade) => {
        selectedTrade.value = trade.open_timestamp;
    }
    
    return {
      botStore,
      tradeSelect,
      selectedTrade
    };
  },
});
</script>

<style scoped>
.list-group {
  text-align: left;
}
</style>
