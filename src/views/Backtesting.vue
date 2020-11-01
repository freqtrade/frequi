<template>
  <div class="container">
    <h2>Backtesting</h2>
    <div class="row mx-5 d-flex flex-wrap justify-space-between mb-4">
      <b-form-radio v-model="btFormMode" name="bt-form-radios" button value="params"
        >Define Parameters</b-form-radio
      >
      <b-form-radio v-model="btFormMode" name="bt-form-radios" button value="strategy"
        >Select Strategy</b-form-radio
      >
      <b-form-radio
        v-model="btFormMode"
        name="bt-form-radios"
        button
        value="run"
        :disabled="!canRunBacktest"
        >Run backtest</b-form-radio
      >
      <b-form-radio
        v-model="btFormMode"
        name="bt-form-radios"
        button
        value="results"
        :disabled="!hasBacktestResult"
        >Analyze result</b-form-radio
      >
      <b-form-radio
        v-model="btFormMode"
        name="bt-form-radios"
        button
        value="visualize"
        :disabled="!hasBacktestResult"
        >Visualize result</b-form-radio
      >
    </div>
    <div v-if="btFormMode == 'params'" class="row">
      <TimeRangeSelect v-model="timerange"></TimeRangeSelect>
    </div>
    <div v-if="btFormMode == 'params'" class="row">
      <b-card bg-variant="light" class="w-60">
        <b-form-group
          label-cols-lg="2"
          label="Backtest params"
          label-size="sm"
          label-class="font-weight-bold pt-0"
          class="mb-0"
        >
          <b-form-group
            label-cols-sm="5"
            label="Timeframe:"
            label-align-sm="right"
            label-for="timeframeSelect"
          >
            <b-form-select
              id="timeframe-select"
              placeholder="Use strategy default"
              :options="availableTimeframes"
            ></b-form-select>
          </b-form-group>

          <b-form-group
            label-cols-sm="5"
            label="Max open trades:"
            label-align-sm="right"
            label-for="max-open-trades"
          >
            <b-form-input
              id="max-open-trades"
              placeholder="Use strategy default"
              type="number"
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label-cols-sm="5"
            label="Stake amount:"
            label-align-sm="right"
            label-for="stake-amount"
          >
            <b-form-input
              id="stake-amount"
              type="number"
              placeholder="Use strategy default"
              step="0.01"
            ></b-form-input>
          </b-form-group>

          <b-form-group label-cols-sm="5" label="Fee:" label-align-sm="right" label-for="fee">
            <b-form-input
              id="fee"
              type="number"
              placeholder="Use exchange default"
              step="0.01"
            ></b-form-input>
          </b-form-group>
        </b-form-group>
      </b-card>
    </div>
    <div v-if="btFormMode == 'strategy'" class="row">
      <StrategyList v-model="strategy" show-details="true"></StrategyList>
    </div>

    <div v-if="btFormMode == 'run'" class="container">
      <div class="row">
        <ValuePair description="Timeframe (not working)">{{ timeframe }}</ValuePair>
        <ValuePair description="TimeRange">{{ timerange }}</ValuePair>
        <ValuePair description="Strategy">{{ strategy }}</ValuePair>
      </div>
      <div class="row">
        <h3>Backtesting summary</h3>
      </div>
      <div class="row">
        <b-button variant="primary" :disabled="backtestRunning" @click="clickBacktest">
          Start backtest
        </b-button>
        <b-button variant="primary" :disabled="backtestRunning" @click="pollBacktest">
          Load backtest result
        </b-button>
        <b-button variant="primary" @click="removeBacktest">Reset Backtest</b-button>
      </div>
    </div>
    <div v-if="hasBacktestResult && btFormMode == 'results'" class="text-center w-100 mt-2">
      <BacktestResultView :strategy="strategy" :backtest-result="selectedBacktestResult" />
    </div>
    <div v-if="hasBacktestResult && btFormMode == 'visualize'" class="text-center w-100 mt-2">
      <CandleChartContainer
        :available-pairs="selectedBacktestResult.pairlist"
        :historic-view="!!true"
        :timeframe="timeframe"
        :plot-config="selectedPlotConfig"
        :timerange="timerange"
        :strategy="strategy"
        :trades="selectedBacktestResult.trades"
        class="candle-chart-container"
      >
      </CandleChartContainer>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import TimeRangeSelect from '@/components/ftbot/TimeRangeSelect.vue';
import BacktestResultView from '@/components/ftbot/BacktestResultView.vue';
import CandleChartContainer from '@/components/charts/CandleChartContainer.vue';
import StrategyList from '@/components/ftbot/StrategyList.vue';
import ValuePair from '@/components/ftbot/ValuePair.vue';

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
  components: {
    BacktestResultView,
    TimeRangeSelect,
    CandleChartContainer,
    StrategyList,
    ValuePair,
  },
})
export default class Backtesting extends Vue {
  pollInterval: number | null = null;

  availableTimeframes = [
    '1m',
    '3m',
    '5m',
    '15m',
    '30m',
    '1h',
    '2h',
    '4h',
    '6h',
    '8h',
    '12h',
    '1d',
    '3d',
    '1w',
    '2w',
    '1M',
    '1y',
  ];

  strategy = '';

  btFormMode = 'params';

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

  @ftbot.Action removeBacktest!: () => void;

  get canRunBacktest() {
    // TODO: Analyze if parameters and strategy has been selected.
    return true;
  }

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

  clickBacktest() {
    console.log('Backtesting');
    const btPayload: BacktestPayload = {
      strategy: this.strategy,
      timerange: this.timerange,
    };
    this.startBacktest(btPayload);
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

<style scoped>
.candle-chart-container {
  height: 640px !important;
}
</style>
