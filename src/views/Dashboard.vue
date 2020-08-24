<template>
  <div>
    <DailyChart v-if="dailyStats.data" :dailyStats="dailyStats" />
    <CumProfitChart :trades="closedTrades" />
    <HourlyChart :trades="closedTrades" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

import DailyChart from '@/components/charts/DailyChart.vue';
import HourlyChart from '@/components/charts/HourlyChart.vue';
import CumProfitChart from '@/components/charts/CumProfitChart.vue';

import { Trade, DailyReturnValue } from '@/store/types';

const ftbot = namespace('ftbot');

@Component({
  components: {
    DailyChart,
    HourlyChart,
    CumProfitChart,
  },
})
export default class Trading extends Vue {
  @ftbot.Getter closedTrades!: Array<Trade>;

  @ftbot.State dailyStats!: DailyReturnValue;

  @ftbot.Action getDaily;

  @ftbot.Action getTrades;

  mounted() {
    this.getDaily();
    this.getTrades();
  }
}
</script>

<style scoped></style>
