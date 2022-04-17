<template>
  <div class="d-flex h-100">
    <div class="flex-fill container-fluid flex-column align-items-stretch d-flex h-100">
      <b-modal
        v-if="plotConfigModal"
        id="plotConfiguratorModal"
        title="Plot Configurator"
        ok-only
        hide-backdrop
        button-size="sm"
      >
        <PlotConfigurator v-model="plotConfig" :columns="datasetColumns" />
      </b-modal>

      <div class="row mr-0">
        <div class="ml-2 d-flex flex-wrap flex-md-nowrap align-items-center">
          <span class="ml-2 text-nowrap">{{ strategyName }} | {{ timeframe || '' }}</span>
          <v-select
            v-model="pair"
            class="ml-2"
            :options="availablePairs"
            style="min-width: 7em"
            size="sm"
            :clearable="false"
            @change="refresh"
          >
          </v-select>

          <b-button class="ml-2" :disabled="!!!pair" size="sm" @click="refresh">&#x21bb;</b-button>
          <small v-if="dataset" class="ml-2 text-nowrap" title="Long entry signals"
            >Long signals: {{ dataset.enter_long_signals || dataset.buy_signals }}</small
          >
          <small v-if="dataset" class="ml-2 text-nowrap" title="Long exit signals"
            >Long exit: {{ dataset.exit_long_signals || dataset.sell_signals }}</small
          >
          <small v-if="dataset && dataset.enter_short_signals" class="ml-2 text-nowrap"
            >Short entries: {{ dataset.enter_short_signals }}</small
          >
          <small v-if="dataset && dataset.exit_short_signals" class="ml-2 text-nowrap"
            >Short exits: {{ dataset.exit_short_signals }}</small
          >
        </div>
        <div class="ml-auto d-flex align-items-center">
          <b-form-checkbox v-model="heikinAshi">Heikin Ashi</b-form-checkbox>

          <div class="ml-2">
            <b-select
              v-model="plotConfigName"
              :options="availablePlotConfigNames"
              size="sm"
              @change="plotConfigChanged"
            >
            </b-select>
          </div>

          <div class="ml-2 mr-0 mr-md-1">
            <b-button size="sm" title="Plot configurator" @click="showConfigurator">
              &#9881;
            </b-button>
          </div>
        </div>
      </div>
      <div class="row mr-1 ml-1 h-100">
        <CandleChart
          v-if="hasDataset"
          :dataset="dataset"
          :trades="trades"
          :plot-config="plotConfig"
          :heikin-ashi="heikinAshi"
          :use-u-t-c="settingsStore.timezone === 'UTC'"
          :theme="getChartTheme"
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
        <PlotConfigurator v-model="plotConfig" :columns="datasetColumns" :as-modal="false" />
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Trade, PairHistory, EMPTY_PLOTCONFIG, PlotConfig } from '@/types';
import CandleChart from '@/components/charts/CandleChart.vue';
import PlotConfigurator from '@/components/charts/PlotConfigurator.vue';
import { getCustomPlotConfig, getPlotConfigName } from '@/shared/storage';
import { BotStoreGetters } from '@/store/modules/ftbot';
import vSelect from 'vue-select';
import StoreModules from '@/store/storeSubModules';
import { useSettingsStore } from '@/stores/settings';

import { defineComponent, ref, computed, watch, onMounted } from '@vue/composition-api';
import { useGetters, useNamespacedActions, useNamespacedGetters } from 'vuex-composition-helpers';

