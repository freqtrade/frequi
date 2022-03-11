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
          <small v-if="dataset" class="ml-2 text-nowrap"
            >Buysignals: {{ dataset.buy_signals }}</small
          >
          <small v-if="dataset" class="ml-2 text-nowrap"
            >SellSignals: {{ dataset.sell_signals }}</small
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
          :use-u-t-c="timezone === 'UTC'"
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
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Getter, namespace } from 'vuex-class';
import {
  Trade,
  PairHistory,
  EMPTY_PLOTCONFIG,
  PlotConfig,
  PairCandlePayload,
  PairHistoryPayload,
  LoadingStatus,
} from '@/types';
import CandleChart from '@/components/charts/CandleChart.vue';
import PlotConfigurator from '@/components/charts/PlotConfigurator.vue';
import { getCustomPlotConfig, getPlotConfigName } from '@/shared/storage';
import { BotStoreGetters } from '@/store/modules/ftbot';
import { SettingsGetters } from '@/store/modules/settings';
import vSelect from 'vue-select';
import StoreModules from '@/store/storeSubModules';

const ftbot = namespace(StoreModules.ftbot);
const uiSettingsNs = namespace(StoreModules.uiSettings);

@Component({ components: { CandleChart, PlotConfigurator, vSelect } })
export default class CandleChartContainer extends Vue {
  @Prop({ required: true }) readonly availablePairs!: string[];

  @Prop({ required: true }) readonly timeframe!: string;

  @Prop({ required: false, default: () => [] }) readonly trades!: Array<Trade>;

  @Prop({ required: false, default: false }) historicView!: boolean;

  @Prop({ required: false, default: true }) plotConfigModal!: boolean;

  /** Only required if historicView is true */
  @Prop({ required: false, default: false }) timerange!: string;

  /**
   * Only required if historicView is true
   */
  @Prop({ required: false, default: false }) strategy!: string;

  pair = '';

  plotConfig: PlotConfig = { ...EMPTY_PLOTCONFIG };

  plotConfigName = '';

  showPlotConfig = this.plotConfigModal;

  heikinAshi: boolean = false;

  @Getter getChartTheme!: string;

  @ftbot.Getter [BotStoreGetters.availablePlotConfigNames]!: string[];

  @ftbot.Action setPlotConfigName;

  @ftbot.Getter [BotStoreGetters.candleDataStatus]!: LoadingStatus;

  @ftbot.Getter [BotStoreGetters.candleData]!: PairHistory;

  @ftbot.Getter [BotStoreGetters.historyStatus]!: LoadingStatus;

  @ftbot.Getter [BotStoreGetters.history]!: PairHistory;

  @ftbot.Getter [BotStoreGetters.selectedPair]!: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action public getPairCandles!: (payload: PairCandlePayload) => void;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action public getPairHistory!: (payload: PairHistoryPayload) => void;

  @uiSettingsNs.Getter [SettingsGetters.timezone]: string;

  get dataset(): PairHistory {
    if (this.historicView) {
      return this.history[`${this.pair}__${this.timeframe}`];
    }
    return this.candleData[`${this.pair}__${this.timeframe}`];
  }

  get strategyName() {
    return this.strategy || this.dataset?.strategy || '';
  }

  get datasetColumns() {
    return this.dataset ? this.dataset.columns : [];
  }

  get isLoadingDataset(): boolean {
    if (this.historicView) {
      return this.historyStatus === 'loading';
    }

    return this.candleDataStatus === 'loading';
  }

  get noDatasetText(): string {
    const status = this.historicView ? this.historyStatus : this.candleDataStatus;

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
  }

  get hasDataset(): boolean {
    return !!this.dataset;
  }

  mounted() {
    if (this.selectedPair) {
      this.pair = this.selectedPair;
    } else if (this.availablePairs.length > 0) {
      [this.pair] = this.availablePairs;
    }
    this.plotConfigName = getPlotConfigName();
    this.plotConfig = getCustomPlotConfig(this.plotConfigName);

    if (!this.hasDataset) {
      this.refresh();
    }
  }

  plotConfigChanged() {
    console.log('plotConfigChanged');
    this.plotConfig = getCustomPlotConfig(this.plotConfigName);
    this.setPlotConfigName(this.plotConfigName);
  }

  showConfigurator() {
    if (this.plotConfigModal) {
      this.$bvModal.show('plotConfiguratorModal');
    } else {
      this.showPlotConfig = !this.showPlotConfig;
    }
  }

  refresh() {
    if (this.pair && this.timeframe) {
      if (this.historicView) {
        this.getPairHistory({
          pair: this.pair,
          timeframe: this.timeframe,
          timerange: this.timerange,
          strategy: this.strategy,
        });
      } else {
        this.getPairCandles({ pair: this.pair, timeframe: this.timeframe, limit: 500 });
      }
    }
  }

  @Watch('availablePairs')
  watchAvailablePairs() {
    if (!this.availablePairs.find((pair) => pair === this.pair)) {
      [this.pair] = this.availablePairs;
      this.refresh();
    }
  }

  @Watch(BotStoreGetters.selectedPair)
  watchSelectedPair() {
    this.pair = this.selectedPair;
    this.refresh();
  }
}
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
