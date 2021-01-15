<template>
  <div class="container-fluid">
    <h2 class="mt-3">Backtesting</h2>
    <div class="container">
      <div class="row mx-5 d-flex flex-wrap justify-content-center mb-4">
        <b-form-radio
          v-model="btFormMode"
          name="bt-form-radios"
          button
          class="mx-1"
          value="run"
          :disabled="!canRunBacktest"
          >Run backtest</b-form-radio
        >
        <b-form-radio
          v-model="btFormMode"
          name="bt-form-radios"
          button
          class="mx-1"
          value="results"
          :disabled="!hasBacktestResult"
          >Analyze result</b-form-radio
        >
        <b-form-radio
          v-model="btFormMode"
          name="bt-form-radios"
          button
          class="mx-1"
          value="visualize-summary"
          :disabled="!hasBacktestResult"
          >Visualize summary</b-form-radio
        >
        <b-form-radio
          v-model="btFormMode"
          name="bt-form-radios"
          button
          class="mx-1"
          value="visualize"
          :disabled="!hasBacktestResult"
          >Visualize result</b-form-radio
        >
      </div>

      <div v-if="btFormMode == 'run'" class="row d-flex flex-column">
        <StrategyList v-model="strategy"></StrategyList>

        <b-card bg-variant="light" class="w-60" :disabled="backtestRunning">
          <!-- Backtesting parameters -->
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
              label-for="timeframe-select"
            >
              <b-form-select
                id="timeframe-select"
                v-model="selectedTimeframe"
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
                v-model="maxOpenTrades"
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
                v-model="stakeAmount"
                type="number"
                placeholder="Use strategy default"
                step="0.01"
              ></b-form-input>
            </b-form-group>

            <b-form-group
              label-cols-sm="5"
              label="Enable Protections:"
              label-align-sm="right"
              label-for="enable-protections"
            >
              <b-form-checkbox
                id="enable-protections"
                v-model="enableProtections"
                :options="availableTimeframes"
              ></b-form-checkbox>
            </b-form-group>

            <!-- <b-form-group label-cols-sm="5" label="Fee:" label-align-sm="right" label-for="fee">
              <b-form-input
                id="fee"
                type="number"
                placeholder="Use exchange default"
                step="0.01"
              ></b-form-input>
            </b-form-group> -->
          </b-form-group>
        </b-card>

        <TimeRangeSelect v-model="timerange" class="mt-2"></TimeRangeSelect>
        <h3 class="mt-3">Backtesting summary</h3>
        <div class="d-flex justify-content-center">
          <b-button
            variant="primary"
            :disabled="backtestRunning"
            class="mx-1"
            @click="clickBacktest"
          >
            Start backtest
          </b-button>
          <b-button
            variant="primary"
            :disabled="backtestRunning"
            class="mx-1"
            @click="pollBacktest"
          >
            Load backtest result
          </b-button>
          <b-button variant="primary" class="mx-1" @click="removeBacktest">Reset Backtest</b-button>
        </div>
      </div>
    </div>
    <div v-if="hasBacktestResult && btFormMode == 'results'" class="text-center w-100 mt-2">
      <div class="d-flex">
        <b-list-group>
          <b-list-group-item
            v-for="[key, strat] in Object.entries(backtestHistory)"
            :key="key"
            button
            class="d-flex justify-content-between align-items-center py-1"
          >
            {{ key }} {{ strat.total_trades }} {{ formatPercent(strat.profit_total) }}
          </b-list-group-item>
        </b-list-group>
      </div>
      <BacktestResultView :strategy="strategy" :backtest-result="selectedBacktestResult" />
    </div>
    <div
      v-if="hasBacktestResult && btFormMode == 'visualize-summary'"
      class="text-center w-100 mt-2 d-flex flex-column"
    >
      <TradesLogChart :trades="selectedBacktestResult.trades" class="trades-log" />
      <CumProfitChart
        :trades="selectedBacktestResult.trades"
        profit-column="profit_abs"
        class="cum-profit"
        :show-title="true"
      />
    </div>
    <div
      v-if="hasBacktestResult && btFormMode == 'visualize'"
      class="container-fluid row text-center w-100 mt-2"
    >
      <p>Graph will always show the latest values for the selected strategy.</p>
      <div class="container-fluid row text-center">
        <PairSummary
          class="col-md-2"
          :pairlist="selectedBacktestResult.pairlist"
          :trades="selectedBacktestResult.trades"
          sort-method="profit"
        />
        <CandleChartContainer
          :available-pairs="selectedBacktestResult.pairlist"
          :historic-view="!!true"
          :timeframe="timeframe"
          :plot-config="selectedPlotConfig"
          :timerange="timerange"
          :strategy="strategy"
          :trades="selectedBacktestResult.trades"
          class="col-md-10 candle-chart-container"
        >
        </CandleChartContainer>
      </div>
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
import CumProfitChart from '@/components/charts/CumProfitChart.vue';
import TradesLogChart from '@/components/charts/TradesLog.vue';
import PairSummary from '@/components/ftbot/PairSummary.vue';

