<template>
  <GridLayout
    class="h-100 w-100"
    :row-height="50"
    :layout="gridLayout"
    :vertical-compact="false"
    @layout-updated="layoutUpdatedEvent"
  >
    <GridItem
      :i="gridLayoutBotControls.i"
      :x="gridLayoutBotControls.x"
      :y="gridLayoutBotControls.y"
      :w="gridLayoutBotControls.w"
      :h="gridLayoutBotControls.h"
    >
      <DraggableContainer header="Bot Controls">
        <ReloadControl class="mt-3" />
        <BotControls />
      </DraggableContainer>
    </GridItem>
    <GridItem
      :i="gridLayoutMultiPane.i"
      :x="gridLayoutMultiPane.x"
      :y="gridLayoutMultiPane.y"
      :w="gridLayoutMultiPane.w"
      :h="gridLayoutMultiPane.h"
    >
      <DraggableContainer header="Multi Pane">
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
      </DraggableContainer>
    </GridItem>
    <GridItem
      :i="gridLayoutOpenTrades.i"
      :x="gridLayoutOpenTrades.x"
      :y="gridLayoutOpenTrades.y"
      :w="gridLayoutOpenTrades.w"
      :h="gridLayoutOpenTrades.h"
      drag-allow-from=".card-header"
    >
      <DraggableContainer header="Open Trades">
        <TradeList
          class="open-trades"
          :trades="openTrades"
          title="Open trades"
          :active-trades="true"
          empty-text="Currently no open trades."
        />
      </DraggableContainer>
    </GridItem>
    <GridItem
      :i="gridLayoutTradeHistory.i"
      :x="gridLayoutTradeHistory.x"
      :y="gridLayoutTradeHistory.y"
      :w="gridLayoutTradeHistory.w"
      :h="gridLayoutTradeHistory.h"
      drag-allow-from=".card-header"
    >
      <DraggableContainer header="Closed Trades">
        <TradeList
          class="trade-history"
          :trades="closedTrades"
          title="Trade history"
          empty-text="No closed trades so far."
        />
      </DraggableContainer>
    </GridItem>
    <GridItem
      v-if="detailTradeId"
      :i="gridLayoutTradeDetail.i"
      :x="gridLayoutTradeDetail.x"
      :y="gridLayoutTradeDetail.y"
      :w="gridLayoutTradeDetail.w"
      :h="gridLayoutTradeDetail.h"
      drag-allow-from=".card-header"
    >
      <DraggableContainer header="Trade Detail">
        <TradeDetail :trade="tradeDetail"> </TradeDetail>
      </DraggableContainer>
    </GridItem>
    <GridItem
      :i="gridLayoutLogView.i"
      :x="gridLayoutLogView.x"
      :y="gridLayoutLogView.y"
      :w="gridLayoutLogView.w"
      :h="gridLayoutLogView.h"
    >
      <DraggableContainer header="Logs">
        <LogViewer />
      </DraggableContainer>
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
import DraggableContainer from '@/components/layout/DraggableContainer.vue';

import { Trade } from '@/types';
import { UserStoreGetters } from '@/store/modules/ftbot';
import { TradeLayout, findGridLayout } from '@/store/modules/layout';

const ftbot = namespace('ftbot');
const layoutNs = namespace('layout');

@Component({
  components: {
    GridLayout,
    GridItem,
    DraggableContainer,
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

  get gridLayoutTradeDetail(): GridItemData {
    return findGridLayout(this.gridLayout, TradeLayout.tradeDetail);
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
