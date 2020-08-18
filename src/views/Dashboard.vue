<template>
  <GridLayout class="h-100 w-100" :row-height="50" :layout="gridLayout">
    <GridItem
      :i="gridLayout[0].i"
      :x="gridLayout[0].x"
      :y="gridLayout[0].y"
      :w="gridLayout[0].w"
      :h="gridLayout[0].h"
    >
      <DailyChart v-if="dailyStats.data" :daily-stats="dailyStats" />
    </GridItem>
    <GridItem
      :i="gridLayout[1].i"
      :x="gridLayout[1].x"
      :y="gridLayout[1].y"
      :w="gridLayout[1].w"
      :h="gridLayout[1].h"
    >
      <HourlyChart :trades="closedTrades" />
    </GridItem>
    <GridItem
      :i="gridLayout[2].i"
      :x="gridLayout[2].x"
      :y="gridLayout[2].y"
      :w="gridLayout[2].w"
      :h="gridLayout[2].h"
    >
      <CumProfitChart :trades="closedTrades" />
    </GridItem>
  </GridLayout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import VueGridLayout from 'vue-grid-layout';

import DailyChart from '@/components/charts/DailyChart.vue';
import HourlyChart from '@/components/charts/HourlyChart.vue';
import CumProfitChart from '@/components/charts/CumProfitChart.vue';

import { Trade, DailyReturnValue } from '@/types';

const ftbot = namespace('ftbot');

@Component({
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    DailyChart,
    HourlyChart,
    CumProfitChart,
  },
})
export default class Trading extends Vue {
  @ftbot.Getter closedTrades!: Trade[];

  @ftbot.State dailyStats!: DailyReturnValue;

  @ftbot.Action getDaily;

  @ftbot.Action getTrades;

  public gridLayout = [
    { i: 'g-dailyChart', x: 0, y: 0, w: 4, h: 6 },
    { i: 'g-hourlyChart', x: 4, y: 0, w: 4, h: 6 },
    { i: 'g-cumChartChart', x: 4, y: 0, w: 4, h: 6 },
  ];

  mounted() {
    this.getDaily();
    this.getTrades();
  }
}
</script>

<style scoped></style>
