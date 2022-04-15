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
      v-if="!history && !detailTradeId"
      :trades="openTrades"
      title="Open trades"
      :active-trades="true"
      :stake-currency-decimals="stakeCurrencyDecimals"
      empty-text="No open Trades."
    />
    <CustomTradeList
      v-if="history && !detailTradeId"
      :trades="closedTrades"
      title="Trade history"
      :stake-currency-decimals="stakeCurrencyDecimals"
      empty-text="No closed trades so far."
    />
    <div v-if="detailTradeId" class="d-flex flex-column">
      <b-button size="sm" class="align-self-start mt-1 ml-1" @click="setDetailTrade(null)"
        ><BackIcon /> Back</b-button
      >
      <TradeDetail :trade="tradeDetail" :stake-currency="stakeCurrency" />
    </div>
  </div>
</template>

<script lang="ts">
import { BotStoreActions, BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';
import CustomTradeList from '@/components/ftbot/CustomTradeList.vue';
import TradeDetail from '@/components/ftbot/TradeDetail.vue';
import BackIcon from 'vue-material-design-icons/ArrowLeft.vue';
import { defineComponent } from '@vue/composition-api';
import { useNamespacedActions, useNamespacedGetters } from 'vuex-composition-helpers';

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
    const {
      openTrades,
      closedTrades,
      stakeCurrencyDecimals,
      stakeCurrency,
      detailTradeId,
      tradeDetail,
    } = useNamespacedGetters(StoreModules.ftbot, [
      BotStoreGetters.openTrades,
      BotStoreGetters.closedTrades,
      BotStoreGetters.stakeCurrencyDecimals,
      BotStoreGetters.stakeCurrency,
      BotStoreGetters.detailTradeId,
      BotStoreGetters.tradeDetail,
    ]);
    const { setDetailTrade } = useNamespacedActions(StoreModules.ftbot, [
      BotStoreActions.setDetailTrade,
    ]);

    return {
      openTrades,
      closedTrades,
      stakeCurrencyDecimals,
      stakeCurrency,
      detailTradeId,
      tradeDetail,
      setDetailTrade,
    };
  },
});
</script>

<style scoped></style>
