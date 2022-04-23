<template>
  <div>
    <!-- <TradeList
      class="open-trades"
      :trades="openTrades"
      title="Open trades"
      :active-trades="true"
      empty-text="Currently no open trades."
    /> -->
    <CustomTradeList
      v-if="!history && !botStore.activeBot.detailTradeId"
      :trades="botStore.activeBot.openTrades"
      title="Open trades"
      :active-trades="true"
      :stake-currency-decimals="botStore.activeBot.stakeCurrencyDecimals"
      empty-text="No open Trades."
    />
    <CustomTradeList
      v-if="history && !botStore.activeBot.detailTradeId"
      :trades="botStore.activeBot.closedTrades"
      title="Trade history"
      :stake-currency-decimals="botStore.activeBot.stakeCurrencyDecimals"
      empty-text="No closed trades so far."
    />
    <div v-if="botStore.activeBot.detailTradeId" class="d-flex flex-column">
      <b-button
        size="sm"
        class="align-self-start mt-1 ml-1"
        @click="botStore.activeBot.setDetailTrade(null)"
        ><BackIcon /> Back</b-button
      >
      <TradeDetail
        :trade="botStore.activeBot.tradeDetail"
        :stake-currency="botStore.activeBot.stakeCurrency"
      />
    </div>
  </div>
</template>

<script lang="ts">
import CustomTradeList from '@/components/ftbot/CustomTradeList.vue';
import TradeDetail from '@/components/ftbot/TradeDetail.vue';
import BackIcon from 'vue-material-design-icons/ArrowLeft.vue';
import { defineComponent } from '@vue/composition-api';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'TradesList',
  components: {
    CustomTradeList,
    TradeDetail,
    BackIcon,
  },
  props: {
    history: { default: false, type: Boolean },
  },
  setup() {
    const botStore = useBotStore();

    return {
      botStore,
    };
  },
});
</script>

<style scoped></style>
