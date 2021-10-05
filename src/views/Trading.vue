<template>
  <GridLayout
    class="h-100 w-100"
    :row-height="50"
    :layout="gridLayout"
    :vertical-compact="false"
    :margin="[5, 5]"
    :is-resizable="!getLayoutLocked"
    :is-draggable="!getLayoutLocked"
    @layout-updated="layoutUpdatedEvent"
  >
    <GridItem
      :i="gridLayoutMultiPane.i"
      :x="gridLayoutMultiPane.x"
      :y="gridLayoutMultiPane.y"
      :w="gridLayoutMultiPane.w"
      :h="gridLayoutMultiPane.h"
      drag-allow-from=".card-header"
    >
      <DraggableContainer header="Multi Pane">
        <b-tabs content-class="mt-3" class="mt-1">
          <b-tab title="Pairs combined" active>
            <PairSummary :pairlist="whitelist" :current-locks="currentLocks" :trades="openTrades" />
          </b-tab>
          <b-tab title="General">
            <div class="d-flex justify-content-center">
              <BotControls class="mt-1 mb-2" />
            </div>
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
          <b-tab title="Pair Locks" lazy>
            <PairLockList />
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
      :min-h="4"
      drag-allow-from=".card-header"
    >
      <DraggableContainer header="Trade Detail">
        <TradeDetail :trade="tradeDetail"> </TradeDetail>
      </DraggableContainer>
    </GridItem>
    <GridItem
      :i="gridLayoutChartView.i"
      :x="gridLayoutChartView.x"
      :y="gridLayoutChartView.y"
      :w="gridLayoutChartView.w"
      :h="gridLayoutChartView.h"
      :min-h="6"
      drag-allow-from=".card-header"
    >
      <DraggableContainer header="Chart">
        <CandleChartContainer
          :available-pairs="whitelist"
          :historic-view="!!false"
          :timeframe="timeframe"
          :trades="allTrades"
        >
        </CandleChartContainer>
      </DraggableContainer>
    </GridItem>
  </GridLayout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { GridLayout, GridItem, GridItemData } from 'vue-grid-layout';

import Balance from '@/components/ftbot/Balance.vue';
import BotControls from '@/components/ftbot/BotControls.vue';
import BotStatus from '@/components/ftbot/BotStatus.vue';
import CandleChartContainer from '@/components/charts/CandleChartContainer.vue';
import DailyStats from '@/components/ftbot/DailyStats.vue';
import DraggableContainer from '@/components/layout/DraggableContainer.vue';
import FTBotAPIPairList from '@/components/ftbot/FTBotAPIPairList.vue';
import PairLockList from '@/components/ftbot/PairLockList.vue';
import PairSummary from '@/components/ftbot/PairSummary.vue';
import Performance from '@/components/ftbot/Performance.vue';
import TradeDetail from '@/components/ftbot/TradeDetail.vue';
import TradeList from '@/components/ftbot/TradeList.vue';

import { Lock, Trade } from '@/types';
import { BotStoreGetters } from '@/store/modules/ftbot';
import { TradeLayout, findGridLayout, LayoutGetters, LayoutActions } from '@/store/modules/layout';

const ftbot = namespace('ftbot');
const layoutNs = namespace('layout');

@Component({
  components: {
    Balance,
    BotControls,
    BotStatus,
    CandleChartContainer,
    DailyStats,
    DraggableContainer,
    FTBotAPIPairList,
    GridItem,
    GridLayout,
    PairLockList,
    PairSummary,
    Performance,
    TradeDetail,
    TradeList,
  },
})
export default class Trading extends Vue {
  @ftbot.Getter [BotStoreGetters.detailTradeId]!: number;

  @ftbot.Getter [BotStoreGetters.openTrades]!: Trade[];

  @ftbot.Getter [BotStoreGetters.closedTrades]!: Trade[];

  @ftbot.Getter [BotStoreGetters.allTrades]!: Trade[];

  @ftbot.Getter [BotStoreGetters.tradeDetail]!: Trade;

  @ftbot.Getter [BotStoreGetters.timeframe]!: string;

  @ftbot.Getter [BotStoreGetters.currentLocks]!: Lock[];

  @ftbot.Getter [BotStoreGetters.whitelist]!: string[];

  @layoutNs.Getter [LayoutGetters.getTradingLayout]!: GridItemData[];

  @layoutNs.Action [LayoutActions.setTradingLayout];

  @layoutNs.Getter [LayoutGetters.getLayoutLocked]: boolean;

  get gridLayout(): GridItemData[] {
    return this.getTradingLayout;
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

  get gridLayoutChartView(): GridItemData {
    return findGridLayout(this.gridLayout, TradeLayout.chartView);
  }

  layoutUpdatedEvent(newLayout) {
    this.setTradingLayout(newLayout);
  }
}
</script>

<style scoped></style>
