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
          <b-form-group label-cols="auto" label="Plot Section" label-for="FieldSel">
            <b-form-radio v-model="plotOption" name="plot_section" value="main_plot">
              Main Plot
            </b-form-radio>
            <b-form-radio v-model="plotOption" name="plot_section" value="subplots">
              Subplots
            </b-form-radio>
          </b-form-group>
        </div>
        <div class="col-mb-3 ml-2" v-if="plotOption == 'subplots'">
          <b-form-group label-cols="auto" label="Target field" label-for="FieldSel">
            <b-form-select id="FieldSel" :options="subplots" v-model="selField" :select-size="4">
            </b-form-select>
          </b-form-group>
        </div>
        <div class="col-mb-3 ml-2" v-if="plotOption == 'subplots'">
          <b-form-group label-cols="auto" label="New subplot" label-for="newSubplot">
            <b-form-input class="addPlot" id="newSubplot" v-model="newSubplotName"></b-form-input>

            <b-button id="FieldSel" @click="addSubplot">+</b-button>
          </b-form-group>
        </div>

        <div class="col-mb-3 ml-2">
          <b-form-group label-cols="auto" label="Color" label-for="colsel">
            <b-form-input id="colsel" v-model="selColor"></b-form-input>
          </b-form-group>
        </div>

        <div class="col-mb-3 ml-2">
          <b-button variant="primary" @click="addBar">Add</b-button>
        </div>

        <div class="col-mb-3 ml-2">
          <b-button variant="primary" @click="loadPlotConfig">Load</b-button>
        </div>
        <div class="col-mb-3 ml-2">
          <b-button variant="primary" @click="savePlotConfig">Save</b-button>
        </div>
        <div class="col-mb-3 ml-2">
          <b-button variant="primary" @click="showConfig = !showConfig">Show</b-button>
        </div>
        <div class="col-mb-5 ml-2" v-if="showConfig">
          <b-textarea id="TextArea" v-model="plotConfigJson"> </b-textarea>
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
import randomColor from '../shared/randomColor';
import { loadCustomPlotConfig } from '../shared/storage';
import { PlotConfig, EMPTY_PLOTCONFIG } from '../store/types';

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

  newSubplotName = '';

  plotOption = 'main_plot';

  selColor = randomColor();

  // Custom plot config - manually changed by user.
  // eslint-disable-next-line @typescript-eslint/camelcase
  customPlotConfig: PlotConfig = { ...EMPTY_PLOTCONFIG };

  @ftbot.State history;

  @ftbot.State whitelist;

  @ftbot.State plotConfig;

  @ftbot.Action
  public getPairHistory;

  @ftbot.Action
  public getWhitelist;

  @ftbot.Action
  public getPlotConfig;

  @ftbot.Mutation
  saveCustomPlotConfig;

  showConfig = false;

  mounted() {
    this.getWhitelist();
    this.refresh();
    // eslint-disable-next-line @typescript-eslint/camelcase
    this.customPlotConfig = loadCustomPlotConfig();
  }

  get selectedPlotConfig() {
    return this.strategyPlotConfig ? this.plotConfig : this.customPlotConfig;
  }

  get dataset() {
    return this.history[`${this.pair}__${this.timeframe}`];
  }

  get subplots() {
    // Subplot keys (for selection window)
    return Object.keys(this.selectedPlotConfig.subplots);
  }

  get plotConfigJson() {
    return JSON.stringify(this.selectedPlotConfig, null, 2);
  }

  refresh() {
    this.getPairHistory({ pair: this.pair, timeframe: this.timeframe, limit: 500 });

    this.getPlotConfig();
  }

  addBar() {
    console.log(this.customPlotConfig);

    const plotConfig = this.customPlotConfig;
    if (this.plotOption === 'main_plot') {
      console.log(`Adding ${this.selColumn} to MainPlot`);
      console.log(plotConfig);
      plotConfig[this.plotOption][this.selColumn] = { color: this.selColor };
    } else {
      console.log(`Adding ${this.selColumn} to ${this.selField}`);
      plotConfig[this.plotOption][this.selField][this.selColumn] = { color: this.selColor };
    }

    this.customPlotConfig = { ...plotConfig };
    // Reset random color
    this.selColor = randomColor();
    console.log(this.customPlotConfig);
  }

  addSubplot() {
    this.customPlotConfig.subplots = {
      ...this.customPlotConfig.subplots,
      [this.newSubplotName]: {},
    };
    this.selField = this.newSubplotName;
    this.newSubplotName = '';
    console.log(this.customPlotConfig);
  }

  savePlotConfig() {
    this.saveCustomPlotConfig(this.customPlotConfig);
  }

  loadPlotConfig() {
    this.customPlotConfig = loadCustomPlotConfig();
    console.log(this.customPlotConfig);
    console.log('loading config');
  }
}
</script>

<style scoped></style>
