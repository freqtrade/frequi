<script setup lang="ts">
import type { GridItemData } from '@/types';

import { useLayoutStore, findGridLayout, TradeLayout } from '@/stores/layout';
import { useBotStore } from '@/stores/ftbotwrapper';

const botStore = useBotStore();
const layoutStore = useLayoutStore();
const settingsStore = useSettingsStore();
const currentBreakpoint = ref('');

const breakpointChanged = (newBreakpoint: string) => {
  // console.log('breakpoint:', newBreakpoint);
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
    return layoutStore.tradingLayout;
  }
  return [...layoutStore.getTradingLayoutSm];
});

const gridLayoutMultiPane = computed(() => {
  return findGridLayout(gridLayoutData.value, TradeLayout.multiPane);
});

const gridLayoutOpenTrades = computed(() => {
  return findGridLayout(gridLayoutData.value, TradeLayout.openTrades);
});

const gridLayoutTradeHistory = computed(() => {
  return findGridLayout(gridLayoutData.value, TradeLayout.tradeHistory);
});

const gridLayoutTradeDetail = computed(() => {
  return findGridLayout(gridLayoutData.value, TradeLayout.tradeDetail);
});

const gridLayoutChartView = computed(() => {
  return findGridLayout(gridLayoutData.value, TradeLayout.chartView);
});

const responsiveGridLayouts = computed(() => {
  return {
    sm: layoutStore.getTradingLayoutSm,
  };
});
</script>

<template>
  <GridLayout
    class="h-100 w-100"
    style="padding: 1px"
    :row-height="50"
    :layout="gridLayoutData"
    :vertical-compact="false"
    :margin="[1, 1]"
    :responsive-layouts="responsiveGridLayouts"
    :is-resizable="!isLayoutLocked"
    :is-draggable="!isLayoutLocked"
    :responsive="true"
    :cols="{ lg: 12, md: 12, sm: 12, xs: 4, xxs: 2 }"
    :col-num="12"
    @update:breakpoint="breakpointChanged"
  >
    <template #default="{ gridItemProps }">
      <GridItem
        v-if="gridLayoutMultiPane.h != 0"
        v-bind="gridItemProps"
        :i="gridLayoutMultiPane.i"
        :x="gridLayoutMultiPane.x"
        :y="gridLayoutMultiPane.y"
        :w="gridLayoutMultiPane.w"
        :h="gridLayoutMultiPane.h"
        drag-allow-from=".card-header"
      >
        <DraggableContainer header="Multi Pane">
          <div class="mt-1 d-flex justify-content-center">
            <BotControls class="mt-1 mb-2" />
          </div>
          <BTabs content-class="mt-3 mx-1" class="mt-1">
            <BTab title="Pairs combined" active>
              <template #title>
                <div title="Pairs combined"></div>
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1"
                  >Pairs combined</span
                >
                <i-mdi-view-list v-else />
              </template>
              <PairSummary
                :pairlist="botStore.activeBot.whitelist"
                :current-locks="botStore.activeBot.activeLocks"
                :trades="botStore.activeBot.openTrades"
              />
            </BTab>
            <BTab title="General">
              <template #title>
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">General</span>
                <i-mdi-information v-else />
              </template>
              <BotStatus />
            </BTab>
            <BTab title="Performance" lazy>
              <template #title>
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">Performance</span>
                <i-mdi-chart-line v-else />
              </template>
              <BotPerformance />
            </BTab>
            <BTab title="Balance" lazy>
              <template #title>
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">Balance</span>
                <i-mdi-bank v-else />
              </template>
              <BotBalance />
            </BTab>
            <BTab title="Time Breakdown" lazy>
              <template #title>
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1"
                  >Time Breakdown</span
                >
                <i-mdi-folder-clock v-else />
              </template>
              <PeriodBreakdown />
            </BTab>

            <BTab title="Pairlist" lazy>
              <template #title>
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">Pairlist</span>
                <i-mdi-format-list-group v-else />
              </template>
              <PairListLive />
            </BTab>
            <BTab title="Pair Locks" lazy>
              <template #title>
                <span v-if="settingsStore.multiPaneButtonsShowText" class="ms-1">Pair Locks</span>
                <i-mdi-lock-alert v-else />
              </template>
              <PairLockList />
            </BTab>
          </BTabs>
        </DraggableContainer>
      </GridItem>
      <GridItem
        v-if="gridLayoutOpenTrades.h != 0"
        v-bind="gridItemProps"
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
            :trades="botStore.activeBot.openTrades"
            title="Open trades"
            :active-trades="true"
            empty-text="Currently no open trades."
          />
        </DraggableContainer>
      </GridItem>
      <GridItem
        v-if="gridLayoutTradeHistory.h != 0"
        v-bind="gridItemProps"
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
            :trades="botStore.activeBot.closedTrades"
            title="Trade history"
            :show-filter="true"
            empty-text="No closed trades so far."
          />
        </DraggableContainer>
      </GridItem>
      <GridItem
        v-if="
          botStore.activeBot.detailTradeId &&
          botStore.activeBot.tradeDetail &&
          gridLayoutTradeDetail.h != 0
        "
        v-bind="gridItemProps"
        :i="gridLayoutTradeDetail.i"
        :x="gridLayoutTradeDetail.x"
        :y="gridLayoutTradeDetail.y"
        :w="gridLayoutTradeDetail.w"
        :h="gridLayoutTradeDetail.h"
        :min-h="4"
        drag-allow-from=".card-header"
      >
        <DraggableContainer header="Trade Detail">
          <TradeDetail
            :trade="botStore.activeBot.tradeDetail"
            :stake-currency="botStore.activeBot.stakeCurrency"
          />
        </DraggableContainer>
      </GridItem>
      <GridItem
        v-if="gridLayoutTradeDetail.h != 0"
        v-bind="gridItemProps"
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
            :available-pairs="botStore.activeBot.whitelist"
            :historic-view="!!false"
            :timeframe="botStore.activeBot.timeframe"
            :trades="botStore.activeBot.allTrades"
          >
          </CandleChartContainer>
        </DraggableContainer>
      </GridItem>
    </template>
  </GridLayout>
</template>
