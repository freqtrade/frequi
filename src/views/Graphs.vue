<template>
  <div class="container-fluid">
    <div class="row mb-2">
      <div class="col-mb-2">
        <b-checkbox v-model="historicView">HistoricData</b-checkbox>
      </div>
    </div>
    <div v-if="historicView" class="mt-2 row">
      <TimeRangeSelect v-model="timerange" class="col-md-4 mr-2"></TimeRangeSelect>
      <StrategyList v-model="strategy" class="col-md-2"></StrategyList>
    </div>

    <div class="row chart-row">
      <CandleChartContainer
        :available-pairs="historicView ? pairlist : whitelist"
        :historic-view="historicView"
        :timeframe="timeframe"
        :trades="trades"
        :timerange="historicView ? timerange : ''"
        :strategy="historicView ? strategy : ''"
      >
      </CandleChartContainer>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import CandleChartContainer from '@/components/charts/CandleChartContainer.vue';
import TimeRangeSelect from '@/components/ftbot/TimeRangeSelect.vue';
import StrategyList from '@/components/ftbot/StrategyList.vue';
import { AvailablePairPayload, AvailablePairResult, WhitelistResponse } from '@/types';
import { BotStoreGetters } from '@/store/modules/ftbot';

const ftbot = namespace('ftbot');

@Component({
  components: { CandleChartContainer, StrategyList, TimeRangeSelect },
})
export default class Graphs extends Vue {
  historicView = false;

  strategy = '';

  timerange = '';

  @ftbot.State pairlist;

  @ftbot.State whitelist;

  @ftbot.State trades;

  @ftbot.Getter [BotStoreGetters.timeframe]!: string;

  @ftbot.Action public getWhitelist!: () => Promise<WhitelistResponse>;

  @ftbot.Action public getAvailablePairs!: (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    payload: AvailablePairPayload,
  ) => Promise<AvailablePairResult>;

  mounted() {
    this.getWhitelist();
    // this.refresh();
    this.getAvailablePairs({ timeframe: this.timeframe }).then((val) => {
      console.log(val);
    });
  }
}
</script>

<style scoped>
.chart-row {
  height: 820px;
}
</style>
