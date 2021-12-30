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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import CustomTradeList from '@/components/ftbot/CustomTradeList.vue';
import TradeDetail from '@/components/ftbot/TradeDetail.vue';
import BackIcon from 'vue-material-design-icons/ArrowLeft.vue';

import { Trade } from '@/types';
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';

const ftbot = namespace(StoreModules.ftbot);
// TODO: TradeDetail could be extracted into a sub-route to allow direct access
@Component({
  components: {
    CustomTradeList,
    TradeDetail,
    BackIcon,
  },
})
export default class Trading extends Vue {
  @Prop({ default: false }) history!: boolean;

  @ftbot.Getter [BotStoreGetters.openTrades]!: Trade[];

  @ftbot.Getter [BotStoreGetters.closedTrades]!: Trade[];

  @ftbot.Getter [BotStoreGetters.stakeCurrencyDecimals]!: number;

  @ftbot.Getter [BotStoreGetters.stakeCurrency]!: string;

  @ftbot.Getter [BotStoreGetters.detailTradeId]?: number;

  @ftbot.Getter [BotStoreGetters.tradeDetail]!: Trade;

  @ftbot.Action setDetailTrade;
}
</script>

<style scoped></style>
