<template>
  <div v-if="columns">
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
      <b-form-group label="Target field" label-for="FieldSel">
        <b-form-select id="FieldSel" :options="subplots" v-model="selField" :select-size="4">
        </b-form-select>
      </b-form-group>
    </div>
    <b-form-group v-if="plotOption == 'subplots'" label="New subplot" label-for="newSubplot">
      <b-input-group>
        <b-form-input class="addPlot" id="newSubplot" v-model="newSubplotName"></b-form-input>
        <b-input-group-append>
          <b-button @click="addSubplot">+</b-button>
          <b-button @click="delSubplot" v-if="selField">-</b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <hr />

    <b-form-group label="Choose column" label-for="columnSelector">
      <b-form-select id="columnSelector" :options="columns" v-model="selColumn"> </b-form-select>
    </b-form-group>

    <b-form-group label="Choose type" label-for="columnSelector">
      <b-form-select id="plotTypeSelector" :options="availableGraphTypes" v-model="graphType">
      </b-form-select>
    </b-form-group>
    <hr />

    <b-form-group label="Color" label-for="colsel">
      <b-input-group>
        <b-input-group-prepend>
          <div v-bind:style="{ 'background-color': selColor }" class="colorbox mr-2"></div>
        </b-input-group-prepend>
        <b-form-input id="colsel" v-model="selColor"> </b-form-input>
        <b-input-group-append>
          <b-button variant="primary" @click="newColor" size="sm">&#x21bb;</b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <hr />
    <div class="row">
      <b-button
        class="mx-1"
        variant="primary"
        @click="addBar"
        title="Add configuration to plot"
        size="sm"
      >
        Add
      </b-button>
      <b-button class="mx-1" variant="primary" @click="loadPlotConfig" size="sm">Load</b-button>
      <b-button
        class="mx-1"
        variant="primary"
        @click="savePlotConfig"
        size="sm"
        data-toggle="tooltip"
        title="Save configuration"
        >Save</b-button
      >
      <b-button
        class="mx-1"
        id="showButton"
        variant="primary"
        @click="showConfig = !showConfig"
        size="sm"
        title="Show configuration for easy transfer to a strategy"
        >Show</b-button
      >
      <b-button
        class="mx-1"
        variant="primary"
        @click="loadConfigFromString"
        size="sm"
        v-if="showConfig"
        title="Load configuration from text box below"
        >Load from String</b-button
      >
    </div>
    <div class="col-mb-5 ml-2 mt-2" v-if="showConfig">
      <b-textarea
        id="TextArea"
        class="textArea"
        v-model="plotConfigJson"
        size="sm"
        :state="tempPlotConfigValid"
      >
      </b-textarea>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { PlotConfig, EMPTY_PLOTCONFIG } from '@/store/types';
import randomColor from '@/shared/randomColor';
import { loadCustomPlotConfig } from '@/shared/storage';

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

  graphType = 'line';

  availableGraphTypes = ['line', 'bar', 'scatter'];

  showConfig = false;

  selField = '';

  tempPlotConfig?: PlotConfig = undefined;

  tempPlotConfigValid = true;

  selColor = randomColor();

  @ftbot.Mutation
  saveCustomPlotConfig;

  get plotConfigJson() {
    return JSON.stringify(this.plotConfig, null, 2);
  }

  set plotConfigJson(newValue: string) {
    try {
      this.tempPlotConfig = JSON.parse(newValue);
      // TODO: Should Validate schema validity (should be PlotConfig type...)
      this.tempPlotConfigValid = true;
    } catch (err) {
      this.tempPlotConfigValid = false;
    }
  }

  get subplots() {
    // Subplot keys (for selection window)
    return Object.keys(this.plotConfig.subplots);
  }

  mounted() {
    console.log('mounted');
    this.plotConfig = this.value;
  }

  newColor() {
    this.selColor = randomColor();
  }

  addBar() {
    console.log(this.plotConfig);

    const { plotConfig } = this;
    if (this.plotOption === 'main_plot') {
      console.log(`Adding ${this.selColumn} to MainPlot`);
      console.log(plotConfig);
      plotConfig[this.plotOption][this.selColumn] = { color: this.selColor, type: this.graphType };
    } else {
      console.log(`Adding ${this.selColumn} to ${this.selField}`);
      plotConfig[this.plotOption][this.selField][this.selColumn] = {
        color: this.selColor,
        type: this.graphType,
      };
    }

    this.plotConfig = { ...plotConfig };
    // Reset random color
    this.newColor();
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

  delSubplot() {
    delete this.plotConfig.subplots[this.selField];
    this.plotConfig.subplots = { ...this.plotConfig.subplots };
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

  loadConfigFromString() {
    // this.plotConfig = JSON.parse();
    if (this.tempPlotConfig !== undefined && this.tempPlotConfigValid) {
      this.plotConfig = this.tempPlotConfig;
      this.emitPlotConfig();
    }
  }
}
</script>

<style scoped>
.textArea {
  min-height: 250px;
}
.colorbox {
  border-radius: 50%;
  margin-top: 15%;
  height: 25px;
  width: 25px;
  vertical-align: center;
}
</style>
