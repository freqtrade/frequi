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
        <b-form-select :options="whitelist" v-model="pair" @change="refresh"> </b-form-select>
      </div>
    </div>
    <div class="mt-2" v-if="historicView">
      <TimeRangeSelect v-model="timerange"></TimeRangeSelect>
    </div>

    <div class="row">
      <CandleChart
        :pair="pair"
        :timeframe="timeframe"
        :timeframems="timeframems"
        :dataset="dataset"
        :trades="trades"
      >
      </CandleChart>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import CandleChart from '@/components/ftbot/CandleChart.vue';
import TimeRangeSelect from '@/components/ftbot/TimeRangeSelect.vue';
import { PairCandlePayload, PairHistoryPayload } from '@/store/types';

const ftbot = namespace('ftbot');
@Component({
  components: { CandleChart, TimeRangeSelect },
})
export default class Graphs extends Vue {
  pair = 'XRP/USDT';

  timeframe = '5m';

  timeframems = 300000;

  historicView = false;

  strategy = '';

  timerange = '';

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

  mounted() {
    this.getWhitelist();
    this.refresh();
    // eslint-disable-next-line @typescript-eslint/camelcase
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
