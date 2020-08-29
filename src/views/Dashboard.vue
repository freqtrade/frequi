<template>
  <GridLayout
    class="h-100 w-100"
    :row-height="50"
    :layout="gridLayout"
    :vertical-compact="false"
    @layout-updated="layoutUpdatedEvent"
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
  </GridLayout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { GridLayout, GridItem, GridItemData } from 'vue-grid-layout';

import DailyChart from '@/components/charts/DailyChart.vue';
import HourlyChart from '@/components/charts/HourlyChart.vue';
import CumProfitChart from '@/components/charts/CumProfitChart.vue';
import DraggableContainer from '@/components/layout/DraggableContainer.vue';

import { Trade, DailyReturnValue } from '@/types';
import { DashboardLayout, findGridLayout } from '@/store/modules/layout';

const ftbot = namespace('ftbot');
const layoutNs = namespace('layout');

@Component({
  components: {
    GridLayout,
    GridItem,
    DailyChart,
    HourlyChart,
    CumProfitChart,
    DraggableContainer,
  },
})
export default class Dashboard extends Vue {
  @ftbot.Getter closedTrades!: Trade[];

  @ftbot.State dailyStats!: DailyReturnValue;

  @ftbot.Action getDaily;

  @ftbot.Action getTrades;

  @layoutNs.Getter getDashboardLayout!: GridItemData[];

  @layoutNs.Mutation setDashboardLayout;

  get gridLayout() {
    return this.getDashboardLayout;
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

  mounted() {
    this.getDaily();
    this.getTrades();
  }

  layoutUpdatedEvent(newLayout) {
    this.setDashboardLayout(newLayout);
  }
}
</script>

<style scoped></style>
