<template>
  <div v-if="columns" class="container-fluid">
    <div class="row">
      <label class="h3">Plot config builder</label>
    </div>
    <div class="row">
      <div class="col-mb-3">
        <b-form-group label-cols="auto" label="Choose column" label-for="columnSelector">
          <b-form-select id="columnSelector" :options="columns" v-model="selColumn">
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
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { PlotConfig, EMPTY_PLOTCONFIG } from '../../store/types';
import randomColor from '../../shared/randomColor';
import { loadCustomPlotConfig } from '../../shared/storage';

const ftbot = namespace('ftbot');

@Component({})
export default class PlotConfigurator extends Vue {
  @Prop({ required: true }) value!: PlotConfig;

  @Prop({ required: true }) columns!: Array<string>;

  @Emit('input')
  emitPlotConfig() {
    return this.plotConfig;
  }

  plotConfig: PlotConfig = EMPTY_PLOTCONFIG;

  plotOption = 'main_plot';

  newSubplotName = '';

  selColumn = '';

  showConfig = false;

  selField = '';

  selColor = randomColor();

  @ftbot.Mutation
  saveCustomPlotConfig;

  get plotConfigJson() {
    return JSON.stringify(this.plotConfig, null, 2);
  }

  get subplots() {
    // Subplot keys (for selection window)
    return Object.keys(this.plotConfig.subplots);
  }

  mounted() {
    console.log('mounted');
    this.plotConfig = this.value;
  }

  addBar() {
    console.log(this.plotConfig);

    const { plotConfig } = this;
    if (this.plotOption === 'main_plot') {
      console.log(`Adding ${this.selColumn} to MainPlot`);
      console.log(plotConfig);
      plotConfig[this.plotOption][this.selColumn] = { color: this.selColor };
    } else {
      console.log(`Adding ${this.selColumn} to ${this.selField}`);
      plotConfig[this.plotOption][this.selField][this.selColumn] = { color: this.selColor };
    }

    this.plotConfig = { ...plotConfig };
    // Reset random color
    this.selColor = randomColor();
    console.log(this.plotConfig);
    this.emitPlotConfig();
  }

  addSubplot() {
    this.plotConfig.subplots = {
      ...this.plotConfig.subplots,
      [this.newSubplotName]: {},
    };
    this.selField = this.newSubplotName;
    this.newSubplotName = '';
    console.log(this.plotConfig);
    this.emitPlotConfig();
  }

  savePlotConfig() {
    this.saveCustomPlotConfig(this.plotConfig);
  }

  loadPlotConfig() {
    this.plotConfig = loadCustomPlotConfig();
    console.log(this.plotConfig);
    console.log('loading config');
    this.emitPlotConfig();
  }
}
</script>

<style>
</style>
