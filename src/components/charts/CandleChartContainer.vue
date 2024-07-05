<template>
  <div class="d-flex h-100">
    <div class="flex-fill w-100 flex-column align-items-stretch d-flex h-100">
      <div class="d-flex me-0">
        <div class="ms-1 ms-md-2 d-flex flex-wrap flex-md-nowrap align-items-center w-auto">
          <span class="ms-md-2 text-nowrap">{{ strategyName }} | {{ timeframe || '' }}</span>
          <VSelect
            v-model="botStore.activeBot.plotPair"
            class="ms-md-2"
            :options="availablePairs"
            style="min-width: 7em"
            size="sm"
            :clearable="false"
            @input="refresh"
          >
          </VSelect>

          <BButton
            title="Refresh chart"
            class="ms-2"
            :disabled="!!!botStore.activeBot.plotPair || isLoadingDataset"
            size="sm"
            @click="refresh"
          >
            <i-mdi-refresh />
          </BButton>
          <BSpinner v-if="isLoadingDataset" small class="ms-2" label="Spinning" />
          <div class="d-flex flex-column">
            <div class="d-flex flex-row flex-wrap">
              <small v-if="dataset" class="ms-2 text-nowrap" title="Long entry signals"
                >Long entries: {{ dataset.enter_long_signals || dataset.buy_signals }}</small
              >
              <small v-if="dataset" class="ms-2 text-nowrap" title="Long exit signals"
                >Long exit: {{ dataset.exit_long_signals || dataset.sell_signals }}</small
              >
            </div>
            <div class="d-flex flex-row flex-wrap">
              <small v-if="dataset && dataset.enter_short_signals" class="ms-2 text-nowrap"
                >Short entries: {{ dataset.enter_short_signals }}</small
              >
              <small v-if="dataset && dataset.exit_short_signals" class="ms-2 text-nowrap"
                >Short exits: {{ dataset.exit_short_signals }}</small
              >
            </div>
          </div>
        </div>
        <div class="ms-auto d-flex align-items-center w-auto">
          <BFormCheckbox v-model="settingsStore.useHeikinAshiCandles"
            ><small class="text-nowrap">Heikin Ashi</small></BFormCheckbox
          >

          <div class="ms-2">
            <PlotConfigSelect></PlotConfigSelect>
          </div>

          <div class="ms-2 me-0 me-md-1">
            <BButton size="sm" title="Plot configurator" @click="showConfigurator">
              <i-mdi-cog width="12" height="12" />
            </BButton>
          </div>
        </div>
      </div>
      <div class="h-100 w-100 d-flex">
        <div class="flex-grow-1">
          <CandleChart
            v-if="hasDataset"
            :dataset="dataset"
            :trades="trades"
            :plot-config="plotStore.plotConfig"
            :heikin-ashi="settingsStore.useHeikinAshiCandles"
            :use-u-t-c="settingsStore.timezone === 'UTC'"
            :theme="settingsStore.chartTheme"
            :slider-position="sliderPosition"
            :color-up="colorStore.colorUp"
            :color-down="colorStore.colorDown"
            :label-side="settingsStore.chartLabelSide"
          />
          <div v-else class="m-auto">
            <BSpinner v-if="isLoadingDataset" label="Spinning" />
            <div v-else style="font-size: 1.5rem">
              {{ noDatasetText }}
            </div>
            <p v-if="botStore.activeBot.historyTakesLonger">
              This is taking longer than expected ... Hold on ...
            </p>
          </div>
        </div>
        <Transition name="fade">
          <div v-if="!plotConfigModal" v-show="showPlotConfig" class="w-25">
            <PlotConfigurator :columns="datasetColumns" :is-visible="showPlotConfig ?? false" />
          </div>
        </Transition>
      </div>
    </div>
    <BModal
      v-if="plotConfigModal"
      id="plotConfiguratorModal"
      v-model="showPlotConfigModal"
      title="Plot Configurator"
      ok-only
      hide-backdrop
    >
      <PlotConfigurator :is-visible="showPlotConfigModal" :columns="datasetColumns" />
    </BModal>
  </div>
</template>

<script setup lang="ts">
import { usePlotConfigStore } from '@/stores/plotConfig';
import { useSettingsStore } from '@/stores/settings';
import { ChartSliderPosition, LoadingStatus, PairHistory, Trade } from '@/types';
import VSelect from 'vue-select';

import { useBotStore } from '@/stores/ftbotwrapper';

import { useColorStore } from '@/stores/colors';

const props = defineProps({
  trades: { required: false, default: () => [], type: Array as () => Trade[] },
  availablePairs: { required: true, type: Array as () => string[] },
  timeframe: { required: true, type: String },
  historicView: { required: false, default: false, type: Boolean },
  plotConfigModal: { required: false, default: true, type: Boolean },
  /** Only required if historicView is true */
  timerange: { required: false, default: '', type: String },
  /** Only required if historicView is true */
  strategy: { required: false, default: '', type: String },
  freqaiModel: { required: false, default: undefined, type: String },
  sliderPosition: {
    required: false,
    type: Object as () => ChartSliderPosition,
    default: () => undefined,
  },
});
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
  dataset.value ? dataset.value.all_columns ?? dataset.value.columns : [],
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
  // console.log('refresh', botStore.activeBot.plotPair, props.timeframe);
  if (botStore.activeBot.plotPair && props.timeframe) {
    if (props.historicView) {
      botStore.activeBot.getPairHistory({
        pair: botStore.activeBot.plotPair,
        timeframe: props.timeframe,
        timerange: props.timerange,
        strategy: props.strategy,
        freqaimodel: props.freqaiModel,
        columns: plotStore.usedColumns,
      });
    } else {
      botStore.activeBot.getPairCandles({
        pair: botStore.activeBot.plotPair,
        timeframe: props.timeframe,
        columns: plotStore.usedColumns,
      });
    }
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
    }
  },
);

watch(
  () => plotStore.plotConfig,
  () => {
    // all plotstore.usedColumns are in the dataset
    const hasAllColumns = plotStore.usedColumns.every((c) => datasetColumns.value.includes(c));
    if (settingsStore.useReducedPairCalls && !hasAllColumns) {
      console.log('triggering refresh');
      refresh();
    }
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
  if (!hasDataset.value) {
    refresh();
  }
});
</script>

<style scoped lang="scss">
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
