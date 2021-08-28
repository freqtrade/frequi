<template>
  <div class="d-flex flex-column h-100">
    <!-- <div v-if="isWebserverMode" class="mr-auto ml-3"> -->
    <!-- Currently only available in Webserver mode -->
    <!-- <b-checkbox v-model="historicView">HistoricData</b-checkbox> -->
    <!-- </div> -->
    <div v-if="historicView" class="mx-md-3 mt-2">
      <div class="d-flex flex-wrap">
        <div class="col-md-3 text-left">
          <span>Strategy</span>
          <StrategySelect v-model="strategy" class="mt-1"></StrategySelect>
        </div>
        <div class="col-md-3 text-left">
          <span>Timeframe</span>
          <TimeframeSelect v-model="selectedTimeframe" class="mt-1" />
        </div>
        <TimeRangeSelect v-model="timerange" class="col-12 col-md-5 mr-md-2"></TimeRangeSelect>
      </div>
    </div>

    <div class="mx-2 mt-2 pb-1 h-100">
      <CandleChartContainer
        :available-pairs="historicView ? pairlist : whitelist"
        :historic-view="historicView"
        :timeframe="historicView ? selectedTimeframe : timeframe"
        :trades="trades"
        :timerange="historicView ? timerange : ''"
        :strategy="historicView ? strategy : ''"
        :plot-config-modal="false"
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
import { AvailablePairPayload, AvailablePairResult, Trade, WhitelistResponse } from '@/types';
import { BotStoreGetters } from '@/store/modules/ftbot';

const ftbot = namespace('ftbot');

@Component({
  components: { CandleChartContainer, StrategySelect, TimeRangeSelect, TimeframeSelect },
})
export default class Graphs extends Vue {
  historicView = false;

  strategy = '';

  timerange = '';

  selectedTimeframe = '';

  @ftbot.Getter [BotStoreGetters.pairlist]!: string[];

  @ftbot.Getter [BotStoreGetters.whitelist]!: string[];

  @ftbot.Getter [BotStoreGetters.trades]!: Trade[];

  @ftbot.Getter [BotStoreGetters.timeframe]!: string;

  @ftbot.Getter [BotStoreGetters.isWebserverMode]!: boolean;

  @ftbot.Action public getWhitelist!: () => Promise<WhitelistResponse>;

  @ftbot.Action public getAvailablePairs!: (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    payload: AvailablePairPayload,
  ) => Promise<AvailablePairResult>;

  mounted() {
    this.historicView = this.isWebserverMode;
    if (!this.whitelist || this.whitelist.length === 0) {
      this.getWhitelist();
    }
    if (this.historicView) {
      // this.refresh();
      this.getAvailablePairs({ timeframe: this.timeframe }).then((val) => {
        // console.log(val);
      });
    }
  }
}
</script>

<style scoped></style>
