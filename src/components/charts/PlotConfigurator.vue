<script setup lang="ts">
import type { IndicatorConfig, PlotConfig } from '@/types';

const props = withDefaults(
  defineProps<{
    columns: string[];
    isVisible?: boolean;
  }>(),
  {
    isVisible: false,
  },
);

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
const usedColumns = computed((): { text: string; value: string }[] => {
  let usedCols: string[] = [];
  if (isMainPlot.value) {
    usedCols = Object.keys(plotStore.editablePlotConfig.main_plot);
  }
  const selSubPlot_ = plotStore.editablePlotConfig.subplots[selSubPlot.value];
  if (selSubPlot_) {
    usedCols = Object.keys(selSubPlot_);
  }
  return usedCols.map((col) => ({
    value: col,
    text: !props.columns.includes(col) ? `${col} <-- not available in this chart` : col,
  }));
});

function addIndicator(newIndicator: Record<string, IndicatorConfig>) {
  console.log('Adding indicator', newIndicator);
  // const { plotConfig.value } = this;
  const name = Object.keys(newIndicator)[0];
  if (!name) return;

  const indicator = newIndicator[name];
  if (isMainPlot.value) {
    // console.log(`Adding ${name} to MainPlot`);
    plotStore.editablePlotConfig.main_plot[name] = { ...indicator };
  } else {
    // console.log(`Adding ${name} to ${selSubPlot.value}`);
    plotStore.editablePlotConfig.subplots[selSubPlot.value]![name] = { ...indicator };
  }

  plotStore.editablePlotConfig = { ...plotStore.editablePlotConfig };
  // Reset random color
  addNewIndicator.value = false;
}

