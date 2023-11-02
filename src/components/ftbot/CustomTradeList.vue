<template>
  <div class="h-100 overflow-auto p-1">
    <b-list-group id="tradeList">
      <b-list-group-item
        v-for="trade in filteredTrades"
        :key="trade.trade_id"
        class="border border-secondary rounded my-05 px-1"
        @click="tradeClick(trade)"
      >
        <CustomTradeListEntry :trade="trade" :stake-currency-decimals="stakeCurrencyDecimals" />
      </b-list-group-item>
    </b-list-group>

    <span v-if="trades.length == 0" class="mt-5">{{ emptyText }}</span>

    <div class="w-100 d-flex justify-content-between mt-1">
      <b-pagination
        v-if="!activeTrades"
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        aria-controls="tradeList"
      ></b-pagination>
      <b-form-input
        v-if="showFilter"
        v-model="filterText"
        type="text"
        placeholder="Filter"
        size="sm"
        style="width: unset"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trade } from '@/types';
import { computed, ref } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

const props = defineProps({
  trades: { required: true, type: Array as () => Trade[] },
  title: { default: 'Trades', type: String },
  stakeCurrency: { required: false, default: '', type: String },
  activeTrades: { default: false, type: Boolean },
  showFilter: { default: false, type: Boolean },
  multiBotView: { default: false, type: Boolean },
  emptyText: { default: 'No Trades to show.', type: String },
  stakeCurrencyDecimals: { default: 3, type: Number },
});
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

<style lang="scss" scoped>
.my-05 {
  margin-top: 0.125rem;
  margin-bottom: 0.125rem;
}
</style>
