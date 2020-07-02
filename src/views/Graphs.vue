<template>
  <div class="container-fluid">
    <div class="row mb-2">
      <div class="col-mb-2">
        <b-checkbox v-model="historicView">HistoricData</b-checkbox>
        <b-button @click="refresh">&#x21bb;</b-button>
      </div>
      <div class="col-mb-2">
        <b-form-select :options="whitelist" v-model="pair" @change="refresh"> </b-form-select>
      </div>
      <div class="col-mb-2">
        <b-checkbox v-model="strategyPlotConfig">Use strategy plot_config</b-checkbox>
      </div>
      <div class="col-mb-2 ml-5">
        <b-button @click="showConfigurator">Show configurator</b-button>
      </div>
    </div>

    <b-modal
      id="plotConfiguratorModal"
      title="Plot Configurator"
      ok-only
      hide-backdrop
      button-size="sm"
    >
      <PlotConfigurator :columns="datasetColumns" v-model="customPlotConfig" />
    </b-modal>
    <div class="row">
      <CandleChart
        :pair="pair"
        :timeframe="timeframe"
        :dataset="dataset"
        :plotConfig="selectedPlotConfig"
      >
      </CandleChart>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import CandleChart from '@/components/ftbot/CandleChart.vue';
import PlotConfigurator from '@/components/ftbot/PlotConfigurator.vue';
import {
  PlotConfig,
  EMPTY_PLOTCONFIG,
  PairCandlePayload,
  PairHistoryPayload,
} from '../store/types';
import { loadCustomPlotConfig } from '../shared/storage';

const ftbot = namespace('ftbot');

@Component({
  components: { CandleChart, PlotConfigurator },
})
export default class Graphs extends Vue {
  pair = 'XRP/USDT';

  timeframe = '5m';

  strategyPlotConfig = false;

  plotOption = 'main_plot';

  historicView = false;

  // Custom plot config - manually changed by user.
  // eslint-disable-next-line @typescript-eslint/camelcase
  customPlotConfig: PlotConfig = { ...EMPTY_PLOTCONFIG };

  @ftbot.State candleData;

  @ftbot.State history;

  @ftbot.State whitelist;

  @ftbot.State plotConfig;

  @ftbot.Action
  public getPairCandles!: (payload: PairCandlePayload) => void;

  @ftbot.Action
  public getPairHistory!: (payload: PairHistoryPayload) => void;

  @ftbot.Action
  public getWhitelist;

  @ftbot.Action
  public getPlotConfig;

  mounted() {
    this.getWhitelist();
    this.refresh();
    // eslint-disable-next-line @typescript-eslint/camelcase
    this.customPlotConfig = loadCustomPlotConfig();
  }

  get selectedPlotConfig() {
    return this.strategyPlotConfig ? this.plotConfig : this.customPlotConfig;
  }

  get dataset() {
    if (this.historicView) {
      return this.history[`${this.pair}__${this.timeframe}`];
    }
    return this.candleData[`${this.pair}__${this.timeframe}`];
  }

  get datasetColumns() {
    return this.dataset ? this.dataset.columns : [];
  }

  showConfigurator() {
    this.$bvModal.show('plotConfiguratorModal');
  }

  refresh() {
    if (this.historicView) {
      this.getPairHistory({
        pair: this.pair,
        timeframe: this.timeframe,
        limit: 500,
        timerange: '20200101-20200201',
      });
    } else {
      this.getPairCandles({ pair: this.pair, timeframe: this.timeframe, limit: 500 });
    }

    this.getPlotConfig();
  }
}
</script>

<style scoped></style>
