<script setup lang="ts">
import type { ChartSliderPosition, PairHistory, Trade } from '@/types';
import { LoadingStatus } from '@/types';

const props = withDefaults(
  defineProps<{
    trades?: Trade[];
    availablePairs: string[];
    timeframe: string;
    historicView?: boolean;
    /** Reload data on pair switch if in historic view */
    reloadDataOnSwitch?: boolean;
    plotConfigModal?: boolean;
    strategy?: string;
    sliderPosition?: ChartSliderPosition;
  }>(),
  {
    trades: () => [],
    historicView: false,
    plotConfigModal: true,
    reloadDataOnSwitch: false,
    strategy: '',
    sliderPosition: undefined,
  },
);

const emit = defineEmits<{
  refreshData: [pair: string, columns: string[]];
}>();

const settingsStore = useSettingsStore();
const colorStore = useColorStore();
const botStore = useBotStore();
const plotStore = usePlotConfigStore();

const showPlotConfig = ref<boolean>();

const dataset = computed((): PairHistory => {
  if (props.historicView) {
    return botStore.activeBot.history[`${botStore.activeBot.plotPair}__${props.timeframe}`]?.data;
  }
  return botStore.activeBot.candleData[`${botStore.activeBot.plotPair}__${props.timeframe}`]?.data;
});
const strategyName = computed(() => props.strategy || dataset.value?.strategy || '');
const datasetColumns = computed(() =>
  dataset.value ? (dataset.value.all_columns ?? dataset.value.columns) : [],
);
const datasetLoadedColumns = computed(() =>
  dataset.value ? (dataset.value.columns ?? dataset.value.all_columns) : [],
);

const hasDataset = computed(() => dataset.value && dataset.value.data.length > 0);
const isLoadingDataset = computed((): boolean => {
  if (props.historicView) {
    return botStore.activeBot.historyStatus === LoadingStatus.loading;
  }

  return botStore.activeBot.candleDataStatus === LoadingStatus.loading;
});
const noDatasetText = computed((): string => {
  const status = props.historicView
    ? botStore.activeBot.historyStatus
    : botStore.activeBot.candleDataStatus;

  switch (status) {
    case LoadingStatus.not_loaded:
      return 'Not loaded yet.';
    case LoadingStatus.loading:
      return 'Loading...';
    case LoadingStatus.success:
      return 'No data available';
    case LoadingStatus.error:
      return 'Failed to load data';
    default:
      return 'Unknown';
  }
});
const showPlotConfigModal = ref(false);

function showConfigurator() {
  if (props.plotConfigModal) {
    showPlotConfigModal.value = !showPlotConfigModal.value;
  } else {
    showPlotConfig.value = !showPlotConfig.value;
  }
}

function refresh() {
  emit('refreshData', botStore.activeBot.plotPair, plotStore.usedColumns);
}

function refreshIfNecessary() {
  if (!hasDataset.value) {
    refresh();
  }
}

watch(
  () => props.availablePairs,
  () => {
    if (!props.availablePairs.find((p) => p === botStore.activeBot.plotPair)) {
      [botStore.activeBot.plotPair] = props.availablePairs;
      refresh();
    }
  },
);

watch(
  () => botStore.activeBot.selectedPair,
  () => {
    botStore.activeBot.plotPair = botStore.activeBot.selectedPair;
  },
);

watch(
  () => botStore.activeBot.plotPair,
  () => {
    if (!props.historicView) {
      refresh();
    } else if (props.reloadDataOnSwitch) {
      refreshIfNecessary();
    }
  },
);

watch(
  () => plotStore.plotConfig,
  () => {
    // Trigger reload if the used columns are not loaded yet but would be available.
    const hasAllColumns = plotStore.usedColumns.some(
      (c) => datasetColumns.value.includes(c) && !datasetLoadedColumns.value.includes(c),
    );

    if (settingsStore.useReducedPairCalls && hasAllColumns) {
      refresh();
    }
  },
);

watch(
  () => props.timeframe,
  () => {
    refreshIfNecessary();
  },
);

onMounted(() => {
  showPlotConfig.value = props.plotConfigModal;
  if (botStore.activeBot.selectedPair) {
    botStore.activeBot.plotPair = botStore.activeBot.selectedPair;
  } else if (props.availablePairs.length > 0) {
    [botStore.activeBot.plotPair] = props.availablePairs;
  }
  plotStore.plotConfigChanged();
  if (!props.historicView) {
    refreshIfNecessary();
  }
});
</script>

