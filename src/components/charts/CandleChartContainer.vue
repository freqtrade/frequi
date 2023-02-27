<template>
  <div class="d-flex h-100">
    <div class="flex-fill w-100 flex-column align-items-stretch d-flex h-100">
      <div class="d-flex me-0">
        <div class="ms-2 d-flex flex-wrap flex-md-nowrap align-items-center w-auto">
          <span class="ms-2 text-nowrap">{{ strategyName }} | {{ timeframe || '' }}</span>
          <v-select
            v-model="pair"
            class="ms-2"
            :options="availablePairs"
            style="min-width: 7em"
            size="sm"
            :clearable="false"
            @input="refresh"
          >
          </v-select>

          <b-button class="ms-2" :disabled="!!!pair" size="sm" @click="refresh">&#x21bb;</b-button>
          <small v-if="dataset" class="ms-2 text-nowrap" title="Long entry signals"
            >Long signals: {{ dataset.enter_long_signals || dataset.buy_signals }}</small
          >
          <small v-if="dataset" class="ms-2 text-nowrap" title="Long exit signals"
            >Long exit: {{ dataset.exit_long_signals || dataset.sell_signals }}</small
          >
          <small v-if="dataset && dataset.enter_short_signals" class="ms-2 text-nowrap"
            >Short entries: {{ dataset.enter_short_signals }}</small
          >
          <small v-if="dataset && dataset.exit_short_signals" class="ms-2 text-nowrap"
            >Short exits: {{ dataset.exit_short_signals }}</small
          >
        </div>
        <div class="ms-auto d-flex align-items-center w-auto">
          <b-form-checkbox v-model="settingsStore.useHeikinAshiCandles"
            >Heikin Ashi</b-form-checkbox
          >

          <div class="ms-2">
            <b-form-select
              v-model="plotStore.plotConfigName"
              :options="plotStore.availablePlotConfigNames"
              size="sm"
              @change="plotStore.plotConfigChanged"
            >
            </b-form-select>
          </div>

          <div class="ms-2 me-0 me-md-1">
            <b-button size="sm" title="Plot configurator" @click="showConfigurator">
              &#9881;
            </b-button>
          </div>
        </div>
      </div>
      <div class="me-1 ms-1 h-100">
        <CandleChart
          v-if="hasDataset"
          :dataset="dataset"
          :trades="trades"
          :plot-config="plotStore.plotConfig"
          :heikin-ashi="settingsStore.useHeikinAshiCandles"
          :use-u-t-c="settingsStore.timezone === 'UTC'"
          :theme="settingsStore.chartTheme"
          :slider-position="sliderPosition"
        >
        </CandleChart>
        <div v-else class="m-auto">
          <b-spinner v-if="isLoadingDataset" label="Spinning" />

          <div v-else style="font-size: 1.5rem">
            {{ noDatasetText }}
          </div>
        </div>
      </div>
    </div>
    <transition name="fade" mode="in-out">
      <div v-if="!plotConfigModal" v-show="showPlotConfig" class="w-25 config-sidebar">
        <PlotConfigurator :columns="datasetColumns" :as-modal="false" />
      </div>
    </transition>
    <b-modal
      v-if="plotConfigModal"
      id="plotConfiguratorModal"
      v-model="showPlotConfigModal"
      title="Plot Configurator"
      ok-only
      hide-backdrop
    >
      <PlotConfigurator v-if="showPlotConfigModal" :columns="datasetColumns" />
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { Trade, PairHistory, LoadingStatus, ChartSliderPosition } from '@/types';
import CandleChart from '@/components/charts/CandleChart.vue';
import PlotConfigurator from '@/components/charts/PlotConfigurator.vue';
import vSelect from 'vue-select';
import { useSettingsStore } from '@/stores/settings';
import { usePlotConfigStore } from '@/stores/plotConfig';

import { ref, computed, onMounted, watch } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

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
  sliderPosition: {
    required: false,
    type: Object as () => ChartSliderPosition,
    default: () => undefined,
  },
});
const settingsStore = useSettingsStore();
const botStore = useBotStore();
const plotStore = usePlotConfigStore();

const pair = ref('');
const showPlotConfig = ref(props.plotConfigModal);

const dataset = computed((): PairHistory => {
  if (props.historicView) {
    return botStore.activeBot.history[`${pair.value}__${props.timeframe}`]?.data;
  }
  return botStore.activeBot.candleData[`${pair.value}__${props.timeframe}`]?.data;
});
const strategyName = computed(() => props.strategy || dataset.value?.strategy || '');
const datasetColumns = computed(() => (dataset.value ? dataset.value.columns : []));
const hasDataset = computed(() => !!dataset.value);
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
const showConfigurator = () => {
  if (props.plotConfigModal) {
    showPlotConfigModal.value = !showPlotConfigModal.value;
  } else {
    showPlotConfig.value = !showPlotConfig.value;
  }
};
const refresh = () => {
  console.log('refresh', pair.value, props.timeframe);
  if (pair.value && props.timeframe) {
    if (props.historicView) {
      botStore.activeBot.getPairHistory({
        pair: pair.value,
        timeframe: props.timeframe,
        timerange: props.timerange,
        strategy: props.strategy,
      });
    } else {
      botStore.activeBot.getPairCandles({
        pair: pair.value,
        timeframe: props.timeframe,
        limit: 500,
      });
    }
  }
};

watch(
  () => props.availablePairs,
  () => {
    if (!props.availablePairs.find((p) => p === pair.value)) {
      [pair.value] = props.availablePairs;
      refresh();
    }
  },
);

watch(
  () => botStore.activeBot.selectedPair,
  () => {
    pair.value = botStore.activeBot.selectedPair;
    refresh();
  },
);

onMounted(() => {
  if (botStore.activeBot.selectedPair) {
    pair.value = botStore.activeBot.selectedPair;
  } else if (props.availablePairs.length > 0) {
    [pair.value] = props.availablePairs;
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

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
