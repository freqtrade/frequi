<template>
  <GridLayout
    class="h-100 w-100"
    :row-height="50"
    :layout.sync="gridLayout"
    :vertical-compact="false"
    :margin="[5, 5]"
    :responsive-layouts="responsiveGridLayouts"
    :is-resizable="!isLayoutLocked"
    :is-draggable="!isLayoutLocked"
    :responsive="true"
    :prevent-collision="true"
    @layout-updated="layoutUpdated"
    @breakpoint-changed="breakpointChanged"
  >
    <GridItem
      :i="gridLayoutDaily.i"
      :x="gridLayoutDaily.x"
      :y="gridLayoutDaily.y"
      :w="gridLayoutDaily.w"
      :h="gridLayoutDaily.h"
      :min-w="3"
      :min-h="4"
      drag-allow-from=".drag-header"
    >
      <DraggableContainer :header="`Daily Profit ${botCount > 1 ? 'combined' : ''}`">
        <DailyChart
          v-if="allDailyStatsAllBots"
          :daily-stats="allDailyStatsAllBots"
          :show-title="false"
        />
      </DraggableContainer>
    </GridItem>
    <GridItem
      :i="gridLayoutBotComparison.i"
      :x="gridLayoutBotComparison.x"
      :y="gridLayoutBotComparison.y"
      :w="gridLayoutBotComparison.w"
      :h="gridLayoutBotComparison.h"
      :min-w="3"
      :min-h="4"
      drag-allow-from=".drag-header"
    >
      <DraggableContainer header="Bot comparison">
        <bot-comparison-list />
      </DraggableContainer>
    </GridItem>
    <GridItem
      :i="gridLayoutAllOpenTrades.i"
      :x="gridLayoutAllOpenTrades.x"
      :y="gridLayoutAllOpenTrades.y"
      :w="gridLayoutAllOpenTrades.w"
      :h="gridLayoutAllOpenTrades.h"
      :min-w="3"
      :min-h="4"
      drag-allow-from=".drag-header"
    >
      <DraggableContainer header="Open Trades">
        <trade-list :active-trades="true" :trades="allOpenTradesAllBots" />
      </DraggableContainer>
    </GridItem>
    <GridItem
      :i="gridLayoutCumChart.i"
      :x="gridLayoutCumChart.x"
      :y="gridLayoutCumChart.y"
      :w="gridLayoutCumChart.w"
      :h="gridLayoutCumChart.h"
      :min-w="3"
      :min-h="4"
      drag-allow-from=".drag-header"
    >
      <DraggableContainer header="Cumulative Profit">
        <CumProfitChart :trades="allTradesAllBots" :show-title="false" />
      </DraggableContainer>
    </GridItem>
    <GridItem
      :i="gridLayoutTradesLogChart.i"
      :x="gridLayoutTradesLogChart.x"
      :y="gridLayoutTradesLogChart.y"
      :w="gridLayoutTradesLogChart.w"
      :h="gridLayoutTradesLogChart.h"
      :min-w="3"
      :min-h="4"
      drag-allow-from=".drag-header"
    >
      <DraggableContainer header="Trades Log">
        <TradesLogChart :trades="allTradesAllBots" :show-title="false" />
      </DraggableContainer>
    </GridItem>
  </GridLayout>
</template>

<script lang="ts">
import { formatPrice } from '@/shared/formatters';

import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { GridLayout, GridItem, GridItemData } from 'vue-grid-layout';

import DailyChart from '@/components/charts/DailyChart.vue';
import CumProfitChart from '@/components/charts/CumProfitChart.vue';
import TradesLogChart from '@/components/charts/TradesLog.vue';
import BotComparisonList from '@/components/ftbot/BotComarisonList.vue';
import TradeList from '@/components/ftbot/TradeList.vue';
import DraggableContainer from '@/components/layout/DraggableContainer.vue';

