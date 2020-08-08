<template>
  <div v-if="columns">
    <div class="col-mb-3 ml-2">
      <b-form-radio-group
        v-model="plotOption"
        class="w-100"
        :options="plotOptions"
        buttons
        button-variant="outline-primary"
      >
      </b-form-radio-group>
    </div>
    <div v-if="plotOption == 'subplots'" class="col-mb-3">
      <hr />

      <b-form-group label="Subplot" label-for="FieldSel">
        <b-form-select id="FieldSel" v-model="selSubPlot" :options="subplots" :select-size="4">
        </b-form-select>
      </b-form-group>
    </div>
    <b-form-group v-if="plotOption == 'subplots'" label="New subplot" label-for="newSubplot">
      <b-input-group size="sm">
        <b-form-input id="newSubplot" v-model="newSubplotName" class="addPlot"></b-form-input>
        <b-input-group-append>
          <b-button @click="addSubplot">+</b-button>
          <b-button v-if="selSubPlot" @click="delSubplot">-</b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <hr />
    <b-form-group label="Used indicators" label-for="selectedIndicators">
      <b-form-select
        id="selectedIndicators"
        v-model="selIndicator"
        :options="usedColumns"
        :select-size="4"
      >
      </b-form-select>
    </b-form-group>
    <b-form-group label="Add indicator" label-for="indicatorSelector">
      <b-form-select
        id="indicatorSelector"
        v-model="selAvailableIndicator"
        :options="columns"
        :select-size="4"
      >
      </b-form-select>
    </b-form-group>

    <b-form-group label="Choose type" label-for="plotTypeSelector">
      <b-form-select id="plotTypeSelector" v-model="graphType" :options="availableGraphTypes">
      </b-form-select>
    </b-form-group>
    <hr />

    <b-form-group label="Color" label-for="colsel" size="sm">
      <b-input-group>
        <b-input-group-prepend>
          <div :style="{ 'background-color': selColor }" class="colorbox mr-2"></div>
        </b-input-group-prepend>
        <b-form-input id="colsel" v-model="selColor" size="sm"> </b-form-input>
        <b-input-group-append>
          <b-button variant="primary" size="sm" @click="newColor">&#x21bb;</b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <hr />
    <b-form-group label="Plot config name" label-for="idPlotConfigName">
      <b-form-input id="idPlotConfigName" v-model="plotConfigName" :options="availableGraphTypes">
      </b-form-input>
    </b-form-group>
    <div class="row">
      <b-button
        class="ml-1"
        variant="primary"
        title="Add indicator to plot"
        size="sm"
        :disabled="!selAvailableIndicator"
        @click="addIndicator"
      >
        Add
      </b-button>
      <b-button
        class="ml-1"
        variant="primary"
        title="Remove indicator to plot"
        size="sm"
        :disabled="!selIndicator"
        @click="removeIndicator"
      >
        Remove
      </b-button>
      <b-button class="ml-1" variant="primary" size="sm" @click="loadPlotConfig">Load</b-button>
      <b-button class="ml-1" variant="primary" size="sm" @click="loadPlotConfigFromStrategy">
        Load from strategy
      </b-button>

      <b-button
        class="ml-1"
        variant="primary"
        size="sm"
        data-toggle="tooltip"
        title="Save configuration"
        @click="savePlotConfig"
        >Save</b-button
      >
      <b-button
        id="showButton"
        class="ml-1"
        variant="primary"
        size="sm"
        title="Show configuration for easy transfer to a strategy"
        @click="showConfig = !showConfig"
        >Show</b-button
      >
      <b-button
        v-if="showConfig"
        class="ml-1"
        variant="primary"
        size="sm"
        title="Load configuration from text box below"
        @click="loadConfigFromString"
        >Load from String</b-button
      >
    </div>
    <div v-if="showConfig" class="col-mb-5 ml-2 mt-2">
      <b-textarea
        id="TextArea"
        v-model="plotConfigJson"
        class="textArea"
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
import { PlotConfig, EMPTY_PLOTCONFIG } from '@/types';
import randomColor from '@/shared/randomColor';
import { getCustomPlotConfig } from '@/shared/storage';

const ftbot = namespace('ftbot');

@Component({})
export default class PlotConfigurator extends Vue {
  @Prop({ required: true }) value!: PlotConfig;

