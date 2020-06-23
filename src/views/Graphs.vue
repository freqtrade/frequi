<template>
  <div class="container-fluid">
    <div class="row mb-2">
      <div class="col-mb-2">
        <b-form-select :options="whitelist" v-model="pair" @change="refresh"> </b-form-select>
      </div>
      <div class="col-mb-2"></div>
    </div>
    <div class="row">
      <CandleChart :pair="pair" :timeframe="timeframe" :dataset="dataset" :plotConfig="plotConfig">
      </CandleChart>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

import CandleChart from '@/components/ftbot/CandleChart.vue';

const ftbot = namespace('ftbot');

@Component({
  components: { CandleChart },
})
export default class Graphs extends Vue {
  pair = 'XRP/USDT';

  timeframe = '5m';

  @ftbot.State history;

  @ftbot.State whitelist;

  @ftbot.State plotConfig;

  @ftbot.Action
  public getPairHistory;

  @ftbot.Action
  public getWhitelist;

  @ftbot.Action
  public getPlotConfig;

  mounted() {
    this.getWhitelist();
    this.refresh();
  }

  get dataset() {
    return this.history[`${this.pair}__${this.timeframe}`];
  }

  refresh() {
    this.getPairHistory({ pair: this.pair, timeframe: this.timeframe, limit: 500 });

    this.getPlotConfig();
  }
}
</script>

<style scoped></style>