import {
  DashboardLayout,
  findGridLayout,
  LayoutActions,
  LayoutGetters,
} from '@/store/modules/layout';
import { Trade, DailyReturnValue, DailyPayload, ClosedTrade } from '@/types';
import { BotStoreGetters } from '@/store/modules/ftbot';
import { MultiBotStoreGetters } from '@/store/modules/botStoreWrapper';

const ftbot = namespace('ftbot');
const layoutNs = namespace('layout');

@Component({
  components: {
    GridLayout,
    GridItem,
    DailyChart,
    CumProfitChart,
    TradesLogChart,
    BotComparisonList,
    TradeList,
    DraggableContainer,
  },
})
export default class Dashboard extends Vue {
  @ftbot.Getter [MultiBotStoreGetters.botCount]!: number;

  @ftbot.Getter [MultiBotStoreGetters.allOpenTradesAllBots]!: Trade[];

  @ftbot.Getter [MultiBotStoreGetters.allTradesAllBots]!: ClosedTrade[];

  @ftbot.Getter [MultiBotStoreGetters.allDailyStatsAllBots]!: Record<string, DailyReturnValue>;

  @ftbot.Getter [BotStoreGetters.performanceStats]!: PerformanceEntry[];

  @ftbot.Action getPerformance;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action allGetDaily!: (payload?: DailyPayload) => void;

  @ftbot.Action getTrades;

  @ftbot.Action getOpenTrades;

  @ftbot.Action getProfit;

  @layoutNs.Getter [LayoutGetters.getDashboardLayoutSm]!: GridItemData[];

  @layoutNs.Getter [LayoutGetters.getDashboardLayout]!: GridItemData[];

  @layoutNs.Action [LayoutActions.setDashboardLayout];

  @layoutNs.Getter [LayoutGetters.getLayoutLocked]: boolean;

  formatPrice = formatPrice;

  localGridLayout: GridItemData[] = [];

  currentBreakpoint = '';

  get isLayoutLocked() {
    return this.getLayoutLocked || !this.isResizableLayout;
  }

  get isResizableLayout() {
    return ['', 'md', 'lg', 'xl'].includes(this.currentBreakpoint);
  }

  get gridLayout() {
    if (this.isResizableLayout) {
      return this.getDashboardLayout;
    }
    return this.localGridLayout;
  }

  set gridLayout(newLayout) {
    // Dummy setter to make gridLayout happy. Updates happen through layoutUpdated.
  }

  layoutUpdated(newLayout) {
    // Frozen layouts for small screen sizes.
    if (this.isResizableLayout) {
      console.log('newlayout', newLayout);
      console.log('saving dashboard');
      this.setDashboardLayout(newLayout);
    }
  }

  get gridLayoutDaily(): GridItemData {
    return findGridLayout(this.gridLayout, DashboardLayout.dailyChart);
  }

  get gridLayoutBotComparison(): GridItemData {
    return findGridLayout(this.gridLayout, DashboardLayout.botComparison);
  }

  get gridLayoutAllOpenTrades(): GridItemData {
    return findGridLayout(this.gridLayout, DashboardLayout.allOpenTrades);
  }

  get gridLayoutCumChart(): GridItemData {
    return findGridLayout(this.gridLayout, DashboardLayout.cumChartChart);
  }

  get gridLayoutTradesLogChart(): GridItemData {
    return findGridLayout(this.gridLayout, DashboardLayout.tradesLogChart);
  }

  get responsiveGridLayouts() {
    return {
      sm: this.getDashboardLayoutSm,
    };
  }

  mounted() {
    this.allGetDaily({ timescale: 30 });
    this.getTrades();
    this.getOpenTrades();
    this.getPerformance();
    this.getProfit();
    this.localGridLayout = [...this.getDashboardLayoutSm];
  }

  breakpointChanged(newBreakpoint) {
    // console.log('breakpoint:', newBreakpoint);
    this.currentBreakpoint = newBreakpoint;
  }
}
</script>

<style scoped></style>
