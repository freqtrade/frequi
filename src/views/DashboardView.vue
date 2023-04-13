<template>
  <grid-layout
    class="h-100 w-100"
    :row-height="50"
    :layout="gridLayoutData"
    :vertical-compact="false"
    :margin="[5, 5]"
    :responsive-layouts="responsiveGridLayouts"
    :is-resizable="!isLayoutLocked"
    :is-draggable="!isLayoutLocked"
    :responsive="true"
    :prevent-collision="true"
    :cols="{ lg: 12, md: 12, sm: 12, xs: 4, xxs: 2 }"
    :col-num="12"
    @layout-updated="layoutUpdatedEvent"
    @breakpoint-changed="breakpointChanged"
  >
    <template #default="{ gridItemProps }">
      <grid-item
        v-bind="gridItemProps"
        :i="gridLayoutDaily.i"
        :x="gridLayoutDaily.x"
        :y="gridLayoutDaily.y"
        :w="gridLayoutDaily.w"
        :h="gridLayoutDaily.h"
        :min-w="3"
        :min-h="4"
        drag-allow-from=".drag-header"
      >
        <DraggableContainer :header="`Daily Profit ${botStore.botCount > 1 ? 'combined' : ''}`">
          <DailyChart
            v-if="botStore.allDailyStatsSelectedBots"
            :daily-stats="botStore.allDailyStatsSelectedBots"
            :show-title="false"
          />
        </DraggableContainer>
      </grid-item>
      <grid-item
        v-bind="gridItemProps"
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
      </grid-item>
      <grid-item
        v-bind="gridItemProps"
        :i="gridLayoutAllOpenTrades.i"
        :x="gridLayoutAllOpenTrades.x"
        :y="gridLayoutAllOpenTrades.y"
        :w="gridLayoutAllOpenTrades.w"
        :h="gridLayoutAllOpenTrades.h"
        :min-w="3"
        :min-h="4"
        drag-allow-from=".drag-header"
      >
        <DraggableContainer>
          <template #header>
            <div class="d-flex justify-content-center">
              Open Trades
              <InfoBox
                class="ms-2"
                hint="Open trades of all selected bots. Click on a trade to go to the trade page for that trade/bot."
              />
            </div>
          </template>
          <trade-list active-trades :trades="botStore.allOpenTradesSelectedBots" multi-bot-view />
        </DraggableContainer>
      </grid-item>
      <grid-item
        v-bind="gridItemProps"
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
          <CumProfitChart :trades="botStore.allTradesSelectedBots" :show-title="false" />
        </DraggableContainer>
      </grid-item>
      <grid-item
        v-bind="gridItemProps"
        :i="gridLayoutAllClosedTrades.i"
        :x="gridLayoutAllClosedTrades.x"
        :y="gridLayoutAllClosedTrades.y"
        :w="gridLayoutAllClosedTrades.w"
        :h="gridLayoutAllClosedTrades.h"
        :min-w="3"
        :min-h="4"
        drag-allow-from=".drag-header"
      >
        <DraggableContainer>
          <template #header>
            <div class="d-flex justify-content-center">
              Closed Trades
              <InfoBox
                class="ms-2"
                hint="Closed trades for all selected bots. Click on a trade to go to the trade page for that trade/bot."
              />
            </div>
          </template>
          <trade-list
            :active-trades="false"
            show-filter
            :trades="botStore.allClosedTradesSelectedBots"
            multi-bot-view
          />
        </DraggableContainer>
      </grid-item>
      <grid-item
        v-bind="gridItemProps"
        :i="gridLayoutProfitDistribution.i"
        :x="gridLayoutProfitDistribution.x"
        :y="gridLayoutProfitDistribution.y"
        :w="gridLayoutProfitDistribution.w"
        :h="gridLayoutProfitDistribution.h"
        :min-w="3"
        :min-h="4"
        drag-allow-from=".drag-header"
      >
        <DraggableContainer header="Profit Distribution">
          <ProfitDistributionChart :trades="botStore.allTradesSelectedBots" :show-title="false" />
        </DraggableContainer>
      </grid-item>
      <grid-item
        v-bind="gridItemProps"
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
          <TradesLogChart :trades="botStore.allTradesSelectedBots" :show-title="false" />
        </DraggableContainer>
      </grid-item>
    </template>
  </grid-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

import DailyChart from '@/components/charts/DailyChart.vue';
import CumProfitChart from '@/components/charts/CumProfitChart.vue';
import TradesLogChart from '@/components/charts/TradesLog.vue';
import ProfitDistributionChart from '@/components/charts/ProfitDistributionChart.vue';
import BotComparisonList from '@/components/ftbot/BotComparisonList.vue';
import TradeList from '@/components/ftbot/TradeList.vue';
import DraggableContainer from '@/components/layout/DraggableContainer.vue';
import InfoBox from '@/components/general/InfoBox.vue';

import { DashboardLayout, findGridLayout, useLayoutStore } from '@/stores/layout';
import { useBotStore } from '@/stores/ftbotwrapper';
import { GridItemData } from '@/types';

const botStore = useBotStore();

const layoutStore = useLayoutStore();
const currentBreakpoint = ref('');

const breakpointChanged = (newBreakpoint) => {
  //   // console.log('breakpoint:', newBreakpoint);
  currentBreakpoint.value = newBreakpoint;
};
const isResizableLayout = computed(() =>
  ['', 'sm', 'md', 'lg', 'xl'].includes(currentBreakpoint.value),
);
const isLayoutLocked = computed(() => {
  return layoutStore.layoutLocked || !isResizableLayout.value;
});

const gridLayoutData = computed((): GridItemData[] => {
  if (isResizableLayout.value) {
    return layoutStore.dashboardLayout;
  }
  return [...layoutStore.getDashboardLayoutSm];
});

const layoutUpdatedEvent = (newLayout) => {
  if (isResizableLayout.value) {
    console.log('newlayout', newLayout);
    console.log('saving dashboard');
    layoutStore.dashboardLayout = newLayout;
  }
};

const gridLayoutDaily = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.dailyChart);
});

const gridLayoutBotComparison = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.botComparison);
});

const gridLayoutAllOpenTrades = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.allOpenTrades);
});
const gridLayoutAllClosedTrades = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.allClosedTrades);
});

const gridLayoutCumChart = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.cumChartChart);
});
const gridLayoutProfitDistribution = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.profitDistributionChart);
});
const gridLayoutTradesLogChart = computed((): GridItemData => {
  return findGridLayout(gridLayoutData.value, DashboardLayout.tradesLogChart);
});

const responsiveGridLayouts = computed(() => {
  return {
    sm: layoutStore.getDashboardLayoutSm,
  };
});

onMounted(async () => {
  await botStore.allGetDaily({ timescale: 30 });
  // botStore.activeBot.getTrades();
  botStore.activeBot.getOpenTrades();
  botStore.activeBot.getProfit();
});
</script>

<style scoped></style>
