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
    <div class="row ml-auto">
      <div class="col-mb-2 mr-2">
        <b-select
          v-model="plotConfigName"
          :options="availablePlotConfigNames"
          @change="plotConfigChanged"
        >
        </b-select>
      </div>
      <div class="col-mb-2 mr-2">
        <b-checkbox v-model="useUTC" title="Use UTC for graph">useUtc</b-checkbox>
      </div>
      <div class="col-mb-2 mr-3">
        <b-button size="sm" title="Plot configurator" @click="showConfigurator"> &#9881; </b-button>
      </div>
    </div>
    <CandleChart
      :timeframe="timeframe"
      :timeframems="timeframems"
      :dataset="dataset"
      :trades="trades"
      :plot-config="plotConfig"
    >
    </CandleChart>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Trade, PairHistory, EMPTY_PLOTCONFIG, PlotConfig } from '@/types';
import CandleChart from '@/components/charts/CandleChart.vue';
import PlotConfigurator from '@/components/charts/PlotConfigurator.vue';
import { getCustomPlotConfig, getPlotConfigName } from '@/shared/storage';

const ftbot = namespace('ftbot');

@Component({ components: { CandleChart, PlotConfigurator } })
export default class CandleChartContainer extends Vue {
  @Prop({ required: true }) readonly timeframe!: string;

  @Prop({ required: true }) readonly timeframems!: number;

  @Prop({ required: false, default: [] }) readonly trades!: Array<Trade>;

  @Prop({ required: true }) readonly dataset!: PairHistory;

  useUTC = true;

  plotConfig: PlotConfig = { ...EMPTY_PLOTCONFIG };

  plotConfigName = '';

  @ftbot.State availablePlotConfigNames!: Array<string>;

  get datasetColumns() {
    return this.dataset ? this.dataset.columns : [];
  }

  mounted() {
    this.plotConfigName = getPlotConfigName();
    this.plotConfig = getCustomPlotConfig(this.plotConfigName);
  }

  plotConfigChanged() {
    this.plotConfig = getCustomPlotConfig(this.plotConfigName);
  }

  showConfigurator() {
    this.$bvModal.show('plotConfiguratorModal');
  }
}
</script>

<style></style>
