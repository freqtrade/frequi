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
        <div class="col-mb-2 ml-2">
          <b-select v-model="pair" :options="availablePairs" size="sm" @change="refresh">
          </b-select>
        </div>
        <div class="col-mb-2 ml-2 mr-2">
          <b-button :disabled="!!!pair" size="sm" @click="refresh">&#x21bb;</b-button>
        </div>
        <div v-if="hasDataset" class="col-mb-2 ml-2 mr-2">
          <small>Buysignals: {{ dataset.buy_signals }}</small>
          <small class="ml-2">SellSignals: {{ dataset.sell_signals }}</small>
        </div>
        <div class="col-mb-2 ml-auto mr-2">
          <b-select
            v-model="plotConfigName"
            :options="availablePlotConfigNames"
            size="sm"
            @change="plotConfigChanged"
          >
          </b-select>
        </div>

        <div class="col-mb-2 mr-2 d-flex align-items-center">
          <b-checkbox v-model="useUTC" title="Use UTC for graph">useUTC</b-checkbox>
        </div>
        <div class="col-mb-2 mr-1">
          <b-button size="sm" title="Plot configurator" @click="showConfigurator">&#9881;</b-button>
        </div>
      </div>
      <div class="row mr-1 ml-1 h-100">
        <CandleChart
          v-if="hasDataset"
          :dataset="dataset"
          :trades="trades"
          :plot-config="plotConfig"
          :use-u-t-c="useUTC"
          :theme="getChartTheme"
        >
        </CandleChart>
        <label v-else style="margin: auto auto; font-size: 1.5rem">No data available</label>
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
} from '@/types';
import CandleChart from '@/components/charts/CandleChart.vue';
import PlotConfigurator from '@/components/charts/PlotConfigurator.vue';
import { getCustomPlotConfig, getPlotConfigName } from '@/shared/storage';
import { BotStoreGetters } from '@/store/modules/ftbot';

const ftbot = namespace('ftbot');

@Component({ components: { CandleChart, PlotConfigurator } })
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

  useUTC = true;

  plotConfig: PlotConfig = { ...EMPTY_PLOTCONFIG };

  plotConfigName = '';

  showPlotConfig = !this.plotConfigModal;

  @Getter getChartTheme!: string;

  @ftbot.State availablePlotConfigNames!: Array<string>;

  @ftbot.Action setPlotConfigName;

  @ftbot.State candleData!: PairHistory;

  @ftbot.State history!: PairHistory;

  @ftbot.Getter [BotStoreGetters.selectedPair]!: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action public getPairCandles!: (payload: PairCandlePayload) => void;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action public getPairHistory!: (payload: PairHistoryPayload) => void;

  get dataset(): PairHistory {
    if (this.historicView) {
      return this.history[`${this.pair}__${this.timeframe}`];
    }
    return this.candleData[`${this.pair}__${this.timeframe}`];
  }

  get datasetColumns() {
    return this.dataset ? this.dataset.columns : [];
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
