<template>
  <div v-if="columns">
    <div class="col-mb-3 ml-2">
      <b-form-radio-group
        class="w-100"
        v-model="plotOption"
        :options="plotOptions"
        buttons
        button-variant="outline-primary"
      >
      </b-form-radio-group>
    </div>
    <div class="col-mb-3" v-if="plotOption == 'subplots'">
      <hr />

      <b-form-group label="Subplot" label-for="FieldSel">
        <b-form-select id="FieldSel" :options="subplots" v-model="selSubPlot" :select-size="4">
        </b-form-select>
      </b-form-group>
    </div>
    <b-form-group v-if="plotOption == 'subplots'" label="New subplot" label-for="newSubplot">
      <b-input-group size="sm">
        <b-form-input class="addPlot" id="newSubplot" v-model="newSubplotName"></b-form-input>
        <b-input-group-append>
          <b-button @click="addSubplot">+</b-button>
          <b-button @click="delSubplot" v-if="selSubPlot">-</b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <hr />
    <b-form-group label="Used indicators" label-for="selectedIndicators">
      <b-form-select
        id="selectedIndicators"
        :options="usedColumns"
        v-model="selIndicator"
        :select-size="4"
      >
      </b-form-select>
    </b-form-group>
    <b-form-group label="Add indicator" label-for="indicatorSelector">
      <b-form-select
        id="indicatorSelector"
        :options="columns"
        v-model="selAvailableIndicator"
        :select-size="4"
      >
      </b-form-select>
    </b-form-group>

    <b-form-group label="Choose type" label-for="plotTypeSelector">
      <b-form-select id="plotTypeSelector" :options="availableGraphTypes" v-model="graphType">
      </b-form-select>
    </b-form-group>
    <hr />

    <b-form-group label="Color" label-for="colsel" size="sm">
      <b-input-group>
        <b-input-group-prepend>
          <div v-bind:style="{ 'background-color': selColor }" class="colorbox mr-2"></div>
        </b-input-group-prepend>
        <b-form-input id="colsel" v-model="selColor" size="sm"> </b-form-input>
        <b-input-group-append>
          <b-button variant="primary" @click="newColor" size="sm">&#x21bb;</b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <hr />
    <b-form-group label="Plot config name" label-for="idPlotConfigName">
      <b-form-input id="idPlotConfigName" :options="availableGraphTypes" v-model="plotConfigName">
      </b-form-input>
    </b-form-group>
    <div class="row">
      <b-button
        class="ml-1"
        variant="primary"
        @click="addIndicator"
        title="Add indicator to plot"
        size="sm"
        :disabled="!selAvailableIndicator"
      >
        Add
      </b-button>
      <b-button
        class="ml-1"
        variant="primary"
        @click="removeIndicator"
        title="Remove indicator to plot"
        size="sm"
        :disabled="!selIndicator"
      >
        Remove
      </b-button>
      <b-button class="ml-1" variant="primary" @click="loadPlotConfig" size="sm">Load</b-button>
      <b-button class="ml-1" variant="primary" @click="loadPlotConfigFromStrategy" size="sm">
        Load from strategy
      </b-button>

      <b-button
        class="ml-1"
        variant="primary"
        @click="savePlotConfig"
        size="sm"
        data-toggle="tooltip"
        title="Save configuration"
        >Save</b-button
      >
      <b-button
        class="ml-1"
        id="showButton"
        variant="primary"
        @click="showConfig = !showConfig"
        size="sm"
        title="Show configuration for easy transfer to a strategy"
        >Show</b-button
      >
      <b-button
        class="ml-1"
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
    this.plotConfig = loadCustomPlotConfig(this.plotConfigName);
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
