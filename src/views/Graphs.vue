<template>
  <div class="container-fluid">
    <div class="row mb-2">
      <div class="col-mb-2">
        <b-checkbox v-model="historicView">HistoricData</b-checkbox>
      </div>
      <div class="col-mb-2 ml-2 mr-2">
        <b-button @click="refresh">&#x21bb;</b-button>
      </div>
      <div class="col-mb-2">
        <b-select v-model="pair" :options="historicView ? pairlist : whitelist" @change="refresh">
        </b-select>
      </div>
    </div>
    <div v-if="historicView" class="mt-2 row">
      <TimeRangeSelect v-model="timerange" class="col-md-4 mr-2"></TimeRangeSelect>
      <StrategyList v-model="strategy" class="col-md-2"></StrategyList>
    </div>

    <div class="row">
      <CandleChartContainer
        :pair="pair"
        :timeframe="timeframe"
        :timeframems="timeframems"
        :dataset="dataset"
        :trades="trades"
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
import { AvailablePairPayload, PairCandlePayload, PairHistoryPayload } from '@/types';

const ftbot = namespace('ftbot');

@Component({
  components: { CandleChartContainer, StrategyList, TimeRangeSelect },
})
export default class Graphs extends Vue {
  pair = 'XRP/USDT';

  timeframe = '5m';

  timeframems = 300000;

  historicView = false;

  strategy = '';

  timerange = '';

  @ftbot.State pairlist;

  @ftbot.State candleData;

  @ftbot.State history;

  @ftbot.State whitelist;

  @ftbot.State trades;

  @ftbot.Action
  public getPairCandles!: (payload: PairCandlePayload) => void;

  @ftbot.Action
  public getPairHistory!: (payload: PairHistoryPayload) => void;

  @ftbot.Action
  public getWhitelist;

  @ftbot.Action
  public getAvailablePairs!: (payload: AvailablePairPayload) => void;

  mounted() {
    this.getWhitelist();
    this.refresh();
    this.getAvailablePairs({ timeframe: this.timeframe });
  }

  get dataset() {
    if (this.historicView) {
      return this.history[`${this.pair}__${this.timeframe}`];
    }
    return this.candleData[`${this.pair}__${this.timeframe}`];
  }

  refresh() {
    if (this.historicView) {
      this.getPairHistory({
        pair: this.pair,
        timeframe: this.timeframe,
        timerange: this.timerange,
        strategy: this.strategy,
      });
    } else {
      this.getPairCandles({ pair: this.pair, timeframe: this.timeframe, limit: 500 });
    }
  }
}
</script>

<style scoped></style>
