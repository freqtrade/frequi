<template>
  <GridLayout class="h-100 w-100" :row-height="50" :layout="gridLayout">
    <GridItem
      :i="gridLayout[0].i"
      :x="gridLayout[0].x"
      :y="gridLayout[0].y"
      :w="gridLayout[0].w"
      :h="gridLayout[0].h"
    >
      <ReloadControl />
    </GridItem>
    <GridItem
      :i="gridLayout[1].i"
      :x="gridLayout[1].x"
      :y="gridLayout[1].y"
      :w="gridLayout[1].w"
      :h="gridLayout[1].h"
    >
      <BotControls class="mt-3" />
    </GridItem>
    <GridItem
      :i="gridLayout[2].i"
      :x="gridLayout[2].x"
      :y="gridLayout[2].y"
      :w="gridLayout[2].w"
      :h="gridLayout[2].h"
    >
      <b-tabs content-class="mt-3" class="mt-3">
        <b-tab title="Status" active>
          <BotStatus />
        </b-tab>
        <b-tab title="Performance">
          <Performance class="performance-view" />
        </b-tab>
        <b-tab title="Balance" lazy>
          <Balance />
        </b-tab>
        <b-tab title="Daily Stats" lazy>
          <DailyStats />
        </b-tab>

        <b-tab title="Pairlist" lazy>
          <FTBotAPIPairList />
        </b-tab>
      </b-tabs>
    </GridItem>
    <GridItem
      :i="gridLayout[3].i"
      :x="gridLayout[3].x"
      :y="gridLayout[3].y"
      :w="gridLayout[3].w"
      :h="gridLayout[3].h"
      drag-allow-from=".card-header"
    >
      <TradeList
        class="open-trades"
        :trades="openTrades"
        title="Open trades"
        :active-trades="true"
        empty-text="Currently no open trades."
      />
    </GridItem>
    <GridItem
      :i="gridLayout[4].i"
      :x="gridLayout[4].x"
      :y="gridLayout[4].y"
      :w="gridLayout[4].w"
      :h="gridLayout[4].h"
      drag-allow-from=".card-header"
    >
      <TradeList
        v-if="!detailTradeId"
        class="trade-history"
        :trades="closedTrades"
        title="Trade history"
        empty-text="No closed trades so far."
      />
      <TradeDetail v-if="detailTradeId" :trade="tradeDetail"> </TradeDetail>
    </GridItem>
    <GridItem
      :i="gridLayout[5].i"
      :x="gridLayout[5].x"
      :y="gridLayout[5].y"
      :w="gridLayout[5].w"
      :h="gridLayout[5].h"
    >
      <LogViewer />
    </GridItem>
  </GridLayout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { GridLayout, GridItem, GridItemData } from 'vue-grid-layout';

import TradeList from '@/components/ftbot/TradeList.vue';
import Performance from '@/components/ftbot/Performance.vue';
import BotControls from '@/components/ftbot/BotControls.vue';
import BotStatus from '@/components/ftbot/BotStatus.vue';
import Balance from '@/components/ftbot/Balance.vue';
import DailyStats from '@/components/ftbot/DailyStats.vue';
import FTBotAPIPairList from '@/components/ftbot/FTBotAPIPairList.vue';
import TradeDetail from '@/components/ftbot/TradeDetail.vue';
import ReloadControl from '@/components/ftbot/ReloadControl.vue';
import LogViewer from '@/components/ftbot/LogViewer.vue';

import { Trade } from '@/types';
import { UserStoreGetters } from '@/store/modules/ftbot';

const ftbot = namespace('ftbot');

@Component({
  components: {
    GridLayout,
    GridItem,
    TradeList,
    Performance,
    BotControls,
    BotStatus,
    Balance,
    DailyStats,
    FTBotAPIPairList,
    TradeDetail,
    ReloadControl,
    LogViewer,
  },
})
export default class Trading extends Vue {
  @ftbot.State detailTradeId!: string;

  @ftbot.Getter openTrades!: Trade[];

  @ftbot.Getter closedTrades!: Trade[];

  @ftbot.Getter [UserStoreGetters.tradeDetail]!: Trade;

  public gridLayout: GridItemData[] = [
    { i: 'g-reloadControl', x: 0, y: 0, w: 4, h: 1 },
    { i: 'g-botControls', x: 0, y: 0, w: 4, h: 3 },
    { i: 'g-MultiPane', x: 0, y: 0, w: 4, h: 7 },
    { i: 'g-openTrades', x: 4, y: 0, w: 8, h: 5 },
    { i: 'g-tradeHistory', x: 4, y: 4, w: 8, h: 6 },
    { i: 'g-logView', x: 0, y: 9, w: 12, h: 3 },
  ];
}
</script>

<style scoped></style>
