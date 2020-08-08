<template>
  <div class="container-fluid">
    <h2>Backtesting</h2>
    <div class="row ml-1">
      <div class="row col-mb-6 mr-2">
        <TimeRangeSelect v-model="timerange"></TimeRangeSelect>
        <StrategyList v-model="strategy" class="col-md-2"></StrategyList>
      </div>
    </div>
    <div class="row">
      <b-button variant="primary" :disabled="backtestRunning" @click="clickBacktest">
        Start backtest
      </b-button>
      <b-button variant="primary" :disabled="backtestRunning" @click="pollBacktest">
        Load backtest result
      </b-button>
    </div>
    <div v-if="hasBacktestResult" class="text-center w-100 mt-5">
      <b-tabs content-class="mt-3" class="mt-3">
        <b-tab title="Textbased Result" active>
          <BacktestResultView :strategy="strategy" :backtest-result="selectedBacktestResult" />
        </b-tab>
        <b-tab title="Graph" lazy @click="clickGraphTab">
          <b-form-select
            v-model="pair"
            :options="selectedBacktestResult.pairlist"
            @change="clickGraphTab"
          >
          </b-form-select>
          <CandleChart
            :pair="pair"
            :timeframe="timeframe"
            :timeframems="timeframems"
            :dataset="dataset"
            :plot-config="selectedPlotConfig"
            :trades="selectedBacktestResult.trades"
          >
          </CandleChart>
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import TimeRangeSelect from '@/components/ftbot/TimeRangeSelect.vue';
import BacktestResultView from '@/components/ftbot/BacktestResultView.vue';
import CandleChart from '@/components/charts/CandleChartContainer.vue';
import StrategyList from '@/components/ftbot/StrategyList.vue';

import {
  BacktestPayload,
  BacktestResult,
  PairHistoryPayload,
  PlotConfig,
  StrategyBacktestResult,
} from '@/types';

import { getCustomPlotConfig, getPlotConfigName } from '@/shared/storage';

const ftbot = namespace('ftbot');
@Component({
  components: { BacktestResultView, TimeRangeSelect, CandleChart, StrategyList },
})
export default class Backtesting extends Vue {
  pair = 'XRP/USDT';

  pollInterval: number | null = null;

  timeframems = 300000;

  strategy = 'BinHV45';

  selectedPlotConfig: PlotConfig = getCustomPlotConfig(getPlotConfigName());

  @ftbot.State backtestRunning!: boolean;

  @ftbot.State backtestResult!: BacktestResult;

  @ftbot.State history;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action public getPairHistory!: (payload: PairHistoryPayload) => void;

  timerange = '';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action startBacktest!: (payload: BacktestPayload) => void;

  @ftbot.Action pollBacktest!: () => void;

  get hasBacktestResult() {
    return Object.keys(this.backtestResult).length !== 0;
  }

  get selectedBacktestResult(): StrategyBacktestResult {
    return this.backtestResult.strategy[this.strategy] || {};
  }

  get timeframe(): string {
    try {
      return this.backtestResult.strategy[this.strategy].timeframe;
    } catch (err) {
      return '';
    }
  }

  get dataset() {
    return this.history[`${this.pair}__${this.timeframe}`];
  }

  clickBacktest() {
    console.log('Backtesting');
    const btPayload: BacktestPayload = {
      strategy: this.strategy,
      timerange: this.timerange,
    };
    this.startBacktest(btPayload);
  }

  clickGraphTab() {
    this.getPairHistory({
      pair: this.pair,
      timeframe: this.timeframe,
      timerange: this.timerange,
      strategy: this.strategy,
    });
  }

  @Watch('backtestRunning')
  backtestRunningChanged() {
    if (this.backtestRunning === true) {
      this.pollInterval = window.setInterval(this.pollBacktest, 1000);
    } else if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
</script>

<style scoped></style>
