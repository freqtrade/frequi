<script setup lang="ts">
import { IndicatorConfig, PlotConfig } from '@/types';

const props = defineProps({
  columns: { required: true, type: Array as () => string[] },
  isVisible: { required: true, default: false, type: Boolean },
});

const plotStore = usePlotConfigStore();
const botStore = useBotStore();

const plotConfigNameLoc = ref('default');
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
    return plotStore.editablePlotConfig.main_plot;
  }

  return plotStore.editablePlotConfig.subplots[selSubPlot.value];
});
const subplots = computed((): string[] => {
  // Subplot keys (for selection window)
  return ['main_plot', ...Object.keys(plotStore.editablePlotConfig.subplots)];
});
const usedColumns = computed((): { html: string; value: string }[] => {
  let usedCols: string[] = [];
  if (isMainPlot.value) {
    usedCols = Object.keys(plotStore.editablePlotConfig.main_plot);
  }
  if (selSubPlot.value in plotStore.editablePlotConfig.subplots) {
    usedCols = Object.keys(plotStore.editablePlotConfig.subplots[selSubPlot.value]);
  }
  return usedCols.map((col) => ({
    value: col,
    html: !props.columns.includes(col)
      ? `<span title="Column not available">${col} <-- not available in this chart</span>`
      : col,
  }));
});

function addIndicator(newIndicator: Record<string, IndicatorConfig>) {
  // const { plotConfig.value } = this;
  const name = Object.keys(newIndicator)[0];
  const indicator = newIndicator[name];
  if (isMainPlot.value) {
    // console.log(`Adding ${name} to MainPlot`);
    plotStore.editablePlotConfig.main_plot[name] = { ...indicator };
  } else {
    // console.log(`Adding ${name} to ${selSubPlot.value}`);
    plotStore.editablePlotConfig.subplots[selSubPlot.value][name] = { ...indicator };
  }

  plotStore.editablePlotConfig = { ...plotStore.editablePlotConfig };
  // Reset random color
  addNewIndicator.value = false;
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
    return JSON.stringify(plotStore.editablePlotConfig, null, 2);
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
  if (isMainPlot.value) {
    console.log(`Removing ${selIndicatorName.value} from MainPlot`);
    delete plotStore.editablePlotConfig.main_plot[selIndicatorName.value];
  } else {
    console.log(`Removing ${selIndicatorName.value} from ${selSubPlot.value}`);
    delete plotStore.editablePlotConfig.subplots[selSubPlot.value][selIndicatorName.value];
  }

  plotStore.editablePlotConfig = { ...plotStore.editablePlotConfig };
  selIndicatorName.value = '';
}

function clickAddNewIndicator() {
  addNewIndicator.value = !addNewIndicator.value;
  selIndicatorName.value = '';
}

function addSubplot(newSubplotName: string) {
  plotStore.editablePlotConfig.subplots = {
    ...plotStore.editablePlotConfig.subplots,
    [newSubplotName]: {},
  };
  selSubPlot.value = newSubplotName;
}

function deleteSubplot(subplotName: string) {
  delete plotStore.editablePlotConfig.subplots[subplotName];
  // Reassign to trigger reactivity
  plotStore.editablePlotConfig = { ...plotStore.editablePlotConfig };
  selSubPlot.value = subplots.value[subplots.value.length - 1];
}

function renameSubplot(oldName: string, newName: string) {
  plotStore.editablePlotConfig.subplots[newName] = plotStore.editablePlotConfig.subplots[oldName];
  delete plotStore.editablePlotConfig.subplots[oldName];
  selSubPlot.value = newName;
}

function loadPlotConfig() {
  // Reset from store
  plotStore.editablePlotConfig = deepClone(plotStore.customPlotConfigs[plotStore.plotConfigName]);
}

function loadConfigFromString() {
  if (tempPlotConfig.value !== undefined && tempPlotConfigValid.value) {
    plotStore.editablePlotConfig = tempPlotConfig.value;
  }
}

// function clearConfig() {
//   // Use empty config
//   plotStore.editablePlotConfig = { ...EMPTY_PLOTCONFIG };
// }

async function loadPlotConfigFromStrategy() {
  if (botStore.activeBot.isWebserverMode && !botStore.activeBot.strategy.strategy) {
    showAlert(`No strategy selected, can't load plot config.`);
    return;
  }
  try {
    await botStore.activeBot.getStrategyPlotConfig();
    if (botStore.activeBot.strategyPlotConfig) {
      plotStore.editablePlotConfig = botStore.activeBot.strategyPlotConfig;
    }
  } catch (error) {
    //
    showAlert('Failed to load Plot configuration from Strategy.');
  }
}

function savePlotConfig() {
  plotStore.saveCustomPlotConfig(plotConfigNameLoc.value, plotStore.editablePlotConfig);
}

function addNewIndicatorSelected(indicator?: string) {
  addNewIndicator.value = false;

  if (indicator) {
    addIndicator({
      [indicator]: {
        color: randomColor(),
      },
    });
    selIndicatorName.value = indicator;
  }
}

