<template>
  <div v-if="columns">
    <b-form-group label="Plot config name" label-for="idPlotConfigName">
      <b-form-input id="idPlotConfigName" v-model="plotConfigNameLoc" size="sm"> </b-form-input>
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
          <b-button :disabled="!newSubplotName" @click="addSubplot">+</b-button>
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
        :disabled="addNewIndicator"
        @click="addNewIndicator = !addNewIndicator"
      >
        Add new indicator
      </b-button>
      <b-button
        variant="secondary"
        title="Remove indicator to plot"
        size="sm"
        :disabled="!selIndicatorName"
        class="ms-1"
        @click="removeIndicator"
      >
        Remove indicator
      </b-button>
    </div>

    <PlotIndicator
      v-if="selIndicatorName || addNewIndicator"
      v-model="selIndicator"
      class="mt-1"
      :columns="columns"
      :add-new="addNewIndicator"
    />
    <hr />

    <div>
      <b-button class="ms-1" variant="secondary" size="sm" @click="loadPlotConfig">Load</b-button>
      <b-button
        :disabled="
          (botStore.activeBot.isWebserverMode && botStore.activeBot.botApiVersion < 2.23) ||
          !botStore.activeBot.isBotOnline
        "
        class="ms-1"
        variant="secondary"
        size="sm"
        @click="loadPlotConfigFromStrategy"
      >
        From strategy
      </b-button>

      <b-button
        class="ms-1"
        variant="secondary"
        size="sm"
        title="Load configuration from text box below"
        @click="resetConfig"
        >Reset</b-button
      >
      <b-button
        id="showButton"
        class="ms-1"
        variant="secondary"
        size="sm"
        title="Show configuration for easy transfer to a strategy"
        @click="showConfig = !showConfig"
        >Show</b-button
      >

      <b-button
        v-if="showConfig"
        class="ms-1"
        variant="secondary"
        size="sm"
        title="Load configuration from text box below"
        @click="loadConfigFromString"
        >Load from String</b-button
      >
      <b-button
        class="ms-1"
        variant="primary"
        size="sm"
        data-toggle="tooltip"
        title="Save configuration"
        @click="savePlotConfig"
        >Save</b-button
      >
    </div>
    <div v-if="showConfig" class="col-mb-5 ms-1 mt-2">
      <b-form-textarea
        id="TextArea"
        v-model="plotConfigJson"
        class="textArea"
        size="sm"
        :state="tempPlotConfigValid"
      >
      </b-form-textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlotConfig, EMPTY_PLOTCONFIG, IndicatorConfig } from '@/types';
import { getCustomPlotConfig } from '@/shared/storage';
import PlotIndicator from '@/components/charts/PlotIndicator.vue';
import { showAlert } from '@/stores/alerts';

import { computed, ref, onMounted } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { usePlotConfigStore } from '@/stores/plotConfig';

defineProps({
  columns: { required: true, type: Array as () => string[] },
  asModal: { required: false, default: true, type: Boolean },
});

const plotStore = usePlotConfigStore();
const botStore = useBotStore();

const plotConfig = ref<PlotConfig>(EMPTY_PLOTCONFIG);

const plotConfigNameLoc = ref('default');
const newSubplotName = ref('');
const selIndicatorName = ref('');
const addNewIndicator = ref(false);
const showConfig = ref(false);
const selSubPlot = ref('main_plot');
const tempPlotConfig = ref<PlotConfig>();
const tempPlotConfigValid = ref(true);

const isMainPlot = computed(() => {
  return selSubPlot.value === 'main_plot';
});

const currentPlotConfig = computed(() => {
  if (isMainPlot.value) {
    return plotConfig.value.main_plot;
  }

  return plotConfig.value.subplots[selSubPlot.value];
});
const subplots = computed((): string[] => {
  // Subplot keys (for selection window)
  return ['main_plot', ...Object.keys(plotConfig.value.subplots)];
});
const usedColumns = computed((): string[] => {
  if (isMainPlot.value) {
    return Object.keys(plotConfig.value.main_plot);
  }
  if (selSubPlot.value in plotConfig.value.subplots) {
    return Object.keys(plotConfig.value.subplots[selSubPlot.value]);
  }
  return [];
});