  @Prop({ required: true }) columns!: Array<string>;

  @Emit('input')
  emitPlotConfig() {
    return this.plotConfig;
  }

  @ftbot.Action getStrategyPlotConfig;

  @ftbot.State strategyPlotConfig;

  plotConfig: PlotConfig = EMPTY_PLOTCONFIG;

  plotOptions = [
    { text: 'Main Plot', value: 'main_plot' },
    { text: 'Subplots', value: 'subplots' },
  ];

  plotOption = 'main_plot';

  plotConfigName = 'default';

  newSubplotName = '';

  selAvailableIndicator = '';

  selIndicator = '';

  graphType = 'line';

  availableGraphTypes = ['line', 'bar', 'scatter'];

  showConfig = false;

  selSubPlot = '';

  tempPlotConfig?: PlotConfig = undefined;

  tempPlotConfigValid = true;

  selColor = randomColor();

  @ftbot.Mutation saveCustomPlotConfig;

  @ftbot.Mutation updatePlotConfigName!: (plotConfigName: string) => void;

  @ftbot.State('plotConfigName') usedPlotConfigName!: string;

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

  get usedColumns() {
    if (this.isMainPlot) {
      return Object.keys(this.plotConfig.main_plot);
    }
    if (this.selSubPlot in this.plotConfig[this.plotOption]) {
      return Object.keys(this.plotConfig[this.plotOption][this.selSubPlot]);
    }
    return [];
  }

  get isMainPlot() {
    return this.plotOption === 'main_plot';
  }

  mounted() {
    this.plotConfig = this.value;
    this.plotConfigName = this.usedPlotConfigName;
  }

  newColor() {
    this.selColor = randomColor();
  }

  addIndicator() {
    console.log(this.plotConfig);

    const { plotConfig } = this;
    if (this.isMainPlot) {
      console.log(`Adding ${this.selAvailableIndicator} to MainPlot`);
      plotConfig[this.plotOption][this.selAvailableIndicator] = {
        color: this.selColor,
        type: this.graphType,
      };
    } else {
      console.log(`Adding ${this.selAvailableIndicator} to ${this.selSubPlot}`);
      plotConfig[this.plotOption][this.selSubPlot][this.selAvailableIndicator] = {
        color: this.selColor,
        type: this.graphType,
      };
    }

    this.plotConfig = { ...plotConfig };
    this.selAvailableIndicator = '';
    // Reset random color
    this.newColor();
    this.emitPlotConfig();
  }

  removeIndicator() {
    console.log(this.plotConfig);
    const { plotConfig } = this;
    if (this.isMainPlot) {
      console.log(`Removing ${this.selIndicator} from MainPlot`);
      delete plotConfig[this.plotOption][this.selIndicator];
    } else {
      console.log(`Removing ${this.selIndicator} from ${this.selSubPlot}`);
      delete plotConfig[this.plotOption][this.selSubPlot][this.selIndicator];
    }

    this.plotConfig = { ...plotConfig };
    console.log(this.plotConfig);
    this.selIndicator = '';
    this.emitPlotConfig();
  }

  addSubplot() {
    this.plotConfig.subplots = {
      ...this.plotConfig.subplots,
      [this.newSubplotName]: {},
    };
    this.selSubPlot = this.newSubplotName;
    this.newSubplotName = '';
    console.log(this.plotConfig);
    this.emitPlotConfig();
  }

  delSubplot() {
    delete this.plotConfig.subplots[this.selSubPlot];
    this.plotConfig.subplots = { ...this.plotConfig.subplots };
  }

  savePlotConfig() {
    this.saveCustomPlotConfig({ [this.plotConfigName]: this.plotConfig });
  }

  loadPlotConfig() {
    this.plotConfig = getCustomPlotConfig(this.plotConfigName);
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

  async loadPlotConfigFromStrategy() {
    await this.getStrategyPlotConfig();
    this.plotConfig = this.strategyPlotConfig;
  }
}
</script>

<style scoped>
.textArea {
  min-height: 250px;
}
.colorbox {
  border-radius: 50%;
  margin-top: auto;
  margin-bottom: auto;
  height: 25px;
  width: 25px;
  vertical-align: center;
}
.form-group {
  margin-bottom: 0.5rem;
}
hr {
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
}
</style>
