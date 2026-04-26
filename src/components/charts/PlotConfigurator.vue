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
const usedColumns = computed((): { label: string; value: string }[] => {
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
    label: !props.columns.includes(col) ? `${col} <-- not available in this chart` : col,
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
  if (botStore.activeBot.isWebserverMode && !botStore.activeBot.strategy?.strategy) {
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
    <UFormField label="Plot config name" class="text-md">
      <PlotConfigSelect allow-edit></PlotConfigSelect>
    </UFormField>
    <USeparator class="my-2" />
    <BaseCheckbox v-model="showTagsInTooltips" class="mb-1">Show Tags in Tooltips</BaseCheckbox>
    <div class="grid grid-cols-2 items-center gap-2 w-full">
      <label>Mark Area Z-Index <br /><small>(defaults to 1 - Candlechart is at Z=2)</small></label>

      <UInputNumber v-model="markAreaZIndex" class="mb-1" />
    </div>
    <USeparator class="my-2" />

    <UFormField label="Target Plot" class="text-md">
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
        <UCommandPalette
          id="fieldSel"
          class="rounded ring ring-accented"
          v-model="selSubPlot"
          :input="false"
          value-key="value"
          :groups="[
            {
              id: 'plots',
              items: subplots.map((plot) => ({
                value: plot,
                label: plot,
              })),
            },
          ]"
        >
        </UCommandPalette>
      </EditValue>
    </UFormField>
    <USeparator class="my-2" />
    <UFormField label="Indicators in this plot" class="text-md">
      <UCommandPalette
        class="rounded ring ring-accented"
        v-model="selIndicatorName"
        value-key="value"
        :input="false"
        :groups="[
          {
            id: 'indicators',
            items: usedColumns,
          },
        ]"
      >
      </UCommandPalette>
    </UFormField>
    <div class="flex flex-row mt-1 gap-1">
      <UButton
        color="neutral"
        title="Remove indicator to plot"
        :disabled="!selIndicatorName"
        class="col"
        @click="removeIndicator"
        label="Remove indicator"
        icon="mdi:minus-box-outline"
      />

      <UButton
        color="neutral"
        title="Load indicator config from template"
        @click="fromPlotTemplateVisible = !fromPlotTemplateVisible"
        label="From template"
        icon="mdi:folder-arrow-down-outline"
      />

      <UButton
        title="Add indicator to plot"
        icon="mdi:plus-box-outline"
        class="col"
        :disabled="addNewIndicator"
        @click="clickAddNewIndicator"
        label="Add indicator"
      />
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
    <USeparator class="my-2" />

    <div class="flex flex-row gap-1">
      <UButton
        color="neutral"
        :disabled="addNewIndicator"
        title="Reset to last saved configuration"
        @click="loadPlotConfig"
        label="Reset"
        icon="mdi:restore"
      />

      <!--
        Does Resetting a config to "nothing" make sense, or can this be done via "delete / create"?
        <UButton
        class="ms-1 "
        color="neutral"
        :disabled="addNewIndicator"
        title="Start with empty configuration"
        @click="clearConfig"
        >Reset</UButton
      > -->
      <UButton
        :disabled="
          (botStore.activeBot.isWebserverMode &&
            !botStore.activeBot.botFeatures.plotConfigFromServer) ||
          !botStore.activeBot.isBotOnline ||
          addNewIndicator
        "
        color="neutral"
        label="From strategy"
        icon="mdi:download"
        @click="loadPlotConfigFromStrategy"
      />

      <UButton
        id="showButton"
        color="neutral"
        :disabled="addNewIndicator"
        title="Show configuration for easy transfer to a strategy"
        @click="showConfig = !showConfig"
        :icon="showConfig ? 'mdi:eye-off' : 'mdi:eye'"
        :label="showConfig ? 'Hide' : 'Show'"
      />

      <UButton
        data-toggle="tooltip"
        :disabled="addNewIndicator"
        title="Save configuration"
        @click="savePlotConfig"
        label="Save"
        variant="solid"
        icon="mdi:content-save"
      />
    </div>
    <UButton
      v-if="showConfig"
      class="mt-1"
      color="neutral"
      size="sm"
      title="Load configuration from text box below"
      @click="loadConfigFromString"
      icon="mdi:upload"
      >Load from string below</UButton
    >
    <div v-if="showConfig" class="w-full ms-1 mt-2">
      <UTextarea
        id="TextArea"
        v-model="plotConfigJson"
        class="w-full"
        autoresize
        :maxrows="10"
        :state="tempPlotConfigValid"
      >
      </UTextarea>
    </div>
  </div>
</template>