watch(selSubPlot, () => {
  // Deselect Indicator when switching selected plot
  selIndicatorName.value = '';
});

watch(
  () => plotStore.plotConfigName,
  () => {
    selIndicatorName.value = '';
    // selSubPlot.value = '';
    plotConfigNameLoc.value = plotStore.plotConfigName;
  },
);

watch(
  () => props.isVisible,
  () => {
    if (props.isVisible) {
      // Deep clone and assign to editable
      plotStore.editablePlotConfig = deepClone(plotStore.plotConfig);
      plotStore.isEditing = true;
      plotConfigNameLoc.value = plotStore.plotConfigName;
    } else {
      plotStore.isEditing = false;
    }
  },
);
const fromPlotTemplateVisible = ref(false);
</script>

<template>
  <div v-if="columns">
    <BFormGroup label="Plot config name" label-for="idPlotConfigName">
      <PlotConfigSelect allow-edit></PlotConfigSelect>
    </BFormGroup>
    <div class="col-mb-3">
      <hr />
      <BFormGroup label="Target Plot" label-for="FieldSel">
        <EditValue
          v-model="selSubPlot"
          :allow-edit="!isMainPlot"
          allow-add
          editable-name="plot configuration"
          align-vertical
          @new="addSubplot"
          @delete="deleteSubplot"
          @rename="renameSubplot"
        >
          <BFormSelect id="FieldSel" v-model="selSubPlot" :options="subplots" :select-size="5">
          </BFormSelect>
        </EditValue>
      </BFormGroup>
    </div>
    <hr />
    <div>
      <BFormGroup label="Indicators in this plot" label-for="selectedIndicators">
        <BFormSelect
          id="selectedIndicators"
          v-model="selIndicatorName"
          :disabled="addNewIndicator"
          :options="usedColumns"
          :select-size="4"
        >
        </BFormSelect>
      </BFormGroup>
    </div>
    <div class="d-flex flex-row mt-1 gap-1">
      <BButton
        variant="secondary"
        title="Remove indicator to plot"
        size="sm"
        :disabled="!selIndicatorName"
        class="col"
        @click="removeIndicator"
      >
        Remove indicator
      </BButton>
      <BButton
        variant="secondary"
        title="Load indicator config from template"
        size="sm"
        @click="fromPlotTemplateVisible = !fromPlotTemplateVisible"
      >
        Indicator from template
      </BButton>
      <BButton
        variant="primary"
        title="Add indicator to plot"
        size="sm"
        class="col"
        :disabled="addNewIndicator"
        @click="clickAddNewIndicator"
      >
        Add new indicator
      </BButton>
    </div>

    <PlotIndicatorSelect
      v-if="addNewIndicator"
      :columns="columns"
      class="mt-1"
      label="Select indicator to add"
      @indicator-selected="addNewIndicatorSelected"
    />

    <PlotFromTemplate v-model:visible="fromPlotTemplateVisible" :columns="columns" />

    <PlotIndicator
      v-if="selIndicatorName && !fromPlotTemplateVisible"
      v-model="selIndicator"
      class="mt-1"
      :columns="columns"
    />
    <hr />

    <div class="d-flex flex-row">
      <BButton
        class="ms-1 col"
        variant="secondary"
        size="sm"
        :disabled="addNewIndicator"
        title="Reset to last saved configuration"
        @click="loadPlotConfig"
        >Reset</BButton
      >

      <!--
        Does Resetting a config to "nothing" make sense, or can this be done via "delete / create"?
        <b-button
        class="ms-1 col"
        variant="secondary"
        size="sm"
        :disabled="addNewIndicator"
        title="Start with empty configuration"
        @click="clearConfig"
        >Reset</b-button
      > -->
      <BButton
        :disabled="
          (botStore.activeBot.isWebserverMode && botStore.activeBot.botApiVersion < 2.23) ||
          !botStore.activeBot.isBotOnline ||
          addNewIndicator
        "
        class="ms-1 col"
        variant="secondary"
        size="sm"
        @click="loadPlotConfigFromStrategy"
      >
        From strategy
      </BButton>
      <BButton
        id="showButton"
        class="ms-1 col"
        variant="secondary"
        size="sm"
        :disabled="addNewIndicator"
        title="Show configuration for easy transfer to a strategy"
        @click="showConfig = !showConfig"
        >{{ showConfig ? 'Hide' : 'Show' }}</BButton
      >

      <BButton
        class="ms-1 col"
        variant="primary"
        size="sm"
        data-toggle="tooltip"
        :disabled="addNewIndicator"
        title="Save configuration"
        @click="savePlotConfig"
        >Save</BButton
      >
    </div>
    <BButton
      v-if="showConfig"
      class="ms-1 mt-1"
      variant="secondary"
      size="sm"
      title="Load configuration from text box below"
      @click="loadConfigFromString"
      >Load from String</BButton
    >
    <div v-if="showConfig" class="col-mb-5 ms-1 mt-2">
      <BFormTextarea
        id="TextArea"
        v-model="plotConfigJson"
        class="textArea"
        size="sm"
        :state="tempPlotConfigValid"
      >
      </BFormTextarea>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
