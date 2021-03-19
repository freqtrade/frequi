<template>
  <div class="d-flex flex-column h-100">
    <div class="mr-auto ml-3">
      <b-checkbox v-model="historicView">HistoricData</b-checkbox>
    </div>
    <div v-if="historicView" class="mx-3 mt-2 d-flex">
      <TimeRangeSelect v-model="timerange" class="col-md-4 mr-2"></TimeRangeSelect>
      <StrategyList v-model="strategy" class="col-md-3"></StrategyList>
    </div>

    <div class="flex-fill mx-2 mt-1">
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

<style scoped></style>