<template>
  <div class="flex h-full">
    <div class="flex-fill w-full flex-col align-items-stretch flex h-full">
      <div class="flex me-0">
        <div class="ms-1 md:ms-2 flex flex-wrap md:flex-nowrap items-center gap-1">
          <span class="md:ms-2 text-nowrap">{{ strategyName }} | {{ timeframe || '' }}</span>
          <Select
            v-model="botStore.activeBot.plotPair"
            class="md:ms-2"
            :options="availablePairs"
            size="small"
            :clearable="false"
            @input="refresh"
          >
          </Select>

          <Button
            title="Refresh chart"
            severity="secondary"
            :disabled="!!!botStore.activeBot.plotPair || isLoadingDataset"
            size="small"
            @click="refresh"
          >
            <i-mdi-refresh />
          </Button>
          <ProgressSpinner
            v-if="isLoadingDataset"
            class="w-8 h-8"
            stroke-width="8"
            small
            label="Spinning"
          />
          <div class="flex flex-col">
            <div class="flex flex-row flex-wrap">
              <small v-if="dataset" class="ms-2 text-sm text-nowrap" title="Long entry signals"
                >Long entries: {{ dataset.enter_long_signals || dataset.buy_signals }}</small
              >
              <small v-if="dataset" class="ms-2 text-sm text-nowrap" title="Long exit signals"
                >Long exit: {{ dataset.exit_long_signals || dataset.sell_signals }}</small
              >
            </div>
            <div class="flex flex-row flex-wrap">
              <small v-if="dataset && dataset.enter_short_signals" class="ms-2 text-sm text-nowrap"
                >Short entries: {{ dataset.enter_short_signals }}</small
              >
              <small v-if="dataset && dataset.exit_short_signals" class="ms-2 text-sm text-nowrap"
                >Short exits: {{ dataset.exit_short_signals }}</small
              >
            </div>
          </div>
        </div>
        <div class="ms-auto flex items-center gap-2">
          <BaseCheckbox v-model="settingsStore.showMarkArea">
            <span class="text-nowrap">Show Chart Areas</span>
          </BaseCheckbox>
          <BaseCheckbox v-model="settingsStore.useHeikinAshiCandles">
            <span class="text-nowrap">Heikin Ashi</span>
          </BaseCheckbox>

          <PlotConfigSelect></PlotConfigSelect>

          <div class="me-0 md:me-1">
            <Button
              size="small"
              title="Plot configurator"
              severity="secondary"
              @click="showConfigurator"
            >
              <template #icon>
                <i-mdi-cog width="12" height="12" />
              </template>
            </Button>
          </div>
        </div>
      </div>
      <div class="h-full flex">
        <div class="min-w-0 w-full flex-1">
          <CandleChart
            v-if="hasDataset"
            :dataset="dataset"
            :trades="trades"
            :plot-config="plotStore.plotConfig"
            :heikin-ashi="settingsStore.useHeikinAshiCandles"
            :show-mark-area="settingsStore.showMarkArea"
            :use-u-t-c="settingsStore.timezone === 'UTC'"
            :theme="settingsStore.chartTheme"
            :slider-position="sliderPosition"
            :color-up="colorStore.colorUp"
            :color-down="colorStore.colorDown"
            :start-candle-count="settingsStore.chartDefaultCandleCount"
            :label-side="settingsStore.chartLabelSide"
          />
          <div v-else class="m-auto">
            <ProgressSpinner v-if="isLoadingDataset" class="w-5 h-5" label="Spinning" />
            <div v-else class="text-lg">
              {{ noDatasetText }}
            </div>
            <p v-if="botStore.activeBot.historyTakesLonger">
              This is taking longer than expected ... Hold on ...
            </p>
          </div>
        </div>
        <Transition name="fade">
          <div
            v-if="!plotConfigModal"
            v-show="showPlotConfig"
            class="grow border rounded-md ps-1 border-surface-300 dark:border-surface-700"
          >
            <PlotConfigurator :columns="datasetColumns" :is-visible="showPlotConfig ?? false" />
          </div>
        </Transition>
      </div>
    </div>
    <Dialog
      v-if="plotConfigModal"
      id="plotConfiguratorModal"
      v-model:visible="showPlotConfigModal"
      header="Plot Configurator"
      ok-only
      hide-backdrop
    >
      <PlotConfigurator :is-visible="showPlotConfigModal" :columns="datasetColumns" />
    </Dialog>
  </div>
</template>

<style scoped lang="css">
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
