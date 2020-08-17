<template>
  <div>
    <DailyChart v-if="dailyStats.data" :dailyStats="dailyStats" />
    <HourlyChart :trades="closedTrades" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

import DailyChart from '@/components/charts/DailyChart.vue';
import HourlyChart from '@/components/charts/HourlyChart.vue';

import { Trade, DailyReturnValue } from '@/store/types';

const ftbot = namespace('ftbot');

@Component({
  components: {
    DailyChart,
    HourlyChart,
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