const selIndicator = computed<Record<string, IndicatorConfig>>({
  get() {
    if (addNewIndicator.value) {
      return {};
    }
    if (selIndicatorName.value) {
      const currentIndicator = currentPlotConfig.value?.[selIndicatorName.value];
      if (currentIndicator) {
        return {
          [selIndicatorName.value]: currentIndicator,
        };
      }
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
    delete plotStore.editablePlotConfig.subplots[selSubPlot.value]?.[selIndicatorName.value];
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
  selSubPlot.value = subplots.value[subplots.value.length - 1] ?? 'main_plot';
}

function renameSubplot(oldName: string, newName: string) {
  const oldSubPlot = plotStore.editablePlotConfig.subplots[oldName];
  if (oldSubPlot) {
    plotStore.editablePlotConfig.subplots[newName] = oldSubPlot;
  }
  selSubPlot.value = newName;
  delete plotStore.editablePlotConfig.subplots[oldName];
}

function loadPlotConfig() {
  // Reset from store
  const existingConf = plotStore.customPlotConfigs[plotStore.plotConfigName];
  if (existingConf) {
    plotStore.editablePlotConfig = deepClone(existingConf);
  }
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
    const strategyPlotConfig = await botStore.activeBot.getStrategyPlotConfig();
    if (strategyPlotConfig) {
      plotStore.editablePlotConfig = strategyPlotConfig;
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
  {
    immediate: true,
  },
);
const fromPlotTemplateVisible = ref(false);

const showTagsInTooltips = computed({
  get() {
    return plotStore.editablePlotConfig.options?.showTags ?? true;
  },
  set(value: boolean) {
    if (!plotStore.editablePlotConfig.options) {
      plotStore.editablePlotConfig.options = {};
    }
    plotStore.editablePlotConfig.options.showTags = value;
  },
});
const markAreaZIndex = computed({
  get() {
    return plotStore.editablePlotConfig.options?.markAreaZIndex ?? 1;
  },
  set(value: number) {
    if (!plotStore.editablePlotConfig.options) {
      plotStore.editablePlotConfig.options = {};
    }
    plotStore.editablePlotConfig.options.markAreaZIndex = value;
  },
});
</script>

<template>
  <div v-if="columns">
    <label for="idPlotConfigName">Plot config name</label>
    <PlotConfigSelect allow-edit></PlotConfigSelect>
    <Divider />
    <BaseCheckbox v-model="showTagsInTooltips" class="mb-1">Show Tags in Tooltips</BaseCheckbox>
    <div class="grid grid-cols-2 items-center gap-2 w-full">
      <label>Mark Area Z-Index <br /><small>(defaults to 1 - Candlechart is at Z=2)</small></label>

      <InputNumber v-model="markAreaZIndex" class="mb-1" size="small" />
    </div>
    <Divider />

    <label for="fieldSel" class="mb">Target Plot</label>
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
      <ListBox
        id="fieldSel"
        v-model="selSubPlot"
        :options="subplots"
        size="small"
        :pt="{
          listContainer: {
            class: 'h-30',
          },
        }"
      >
      </ListBox>
    </EditValue>
    <Divider />
    <div>
      <label for="selectedIndicators">Indicators in this plot</label>
      <ListBox
        id="selectedIndicators"
        v-model="selIndicatorName"
        size="small"
        empty-message="No indicators selected"
        option-label="text"
        option-value="value"
        :disabled="addNewIndicator"
        :options="usedColumns"
        :pt="{
          listContainer: {
            class: 'h-30',
          },
        }"
      >
      </ListBox>
    </div>
    <div class="flex flex-row mt-1 gap-1">
      <Button
        severity="secondary"
        title="Remove indicator to plot"
        size="small"
        :disabled="!selIndicatorName"
        class="col"
        @click="removeIndicator"
      >
        Remove indicator
      </Button>
      <Button
        severity="secondary"
        title="Load indicator config from template"
        size="small"
        @click="fromPlotTemplateVisible = !fromPlotTemplateVisible"
      >
        Indicator from template
      </Button>
      <Button
        severity="primary"
        title="Add indicator to plot"
        size="small"
        class="col"
        :disabled="addNewIndicator"
        @click="clickAddNewIndicator"
      >
        Add new indicator
      </Button>
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
    <Divider />

    <div class="flex flex-row gap-1">
      <Button
        severity="secondary"
        size="small"
        :disabled="addNewIndicator"
        title="Reset to last saved configuration"
        @click="loadPlotConfig"
        >Reset</Button
      >

      <!--
        Does Resetting a config to "nothing" make sense, or can this be done via "delete / create"?
        <Button
        class="ms-1 "
        severity="secondary"
        size="small"
        :disabled="addNewIndicator"
        title="Start with empty configuration"
        @click="clearConfig"
        >Reset</Button
      > -->
      <Button
        :disabled="
          (botStore.activeBot.isWebserverMode &&
            !botStore.activeBot.botFeatures.plotConfigFromServer) ||
          !botStore.activeBot.isBotOnline ||
          addNewIndicator
        "
        severity="secondary"
        size="small"
        @click="loadPlotConfigFromStrategy"
      >
        From strategy
      </Button>
      <Button
        id="showButton"
        severity="secondary"
        size="small"
        :disabled="addNewIndicator"
        title="Show configuration for easy transfer to a strategy"
        @click="showConfig = !showConfig"
        >{{ showConfig ? 'Hide' : 'Show' }}</Button
      >

      <Button
        severity="primary"
        size="small"
        data-toggle="tooltip"
        :disabled="addNewIndicator"
        title="Save configuration"
        @click="savePlotConfig"
        >Save</Button
      >
    </div>
    <Button
      v-if="showConfig"
      class="ms-1 mt-1"
      severity="secondary"
      size="small"
      title="Load configuration from text box below"
      @click="loadConfigFromString"
      >Load from String</Button
    >
    <div v-if="showConfig" class="w-full ms-1 mt-2">
      <Textarea
        id="TextArea"
        v-model="plotConfigJson"
        class="w-full min-h-[250px]"
        size="small"
        :state="tempPlotConfigValid"
      >
      </Textarea>
    </div>
  </div>
</template>

<style scoped lang="css">
.form-group {
  margin-bottom: 0.5rem;
}

hr {
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
}
</style>