function addIndicator(newIndicator: Record<string, IndicatorConfig>) {
  console.log(plotConfig.value);

  // const { plotConfig.value } = this;
  const name = Object.keys(newIndicator)[0];
  const indicator = newIndicator[name];
  if (isMainPlot.value) {
    console.log(`Adding ${name} to MainPlot`);
    plotConfig.value.main_plot[name] = { ...indicator };
  } else {
    console.log(`Adding ${name} to ${selSubPlot.value}`);
    plotConfig.value.subplots[selSubPlot.value][name] = { ...indicator };
  }

  plotConfig.value = { ...plotConfig.value };
  // Reset random color
  addNewIndicator.value = false;
  plotStore.setPlotConfig(plotConfig.value);
}

const selIndicator = computed({
  get() {
    if (addNewIndicator.value) {
      return {};
    }
    if (selIndicatorName.value) {
      return {
        [selIndicatorName.value]: currentPlotConfig.value[selIndicatorName.value],
      };
    }
    return {};
  },
  set(newValue: Record<string, IndicatorConfig>) {
    // console.log('newValue', newValue);
    const name = Object.keys(newValue)[0];
    // this.currentPlotConfig[this.selIndicatorName] = { ...newValue[name] };
    // this.emitPlotConfig();
    if (name && newValue) {
      addIndicator(newValue);
    } else {
      addNewIndicator.value = false;
    }
  },
});

const plotConfigJson = computed({
  get() {
    return JSON.stringify(plotConfig.value, null, 2);
  },
  set(newValue: string) {
    try {
      tempPlotConfig.value = JSON.parse(newValue);
      // TODO: Should Validate schema validity (should be PlotConfig type...)
      tempPlotConfigValid.value = true;
    } catch (err) {
      tempPlotConfigValid.value = false;
    }
  },
});

function removeIndicator() {
  console.log(plotConfig.value);
  // const { plotConfig } = this;
  if (isMainPlot.value) {
    console.log(`Removing ${selIndicatorName.value} from MainPlot`);
    delete plotConfig.value.main_plot[selIndicatorName.value];
  } else {
    console.log(`Removing ${selIndicatorName.value} from ${selSubPlot.value}`);
    delete plotConfig.value.subplots[selSubPlot.value][selIndicatorName.value];
  }

  plotConfig.value = { ...plotConfig.value };
  console.log(plotConfig.value);
  selIndicatorName.value = '';
  plotStore.setPlotConfig(plotConfig.value);
}
function addSubplot() {
  plotConfig.value.subplots = {
    ...plotConfig.value.subplots,
    [newSubplotName.value]: {},
  };
  selSubPlot.value = newSubplotName.value;
  newSubplotName.value = '';

  plotStore.setPlotConfig(plotConfig.value);
}

function delSubplot() {
  delete plotConfig.value.subplots[selSubPlot.value];
  plotConfig.value.subplots = { ...plotConfig.value.subplots };
  selSubPlot.value = '';
  plotStore.setPlotConfig(plotConfig.value);
}
function loadPlotConfig() {
  plotConfig.value = getCustomPlotConfig(plotConfigNameLoc.value);
  console.log(plotConfig.value);
  console.log('loading config');
  plotStore.setPlotConfig(plotConfig.value);
}

function loadConfigFromString() {
  // this.plotConfig = JSON.parse();
  if (tempPlotConfig.value !== undefined && tempPlotConfigValid.value) {
    plotConfig.value = tempPlotConfig.value;
    plotStore.setPlotConfig(plotConfig.value);
  }
}
function resetConfig() {
  plotConfig.value = { ...EMPTY_PLOTCONFIG };
}
async function loadPlotConfigFromStrategy() {
  if (botStore.activeBot.isWebserverMode && !botStore.activeBot.strategy.strategy) {
    showAlert(`No strategy selected, can't load plot config.`);
    return;
  }
  try {
    await botStore.activeBot.getStrategyPlotConfig();
    if (botStore.activeBot.strategyPlotConfig) {
      plotConfig.value = botStore.activeBot.strategyPlotConfig;
      plotStore.setPlotConfig(plotConfig.value);
    }
  } catch (data) {
    //
    showAlert('Failed to load Plot configuration from Strategy.');
  }
}

function savePlotConfig() {
  plotStore.saveCustomPlotConfig({ [plotConfigNameLoc.value]: plotConfig.value });
}

onMounted(() => {
  // console.log('Config Mounted', props);
  plotConfig.value = plotStore.plotConfig;
  plotConfigNameLoc.value = plotStore.plotConfigName;
});
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