export default defineComponent({
  name: 'CandleChartContainer',
  components: { CandleChart, PlotConfigurator, vSelect },
  props: {
    trades: { required: false, default: [], type: Array as () => Trade[] },
    availablePairs: { required: true, type: Array as () => string[] },
    timeframe: { required: true, type: String },
    historicView: { required: false, default: false, type: Boolean },
    plotConfigModal: { required: false, default: true, type: Boolean },
    /** Only required if historicView is true */
    timerange: { required: false, default: '', type: String },
    /** Only required if historicView is true */
    strategy: { required: false, default: '', type: String },
  },
  setup(props, { root }) {
    const settingsStore = useSettingsStore();
    const { getChartTheme } = useGetters(['getChartTheme']);
    const {
      availablePlotConfigNames,
      candleDataStatus,
      candleData,
      historyStatus,
      history,
      selectedPair,
    } = useNamespacedGetters(StoreModules.ftbot, [
      BotStoreGetters.availablePlotConfigNames,
      BotStoreGetters.candleDataStatus,
      BotStoreGetters.candleData,
      BotStoreGetters.historyStatus,
      BotStoreGetters.history,
      BotStoreGetters.selectedPair,
    ]);
    const { setPlotConfigName, getPairCandles, getPairHistory } = useNamespacedActions(
      StoreModules.ftbot,
      ['setPlotConfigName', 'getPairCandles', 'getPairHistory'],
    );
    const pair = ref('');
    const plotConfig = ref<PlotConfig>({ ...EMPTY_PLOTCONFIG });
    const plotConfigName = ref('');
    const heikinAshi = ref(false);
    const showPlotConfig = ref(props.plotConfigModal);

    const dataset = computed((): PairHistory => {
      if (props.historicView) {
        return history.value[`${pair.value}__${props.timeframe}`];
      }
      return candleData.value[`${pair.value}__${props.timeframe}`];
    });
    const strategyName = computed(() => props.strategy || dataset.value?.strategy || '');
    const datasetColumns = computed(() => (dataset.value ? dataset.value.columns : []));
    const hasDataset = computed(() => !!dataset.value);
    const isLoadingDataset = computed((): boolean => {
      if (props.historicView) {
        return historyStatus.value === 'loading';
      }

      return candleDataStatus.value === 'loading';
    });
    const noDatasetText = computed((): string => {
      const status = props.historicView ? historyStatus.value : candleDataStatus.value;

      switch (status) {
        case 'loading':
          return 'Loading...';

        case 'success':
          return 'No data available';

        case 'error':
          return 'Failed to load data';

        default:
          return 'Unknown';
      }
    });

    const plotConfigChanged = () => {
      console.log('plotConfigChanged');
      plotConfig.value = getCustomPlotConfig(plotConfigName.value);
      setPlotConfigName(plotConfigName.value);
    };

    const showConfigurator = () => {
      if (props.plotConfigModal) {
        root.$bvModal.show('plotConfiguratorModal');
      } else {
        showPlotConfig.value = !showPlotConfig.value;
      }
    };
    const refresh = () => {
      if (pair.value && props.timeframe) {
        if (props.historicView) {
          getPairHistory({
            pair: pair.value,
            timeframe: props.timeframe,
            timerange: props.timerange,
            strategy: props.strategy,
          });
        } else {
          getPairCandles({ pair: pair.value, timeframe: props.timeframe, limit: 500 });
        }
      }
    };

    watch(props.availablePairs, () => {
      if (!props.availablePairs.find((p) => p === pair.value)) {
        [pair.value] = props.availablePairs;
        refresh();
      }
    });

    watch(selectedPair, () => {
      pair.value = selectedPair.value;
      refresh();
    });

    onMounted(() => {
      if (selectedPair.value) {
        pair.value = selectedPair.value;
      } else if (props.availablePairs.length > 0) {
        [pair.value] = props.availablePairs;
      }
      plotConfigName.value = getPlotConfigName();
      plotConfig.value = getCustomPlotConfig(plotConfigName.value);

      if (!hasDataset) {
        refresh();
      }
    });

    return {
      getChartTheme,
      availablePlotConfigNames,
      candleDataStatus,
      candleData,
      historyStatus,
      history,
      selectedPair,
      setPlotConfigName,
      getPairCandles,
      getPairHistory,
      dataset,
      strategyName,
      datasetColumns,
      isLoadingDataset,
      noDatasetText,
      hasDataset,
      settingsStore,
      heikinAshi,
      plotConfigChanged,
      showPlotConfig,
      showConfigurator,
      refresh,
      plotConfigName,
      pair,
      plotConfig,
    };
  },
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
