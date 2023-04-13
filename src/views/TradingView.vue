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
    :cols="{ lg: 12, md: 12, sm: 12, xs: 4, xxs: 2 }"
    :col-num="12"
    @update:breakpoint="breakpointChanged"
  >
    <template #default="{ gridItemProps }">
      <grid-item
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
          <b-tabs content-class="mt-3" class="mt-1">
            <b-tab title="Pairs combined" active>
              <PairSummary
                :pairlist="botStore.activeBot.whitelist"
                :current-locks="botStore.activeBot.activeLocks"
                :trades="botStore.activeBot.openTrades"
              />
            </b-tab>
            <b-tab title="General">
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
      </grid-item>
      <grid-item
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
      </grid-item>
      <grid-item
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
          <trade-list
            class="trade-history"
            :trades="botStore.activeBot.closedTrades"
            title="Trade history"
            :show-filter="true"
            empty-text="No closed trades so far."
          />
        </DraggableContainer>
      </grid-item>
      <grid-item
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
      </grid-item>
      <grid-item
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
      </grid-item>
    </template>
  </grid-layout>
</template>

<script setup lang="ts">
import { GridItemData } from '@/types';

import Balance from '@/components/ftbot/BotBalance.vue.js';
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

import { ref, computed } from 'vue';
import { useLayoutStore, findGridLayout, TradeLayout } from '@/stores/layout';
import { useBotStore } from '@/stores/ftbotwrapper';

const botStore = useBotStore();
const layoutStore = useLayoutStore();
const currentBreakpoint = ref('');

const breakpointChanged = (newBreakpoint) => {
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

<style scoped></style>
