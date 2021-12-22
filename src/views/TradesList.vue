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
      class="trade-history"
      :trades="closedTrades"
      title="Trade history"
      empty-text="No closed trades so far."
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import CustomTradeList from '@/components/ftbot/CustomTradeList.vue';

import { Trade } from '@/types';
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';

const ftbot = namespace(StoreModules.ftbot);

@Component({
  components: {
    CustomTradeList,
  },
})
export default class Trading extends Vue {
  @ftbot.Getter [BotStoreGetters.openTrades]!: Trade[];

  @ftbot.Getter [BotStoreGetters.closedTrades]!: Trade[];

  @ftbot.Getter [BotStoreGetters.stakeCurrencyDecimals]!: number;
}
</script>

<style scoped></style>
