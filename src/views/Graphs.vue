<template>
  <div class="container-fluid">
    <div class="row mb-2">
      <div class="col-mb-2">
        <b-checkbox v-model="historicView">HistoricData</b-checkbox>
      </div>
      <div class="col-mb-2 ml-2 mr-2">
        <b-button @click="refresh">&#x21bb;</b-button>
      </div>
      <div class="col-mb-2">
        <b-form-select :options="whitelist" v-model="pair" @change="refresh"> </b-form-select>
      </div>
      <div class="col-mb-2">
        <b-checkbox v-model="strategyPlotConfig">Use strategy plot_config</b-checkbox>
      </div>
      <div class="col-mb-2 ml-5" v-if="!strategyPlotConfig">
        <b-button @click="showConfigurator">Show configurator</b-button>
      </div>
    </div>
    <div class="row mt-2" v-if="historicView">
      <div class="col-mb-4">
        <label for="dp_dateFrom">Start date</label>
        <b-input-group class="mb-3">
          <b-input-group-prepend>
            <b-form-datepicker v-model="dateFrom" class="mb-2" button-only></b-form-datepicker>
          </b-input-group-prepend>
          <b-form-input
            id="dp_dateFrom"
            v-model="dateFrom"
            type="text"
            placeholder="YYYY-MM-DD"
            autocomplete="off"
          ></b-form-input>
        </b-input-group>
        <label for="dp_dateTo">End date</label>
        <b-input-group class="mb-3">
          <b-input-group-prepend>
            <b-form-datepicker v-model="dateTo" class="mb-2" button-only></b-form-datepicker>
          </b-input-group-prepend>
          <b-form-input
            id="dp_dateTo"
            v-model="dateTo"
            type="text"
            placeholder="YYYY-MM-DD"
            autocomplete="off"
          ></b-form-input>
        </b-input-group>
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
import { dateStringToTimeRange, timestampToDateString } from '../shared/formatters';

const ftbot = namespace('ftbot');
const now = new Date();

@Component({
  components: { CandleChart, PlotConfigurator },
})
export default class Graphs extends Vue {
  pair = 'XRP/USDT';

  timeframe = '5m';

  strategyPlotConfig = false;

  plotOption = 'main_plot';

  historicView = false;

  dateFrom = timestampToDateString(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  dateTo = '';

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
        timerange: `${dateStringToTimeRange(this.dateFrom)}-${dateStringToTimeRange(this.dateTo)}`,
      });
    } else {
      this.getPairCandles({ pair: this.pair, timeframe: this.timeframe, limit: 500 });
    }
    this.getPlotConfig();
  }
}
</script>

<style scoped></style>
