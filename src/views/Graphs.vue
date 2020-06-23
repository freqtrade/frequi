<template>
  <div class="container-fluid">
    <div class="row mb-2">
      <div class="col-mb-2">
        <b-form-select :options="whitelist" v-model="pair" @change="refresh"> </b-form-select>
      </div>
      <div class="col-mb-2">
        <b-checkbox v-model="strategyPlotConfig">Use strategy plot_config</b-checkbox>
      </div>
    </div>
    <div v-if="!strategyPlotConfig" class="container-fluid">
      <div class="row">
        <label class="h3">Plot config builder</label>
      </div>
      <div class="row">
        <div class="col-mb-3">
          <b-form-group label-cols="auto" label="Choose column" label-for="columnSelector">
            <b-form-select id="columnSelector" :options="dataset.columns" v-model="selColumn">
            </b-form-select>
          </b-form-group>
        </div>
        <div class="col-mb-3 ml-2">
          <b-form-group label-cols="auto" label="Target field" label-for="columnSelector">
            <b-form-select id="FieldSel" :options="plotsegments" v-model="selField">
            </b-form-select>
          </b-form-group>
        </div>
        <div class="col-mb-3 ml-2">
          <b-button variant="primary" @click="addBar">Add</b-button>
        </div>
      </div>
    </div>
    <div class="row">
      <CandleChart
        :pair="pair"
        :timeframe="timeframe"
        :dataset="dataset"
        :plotConfig="selectedPlotConfig"
      >
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

  strategyPlotConfig = false;

  selColumn = '';

  selField = '';

  selColor = '#FFFF00';

  customPlotConfig = {};

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

  get selectedPlotConfig() {
    return this.strategyPlotConfig ? this.plotConfig : this.customPlotConfig;
  }

  get dataset() {
    return this.history[`${this.pair}__${this.timeframe}`];
  }

  get plotsegments() {
    return Object.keys(this.plotConfig);
  }

  refresh() {
    this.getPairHistory({ pair: this.pair, timeframe: this.timeframe, limit: 500 });

    this.getPlotConfig();
  }

  addBar() {
    console.log('Add clicked');
    console.log(this.selColumn);
    console.log(this.selField);
    console.log(this.plotConfig);

    this.plotConfig[this.selField][this.selColumn] = { color: this.selColor };
    console.log(this.plotConfig);
  }
}
</script>

<style scoped></style>
