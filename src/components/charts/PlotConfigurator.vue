<template>
  <div v-if="columns">
    <b-form-group label="Plot config name" label-for="idPlotConfigName">
      <b-form-input id="idPlotConfigName" v-model="plotConfigName" size="sm"> </b-form-input>
    </b-form-group>
    <div class="col-mb-3">
      <hr />

      <b-form-group label="Target" label-for="FieldSel">
        <b-form-select id="FieldSel" v-model="selSubPlot" :options="subplots" :select-size="3">
        </b-form-select>
      </b-form-group>
    </div>
    <b-form-group label="Add new plot" label-for="newSubPlot">
      <b-input-group size="sm">
        <b-form-input id="newSubPlot" v-model="newSubplotName" class="addPlot"></b-form-input>
        <b-input-group-append>
          <b-button @click="addSubplot">+</b-button>
          <b-button v-if="selSubPlot && selSubPlot != 'main_plot'" @click="delSubplot">-</b-button>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <hr />
    <div>
      <b-form-group label="Used indicators" label-for="selectedIndicators">
        <b-form-select
          id="selectedIndicators"
          v-model="selIndicatorName"
          :options="usedColumns"
          :select-size="4"
        >
        </b-form-select>
      </b-form-group>
    </div>
    <div>
      <b-button
        variant="primary"
        title="Add indicator to plot"
        size="sm"
        @click="addNewIndicator = !addNewIndicator"
      >
        Add new indicator
      </b-button>
      <b-button
        variant="primary"
        title="Remove indicator to plot"
        size="sm"
        :disabled="!selIndicatorName"
        class="ml-1"
        @click="removeIndicator"
      >
        Remove indicator
      </b-button>
    </div>

    <PlotIndicator
      v-model="selIndicator"
      class="mt-1"
      :columns="columns"
      :add-new="addNewIndicator"
    />
    <hr />

    <div>
      <b-button class="ml-1" variant="primary" size="sm" @click="loadPlotConfig">Load</b-button>
      <b-button class="ml-1" variant="primary" size="sm" @click="loadPlotConfigFromStrategy">
        From strategy
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
        class="ml-1"
        variant="primary"
        size="sm"
        title="Load configuration from text box below"
        @click="resetConfig"
        >Reset</b-button
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
    <div v-if="showConfig" class="col-mb-5 ml-1 mt-2">
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
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { PlotConfig, EMPTY_PLOTCONFIG, IndicatorConfig } from '@/types';
import { getCustomPlotConfig } from '@/shared/storage';
import PlotIndicator from '@/components/charts/PlotIndicator.vue';
import { BotStoreGetters } from '@/store/modules/ftbot';

const ftbot = namespace('ftbot');

@Component({
  components: { PlotIndicator },
})
export default class PlotConfigurator extends Vue {
  @Prop({ required: true }) value!: PlotConfig;

  @Prop({ required: true }) columns!: Array<string>;

  @Prop({ required: false, default: true }) asModal!: boolean;

  @Emit('input')
  emitPlotConfig() {
    return this.plotConfig;
  }

  @ftbot.Action getStrategyPlotConfig;

  @ftbot.Getter [BotStoreGetters.strategyPlotConfig];

  get selIndicator(): Record<string, IndicatorConfig> {
    if (this.addNewIndicator) {
      return {};
    }
    if (this.selIndicatorName) {
      return {
        [this.selIndicatorName]: this.currentPlotConfig[this.selIndicatorName],
      };
    }
    return {};
  }

  set selIndicator(newValue: Record<string, IndicatorConfig>) {
    console.log('newValue', newValue);
    const name = Object.keys(newValue)[0];
    // this.currentPlotConfig[this.selIndicatorName] = { ...newValue[name] };
    // this.emitPlotConfig();
    if (name && newValue) {
      this.addIndicator(newValue);
    } else {
      this.addNewIndicator = false;
    }
  }

  plotConfig: PlotConfig = EMPTY_PLOTCONFIG;

  plotOptions = [
    { text: 'Main Plot', value: 'main_plot' },
    { text: 'Subplots', value: 'subplots' },
  ];

  plotConfigName = 'default';

  newSubplotName = '';

  selAvailableIndicator = '';

  selIndicatorName = '';

  addNewIndicator = false;

  showConfig = false;

  selSubPlot = 'main_plot';

  tempPlotConfig?: PlotConfig = undefined;

  tempPlotConfigValid = true;

  @ftbot.Mutation saveCustomPlotConfig;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  get subplots(): string[] {
    // Subplot keys (for selection window)
    return ['main_plot', ...Object.keys(this.plotConfig.subplots)];
  }

  get usedColumns(): string[] {
    if (this.isMainPlot) {
      return Object.keys(this.plotConfig.main_plot);
    }
    if (this.selSubPlot in this.plotConfig.subplots) {
      return Object.keys(this.plotConfig.subplots[this.selSubPlot]);
    }
    return [];
  }

  get isMainPlot() {
    return this.selSubPlot === 'main_plot';
  }

  get currentPlotConfig() {
    if (this.isMainPlot) {
      return this.plotConfig.main_plot;
    }

    return this.plotConfig.subplots[this.selSubPlot];
  }

  mounted() {
    console.log('Config Mounted', this.value);
    this.plotConfig = this.value;
    this.plotConfigName = this.usedPlotConfigName;
  }

  @Watch('value')
  watchValue() {
    this.plotConfig = this.value;
    this.plotConfigName = this.usedPlotConfigName;
  }

  addIndicator(newIndicator: Record<string, IndicatorConfig>) {
    console.log(this.plotConfig);

    const { plotConfig } = this;
    const name = Object.keys(newIndicator)[0];
    const indicator = newIndicator[name];
    if (this.isMainPlot) {
      console.log(`Adding ${name} to MainPlot`);
      plotConfig.main_plot[name] = { ...indicator };
    } else {
      console.log(`Adding ${name} to ${this.selSubPlot}`);
      plotConfig.subplots[this.selSubPlot][name] = { ...indicator };
    }

    this.plotConfig = { ...plotConfig };
    // Reset random color
    this.addNewIndicator = false;
    this.emitPlotConfig();
  }

  removeIndicator() {
    console.log(this.plotConfig);
    const { plotConfig } = this;
    if (this.isMainPlot) {
      console.log(`Removing ${this.selIndicatorName} from MainPlot`);
      delete plotConfig.main_plot[this.selIndicatorName];
    } else {
      console.log(`Removing ${this.selIndicatorName} from ${this.selSubPlot}`);
      delete plotConfig.subplots[this.selSubPlot][this.selIndicatorName];
    }

    this.plotConfig = { ...plotConfig };
    console.log(this.plotConfig);
    this.selIndicatorName = '';
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
    this.selSubPlot = '';
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

  resetConfig() {
    this.plotConfig = { ...EMPTY_PLOTCONFIG };
  }

  async loadPlotConfigFromStrategy() {
    await this.getStrategyPlotConfig();
    this.plotConfig = this.strategyPlotConfig;
    this.emitPlotConfig();
  }
}
</script>

<style scoped>
.textArea {
  min-height: 250px;
}

.form-group {
  margin-bottom: 0.5rem;
}
hr {
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
}
</style>
