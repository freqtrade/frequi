<template>
  <GridLayout
    class="h-100 w-100"
    :row-height="50"
    :layout="gridLayout"
    :vertical-compact="false"
    @layout-updated="layoutUpdatedEvent"
  >
    <GridItem
      :i="gridLayoutReload.i"
      :x="gridLayoutReload.x"
      :y="gridLayoutReload.y"
      :w="gridLayoutReload.w"
      :h="gridLayoutReload.h"
    >
      <ReloadControl />
    </GridItem>
    <GridItem
      :i="gridLayoutBotControls.i"
      :x="gridLayoutBotControls.x"
      :y="gridLayoutBotControls.y"
      :w="gridLayoutBotControls.w"
      :h="gridLayoutBotControls.h"
    >
      <BotControls class="mt-3" />
    </GridItem>
    <GridItem
      :i="gridLayoutMultiPane.i"
      :x="gridLayoutMultiPane.x"
      :y="gridLayoutMultiPane.y"
      :w="gridLayoutMultiPane.w"
      :h="gridLayoutMultiPane.h"
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
      :i="gridLayoutOpenTrades.i"
      :x="gridLayoutOpenTrades.x"
      :y="gridLayoutOpenTrades.y"
      :w="gridLayoutOpenTrades.w"
      :h="gridLayoutOpenTrades.h"
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
      :i="gridLayoutTradeHistory.i"
      :x="gridLayoutTradeHistory.x"
      :y="gridLayoutTradeHistory.y"
      :w="gridLayoutTradeHistory.w"
      :h="gridLayoutTradeHistory.h"
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
      :i="gridLayoutLogView.i"
      :x="gridLayoutLogView.x"
      :y="gridLayoutLogView.y"
      :w="gridLayoutLogView.w"
      :h="gridLayoutLogView.h"
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
import { TradeLayout, findGridLayout } from '@/store/modules/layout';

const ftbot = namespace('ftbot');
const layoutNs = namespace('layout');

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

  @layoutNs.Getter getTradingLayout!: GridItemData[];

  @layoutNs.Mutation setTradingLayout;

  get gridLayout(): GridItemData[] {
    return this.getTradingLayout;
  }

  get gridLayoutReload(): GridItemData {
    return findGridLayout(this.gridLayout, TradeLayout.reloadControl);
  }

  get gridLayoutBotControls(): GridItemData {
    return findGridLayout(this.gridLayout, TradeLayout.botControls);
  }

  get gridLayoutMultiPane(): GridItemData {
    return findGridLayout(this.gridLayout, TradeLayout.multiPane);
  }

  get gridLayoutOpenTrades(): GridItemData {
    return findGridLayout(this.gridLayout, TradeLayout.openTrades);
  }

  get gridLayoutTradeHistory(): GridItemData {
    return findGridLayout(this.gridLayout, TradeLayout.tradeHistory);
  }

  get gridLayoutLogView(): GridItemData {
    return findGridLayout(this.gridLayout, TradeLayout.logView);
  }

  layoutUpdatedEvent(newLayout) {
    this.setTradingLayout(newLayout);
  }
}
</script>

<style scoped></style>