import {
  BacktestPayload,
  BacktestResult,
  PairHistoryPayload,
  PlotConfig,
  StrategyBacktestResult,
} from '@/types';

import { getCustomPlotConfig, getPlotConfigName } from '@/shared/storage';
import { formatPercent } from '@/shared/formatters';
import { BotStoreGetters } from '@/store/modules/ftbot';

const ftbot = namespace('ftbot');
@Component({
  components: {
    BacktestResultView,
    TimeRangeSelect,
    CandleChartContainer,
    CumProfitChart,
    TradesLogChart,
    StrategyList,
    ValuePair,
    PairSummary,
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

  selectedTimeframe = '';

  strategy = '';

  timerange = '';

  enableProtections = false;

  maxOpenTrades = '';

  stakeAmount = '';

  btFormMode = 'run';

  selectedPlotConfig: PlotConfig = getCustomPlotConfig(getPlotConfigName());

  @ftbot.State backtestRunning!: boolean;

  @ftbot.State backtestResult!: BacktestResult;

  @ftbot.State backtestHistory!: StrategyBacktestResult[];

  @ftbot.Getter [BotStoreGetters.selectedBacktestResult]!: StrategyBacktestResult;

  @ftbot.State history;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action public getPairHistory!: (payload: PairHistoryPayload) => void;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action startBacktest!: (payload: BacktestPayload) => void;

  @ftbot.Action pollBacktest!: () => void;

  @ftbot.Action removeBacktest!: () => void;

  formatPercent = formatPercent;

  get canRunBacktest() {
    // TODO: Analyze if parameters and strategy has been selected.
    return true;
  }

  get hasBacktestResult() {
    return Object.keys(this.backtestResult).length !== 0;
  }

  // get selectedBacktestResult(): StrategyBacktestResult {
  //   return this.backtestResult.strategy[this.strategy] || {};
  // }

  get timeframe(): string {
    try {
      return this.backtestResult.strategy[this.strategy].timeframe;
    } catch (err) {
      return '';
    }
  }

  clickBacktest() {
    const btPayload: BacktestPayload = {
      strategy: this.strategy,
      timerange: this.timerange,
      // eslint-disable-next-line @typescript-eslint/camelcase
      enable_protections: this.enableProtections,
    };
    const openTradesInt = parseInt(this.maxOpenTrades, 10);
    if (openTradesInt) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      btPayload.max_open_trades = openTradesInt;
    }
    const stakeAmountInt = Number(this.stakeAmount);
    if (stakeAmountInt) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      btPayload.stake_amount = stakeAmountInt;
    }
    if (this.selectedTimeframe) {
      btPayload.timeframe = this.selectedTimeframe;
    }

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

.cum-profit {
  height: 350px;
  max-height: 350px;
}
.trades-log {
  height: 350px;
  max-height: 350px;
}
</style>
