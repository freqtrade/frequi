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
      :i="gridLayoutKPI.i"
      :x="gridLayoutKPI.x"
      :y="gridLayoutKPI.y"
      :w="gridLayoutKPI.w"
      :h="gridLayoutKPI.h"
      :min-w="3"
      :min-h="4"
      drag-allow-from=".drag-header"
    >
      <DraggableContainer header="Bot KPI">
        <b-card-group deck>
          <b-card header="Open / Total trades">
            <b-card-text>
              <span class="text-primary">{{ openTrades.length }}</span> /
              <span class="text">{{ profit.trade_count }}</span>
            </b-card-text>
          </b-card>
          <b-card header="Won / lost trades">
            <b-card-text>
              <span class="text-success">{{ profit.winning_trades }}</span> /
              <span class="text-danger">{{ profit.losing_trades }}</span>
            </b-card-text>
          </b-card>
          <b-card header="Last trade">
            <b-card-text>{{ profit.latest_trade_date }}</b-card-text>
          </b-card>
        </b-card-group>
        <b-card-group deck class="mt-2">
          <b-card header="Best performing">
            <b-card-text>{{ profit.best_pair }}</b-card-text>
          </b-card>
          <b-card header="Total Balance">
            <b-card-text
              >{{ formatPrice(balance.total, botState.stake_currency_decimals || 8) }}
              {{ dailyStats.stake_currency }}</b-card-text
            >
          </b-card>
          <b-card v-if="profit.profit_closed_fiat" header="Total profit">
            <b-card-text
              >{{ formatPrice(profit.profit_closed_fiat, 2) }}
              {{ dailyStats.fiat_display_currency }}</b-card-text
            >
          </b-card>
        </b-card-group>
      </DraggableContainer>
    </GridItem>
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
      <DraggableContainer header="Daily Profit">
        <DailyChart v-if="dailyStats.data" :daily-stats="dailyStats" :show-title="false" />
      </DraggableContainer>
    </GridItem>
    <GridItem
      :i="gridLayoutHourly.i"
      :x="gridLayoutHourly.x"
      :y="gridLayoutHourly.y"
      :w="gridLayoutHourly.w"
      :h="gridLayoutHourly.h"
      :min-w="3"
      :min-h="4"
      drag-allow-from=".drag-header"
    >
      <DraggableContainer header="Hourly Profit">
        <HourlyChart :trades="closedTrades" :show-title="false" />
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
        <CumProfitChart :trades="closedTrades" :show-title="false" />
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
        <TradesLogChart :trades="closedTrades" :show-title="false" />
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
import HourlyChart from '@/components/charts/HourlyChart.vue';
import CumProfitChart from '@/components/charts/CumProfitChart.vue';
import TradesLogChart from '@/components/charts/TradesLog.vue';
import DraggableContainer from '@/components/layout/DraggableContainer.vue';

import {
  DashboardLayout,
  findGridLayout,
  LayoutActions,
  LayoutGetters,
} from '@/store/modules/layout';
import {
  Trade,
  DailyReturnValue,
  BalanceInterface,
  ProfitInterface,
  DailyPayload,
  BotState,
} from '@/types';
import { BotStoreGetters } from '@/store/modules/ftbot';

const ftbot = namespace('ftbot');
const layoutNs = namespace('layout');

@Component({
  components: {
    GridLayout,
    GridItem,
    DailyChart,
    HourlyChart,
    CumProfitChart,
    TradesLogChart,
    DraggableContainer,
  },
})
export default class Dashboard extends Vue {
  @ftbot.Getter closedTrades!: Trade[];

  @ftbot.Getter [BotStoreGetters.dailyStats]!: DailyReturnValue;

  @ftbot.Getter [BotStoreGetters.openTrades]!: Array<Trade>;

  @ftbot.Getter [BotStoreGetters.balance]!: BalanceInterface;

  @ftbot.Getter [BotStoreGetters.botState]?: BotState;

  @ftbot.Getter [BotStoreGetters.profit]!: ProfitInterface;

  @ftbot.Getter [BotStoreGetters.performanceStats]!: PerformanceEntry[];

  @ftbot.Action getPerformance;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action getDaily!: (payload?: DailyPayload) => void;

  @ftbot.Action getTrades;

  @layoutNs.Getter [LayoutGetters.getDashboardLayoutSm]!: GridItemData[];

  @layoutNs.Getter [LayoutGetters.getDashboardLayout]!: GridItemData[];

  @layoutNs.Action [LayoutActions.setDashboardLayout];

  @layoutNs.Getter [LayoutGetters.getLayoutLocked]: boolean;

  @ftbot.Action getOpenTrades;

  @ftbot.Action getBalance;

  @ftbot.Action getProfit;

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

  get gridLayoutKPI(): GridItemData {
    return findGridLayout(this.gridLayout, DashboardLayout.KPI);
  }

  get gridLayoutDaily(): GridItemData {
    return findGridLayout(this.gridLayout, DashboardLayout.dailyChart);
  }

  get gridLayoutHourly(): GridItemData {
    return findGridLayout(this.gridLayout, DashboardLayout.hourlyChart);
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
    this.getDaily({ timescale: 30 });
    this.getTrades();
    this.getOpenTrades();
    this.getBalance();
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
