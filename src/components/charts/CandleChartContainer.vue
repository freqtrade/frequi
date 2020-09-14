<template>
  <div class="container-fluid flex-column align-items-stretch d-flex">
    <b-modal
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
        <b-select v-model="pair" :options="availablePairs" size="sm" @change="refresh"> </b-select>
      </div>
      <div class="col-mb-2 ml-2 mr-2">
        <b-button :disabled="!!!pair" size="sm" @click="refresh">&#x21bb;</b-button>
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

      <div class="col-mb-2 mr-2">
        <b-checkbox v-model="useUTC" title="Use UTC for graph">useUtc</b-checkbox>
      </div>
      <div class="col-mb-2 mr-1">
        <b-button size="sm" title="Plot configurator" @click="showConfigurator">&#9881;</b-button>
      </div>
    </div>
    <div class="row mr-1 ml-1">
      <CandleChart
        :dataset="dataset"
        :trades="trades"
        :plot-config="plotConfig"
        :use-u-t-c="useUTC"
      >
      </CandleChart>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
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

const ftbot = namespace('ftbot');

@Component({ components: { CandleChart, PlotConfigurator } })
export default class CandleChartContainer extends Vue {
  @Prop({ required: true }) readonly availablePairs!: string[];

  @Prop({ required: true }) readonly timeframe!: string;

  @Prop({ required: false, default: [] }) readonly trades!: Array<Trade>;

  @Prop({ required: false, default: false }) historicView!: boolean;

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

  @ftbot.State availablePlotConfigNames!: Array<string>;

  @ftbot.Action setPlotConfigName;

  @ftbot.State candleData!: PairHistory;

  @ftbot.State history!: PairHistory;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action public getPairCandles!: (payload: PairCandlePayload) => void;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action public getPairHistory!: (payload: PairHistoryPayload) => void;

  get dataset() {
    if (this.historicView) {
      return this.history[`${this.pair}__${this.timeframe}`];
    }
    return this.candleData[`${this.pair}__${this.timeframe}`];
  }

  get datasetColumns() {
    return this.dataset ? this.dataset.columns : [];
  }

  mounted() {
    this.plotConfigName = getPlotConfigName();
    this.plotConfig = getCustomPlotConfig(this.plotConfigName);
  }

  plotConfigChanged() {
    console.log('plotConfigChanged');
    this.plotConfig = getCustomPlotConfig(this.plotConfigName);
    this.setPlotConfigName(this.plotConfigName);
  }

  showConfigurator() {
    this.$bvModal.show('plotConfiguratorModal');
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
    [this.pair] = this.availablePairs;
    this.refresh();
  }
}
</script>

<style></style>
