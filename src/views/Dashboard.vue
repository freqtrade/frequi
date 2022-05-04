<template>
  <GridLayout
    class="h-100 w-100"
    :row-height="50"
    :layout="gridLayout"
    :vertical-compact="false"
    :margin="[5, 5]"
    :responsive-layouts="responsiveGridLayouts"
    :is-resizable="!isLayoutLocked"
    :is-draggable="!isLayoutLocked"
    :responsive="true"
    :prevent-collision="true"
    :cols="{ lg: 12, md: 12, sm: 12, xs: 4, xxs: 2 }"
    @layout-updated="layoutUpdatedEvent"
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
      <DraggableContainer :header="`Daily Profit ${botStore.botCount > 1 ? 'combined' : ''}`">
        <DailyChart
          v-if="botStore.allDailyStatsSelectedBots"
          :daily-stats="botStore.allDailyStatsSelectedBots"
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
        <trade-list
          :active-trades="true"
          :trades="botStore.allOpenTradesSelectedBots"
          multi-bot-view
        />
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
        <CumProfitChart :trades="botStore.allTradesSelectedBots" :show-title="false" />
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
        <TradesLogChart :trades="botStore.allTradesSelectedBots" :show-title="false" />
      </DraggableContainer>
    </GridItem>
  </GridLayout>
</template>

<script lang="ts">
import { formatPrice } from '@/shared/formatters';

import { GridLayout, GridItem, GridItemData } from 'vue-grid-layout';

import DailyChart from '@/components/charts/DailyChart.vue';
import CumProfitChart from '@/components/charts/CumProfitChart.vue';
import TradesLogChart from '@/components/charts/TradesLog.vue';
import BotComparisonList from '@/components/ftbot/BotComparisonList.vue';
import TradeList from '@/components/ftbot/TradeList.vue';
import DraggableContainer from '@/components/layout/DraggableContainer.vue';

import { defineComponent, ref, computed, onMounted } from '@vue/composition-api';
import { DashboardLayout, findGridLayout, useLayoutStore } from '@/stores/layout';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'Dashboard',
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
  setup() {
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
      return layoutStore.layoutLocked || !isResizableLayout;
    });

    const gridLayout = computed((): GridItemData[] => {
      if (isResizableLayout) {
        return layoutStore.dashboardLayout;
      }
      return [...layoutStore.getDashboardLayoutSm];
    });

    const layoutUpdatedEvent = (newLayout) => {
      if (isResizableLayout) {
        console.log('newlayout', newLayout);
        console.log('saving dashboard');
        layoutStore.dashboardLayout = newLayout;
      }
    };

    const gridLayoutDaily = computed((): GridItemData => {
      return findGridLayout(gridLayout.value, DashboardLayout.dailyChart);
    });

    const gridLayoutBotComparison = computed((): GridItemData => {
      return findGridLayout(gridLayout.value, DashboardLayout.botComparison);
    });

    const gridLayoutAllOpenTrades = computed((): GridItemData => {
      return findGridLayout(gridLayout.value, DashboardLayout.allOpenTrades);
    });

    const gridLayoutCumChart = computed((): GridItemData => {
      return findGridLayout(gridLayout.value, DashboardLayout.cumChartChart);
    });

    const gridLayoutTradesLogChart = computed((): GridItemData => {
      return findGridLayout(gridLayout.value, DashboardLayout.tradesLogChart);
    });

    const responsiveGridLayouts = computed(() => {
      return {
        sm: layoutStore.getDashboardLayoutSm,
      };
    });

    onMounted(async () => {
      await botStore.allGetDaily({ timescale: 30 });
      botStore.activeBot.getTrades();
      botStore.activeBot.getOpenTrades();
      botStore.activeBot.getProfit();
    });

    return {
      botStore,
      formatPrice,
      isLayoutLocked,
      layoutUpdatedEvent,
      breakpointChanged,
      gridLayout,
      gridLayoutDaily,
      gridLayoutBotComparison,
      gridLayoutAllOpenTrades,
      gridLayoutCumChart,
      gridLayoutTradesLogChart,
      responsiveGridLayouts,
    };
  },
});
</script>

<style scoped></style>
