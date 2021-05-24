<template>
  <div class="d-flex flex-column h-100">
    <div v-if="false" class="mr-auto ml-3">
      <!-- Currently only available in Webserver mode -->
      <b-checkbox v-model="historicView">HistoricData</b-checkbox>
    </div>
    <div v-if="historicView" class="mx-3 mt-2">
      <b-card>
        <div class="mx-3 mt-2 d-flex">
          <TimeRangeSelect v-model="timerange" class="col-md-4 mr-2"></TimeRangeSelect>
          <div class="col-md-3 text-left">
            <span>Strategy</span>
            <StrategySelect v-model="strategy" class="mt-1"></StrategySelect>
          </div>
          <div class="col-md-3 text-left">
            <span>Timeframe</span>
            <TimeframeSelect v-model="selectedTimeframe" class="mt-1" />
          </div>
        </div>
      </b-card>
    </div>

    <div class="flex-fill mx-2 mt-1">
      <CandleChartContainer
        :available-pairs="historicView ? pairlist : whitelist"
        :historic-view="historicView"
        :timeframe="historicView ? selectedTimeframe : timeframe"
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
import TimeframeSelect from '@/components/ftbot/TimeframeSelect.vue';
import StrategySelect from '@/components/ftbot/StrategySelect.vue';
import { AvailablePairPayload, AvailablePairResult, WhitelistResponse } from '@/types';
import { BotStoreGetters } from '@/store/modules/ftbot';

const ftbot = namespace('ftbot');

@Component({
  components: { CandleChartContainer, StrategySelect, TimeRangeSelect, TimeframeSelect },
})
export default class Graphs extends Vue {
  historicView = true;

  strategy = '';

  timerange = '';

  selectedTimeframe = '';

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
