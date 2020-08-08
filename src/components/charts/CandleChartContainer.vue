<template>
  <div class="container-fluid flex-column align-items-stretch d-flex">
    <b-modal
      id="plotConfiguratorModal"
      title="Plot Configurator"
      ok-only
      hide-backdrop
      button-size="sm"
    >
      <PlotConfigurator :columns="datasetColumns" v-model="plotConfig" />
    </b-modal>
    <div class="row ml-auto">
      <div class="col-mb-2 mr-2">
        <b-checkbox v-model="useUTC" title="Use UTC for graph">useUtc</b-checkbox>
      </div>
      <div class="col-mb-2 mr-3">
        <b-button @click="showConfigurator" size="sm" title="Plot configurator">
          &#9881;
        </b-button>
      </div>
    </div>
    <CandleChart
      :timeframe="timeframe"
      :timeframems="timeframems"
      :dataset="dataset"
      :trades="trades"
      :plotConfig="plotConfig"
    >
    </CandleChart>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Trade, PairHistory, EMPTY_PLOTCONFIG, PlotConfig } from '@/store/types';
import CandleChart from '@/components/charts/CandleChart.vue';
import PlotConfigurator from '@/components/charts/PlotConfigurator.vue';
import { loadCustomPlotConfig, loadPlotConfigName } from '../../shared/storage';

@Component({ components: { CandleChart, PlotConfigurator } })
export default class CandleChartContainer extends Vue {
  @Prop({ required: true }) readonly timeframe!: string;

  @Prop({ required: true }) readonly timeframems!: number;

  @Prop({ required: false, default: [] }) readonly trades!: Array<Trade>;

  @Prop({ required: true }) readonly dataset!: PairHistory;

  useUTC = true;

  plotConfig: PlotConfig = { ...EMPTY_PLOTCONFIG };

  get datasetColumns() {
    return this.dataset ? this.dataset.columns : [];
  }

  mounted() {
    this.plotConfig = loadCustomPlotConfig(loadPlotConfigName());
  }

  showConfigurator() {
    this.$bvModal.show('plotConfiguratorModal');
  }
}
</script>

<style></style>
