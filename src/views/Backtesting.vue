<template>
  <div class="container-fluid" style="max-height: calc(100vh - 60px)">
    <div class="container-fluid">
      <div class="row mb-2"></div>
      <p v-if="!canRunBacktest">Bot must be in webserver mode to enable Backtesting.</p>
      <div class="row w-100">
        <h2 class="col-4 col-lg-3">Backtesting</h2>
        <div
          class="col-12 col-lg-order-last col-lg-6 mx-md-5 d-flex flex-wrap justify-content-md-center justify-content-between mb-4"
          :disabled="canRunBacktest"
        >
          <b-form-radio
            v-model="btFormMode"
            name="bt-form-radios"
            button
            class="mx-1 flex-samesize-items"
            value="run"
            :disabled="!canRunBacktest"
            >Run backtest</b-form-radio
          >
          <b-form-radio
            v-model="btFormMode"
            name="bt-form-radios"
            button
            class="mx-1 flex-samesize-items"
            value="results"
            :disabled="!hasBacktestResult"
            >Analyze result</b-form-radio
          >
          <b-form-radio
            v-model="btFormMode"
            name="bt-form-radios"
            button
            class="mx-1 flex-samesize-items"
            value="visualize-summary"
            :disabled="!hasBacktestResult"
            >Visualize summary</b-form-radio
          >
          <b-form-radio
            v-model="btFormMode"
            name="bt-form-radios"
            button
            class="mx-1 flex-samesize-items"
            value="visualize"
            :disabled="!hasBacktestResult"
            >Visualize result</b-form-radio
          >
        </div>
        <small v-show="backtestRunning" class="text-right bt-running-label col-8 col-lg-3"
          >Backtest running: {{ backtestStep }} {{ formatPercent(backtestProgress, 2) }}</small
        >
      </div>
    </div>

    <div class="d-md-flex">
      <!-- Left bar -->
      <div
        :class="`${showLeftBar ? 'col-md-3' : ''} sticky-top sticky-offset mr-3 d-flex flex-column`"
      >
        <b-button
          v-if="btFormMode !== 'visualize'"
          class="align-self-start"
          aria-label="Close"
          size="sm"
          @click="showLeftBar = !showLeftBar"
          >{{ showLeftBar ? '&lt;' : '&gt;' }}</b-button
        >
        <transition name="fade" mode="in-out">
          <BacktestResultSelect
            v-if="btFormMode !== 'visualize' && showLeftBar"
            :backtest-history="backtestHistory"
            :selected-backtest-result-key="selectedBacktestResultKey"
            @selectionChange="setBacktestResult"
          />
        </transition>
      </div>
      <!-- End Left bar -->

      <div v-if="btFormMode == 'run'" class="flex-fill row d-flex flex-column bt-config">
        <div class="mb-2">
          <span>Strategy</span>
          <StrategySelect v-model="strategy"></StrategySelect>
        </div>
        <b-card bg-variant="light" :disabled="backtestRunning">
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
              <TimeframeSelect id="timeframe-select" v-model="selectedTimeframe" />
            </b-form-group>
            <b-form-group
              label-cols-sm="5"
              label="Detail Timeframe:"
              label-align-sm="right"
              label-for="timeframe-detail-select"
              title="Detail timeframe, to simulate intra-candle results. Not setting this will not use this functionality."
            >
              <TimeframeSelect
                id="timeframe-detail-select"
                v-model="selectedDetailTimeframe"
                :below-timeframe="selectedTimeframe"
              />
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
              label="Starting capital:"
              label-align-sm="right"
              label-for="starting-capital"
            >
              <b-form-input
                id="starting-capital"
                v-model="startingCapital"
                type="number"
                step="0.001"
              ></b-form-input>
            </b-form-group>
            <b-form-group
              label-cols-sm="5"
              label="Stake amount:"
              label-align-sm="right"
              label-for="stake-amount"
            >
              <div class="d-flex">
                <b-form-checkbox
                  id="stake-amount-bool"
                  v-model="stakeAmountUnlimited"
                  class="col-md-6"
                  >Unlimited stake</b-form-checkbox
                >

                <b-form-input
                  id="stake-amount"
                  v-model="stakeAmount"
                  type="number"
                  placeholder="Use strategy default"
                  step="0.01"
                  :disabled="stakeAmountUnlimited"
                ></b-form-input>
              </div>
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
            <hr />
            <TimeRangeSelect v-model="timerange" class="mt-2"></TimeRangeSelect>
          </b-form-group>
        </b-card>

        <h3 class="mt-3">Backtesting summary</h3>
        <div
          class="d-flex flex-wrap flex-md-nowrap justify-content-between justify-content-md-center"
        >
          <b-button
            variant="primary"
            :disabled="backtestRunning || !canRunBacktest"
            class="mx-1"
            @click="clickBacktest"
          >
            Start backtest
          </b-button>
          <b-button
            variant="primary"
            :disabled="backtestRunning || !canRunBacktest"
            class="mx-1"
            @click="pollBacktest"
          >
            Load backtest result
          </b-button>
          <b-button
            variant="primary"
            class="mx-1"
            :disabled="!backtestRunning"
            @click="stopBacktest"
            >Stop Backtest</b-button
          >
          <b-button
            variant="primary"
            class="mx-1"
            :disabled="backtestRunning || !canRunBacktest"
            @click="removeBacktest"
            >Reset Backtest</b-button
          >
        </div>
      </div>
      <BacktestResultView
        v-if="hasBacktestResult && btFormMode == 'results'"
        :backtest-result="selectedBacktestResult"
        class="flex-fill"
      />

      <div
        v-if="hasBacktestResult && btFormMode == 'visualize-summary'"
        class="text-center flex-fill mt-2 d-flex flex-column"
      >
        <TradesLogChart :trades="selectedBacktestResult.trades" class="trades-log" />
        <CumProfitChart
          :trades="selectedBacktestResult.trades"
          profit-column="profit_abs"
          class="cum-profit"
          :show-title="true"
        />
      </div>
    </div>

    <div
      v-if="hasBacktestResult && btFormMode == 'visualize'"
      class="container-fluid text-center w-100 mt-2"
    >
      <p class="row">
        Graph will always show the latest values for the selected strategy. Strategy: {{ strategy }}
      </p>
      <div class="row text-center">
        <PairSummary
          class="col-md-2 overflow-auto"
          style="max-height: calc(100vh - 200px)"
          :pairlist="selectedBacktestResult.pairlist"
          :trades="selectedBacktestResult.trades"
          sort-method="profit"
          :backtest-mode="true"
        />
        <CandleChartContainer
          :available-pairs="selectedBacktestResult.pairlist"
          :historic-view="!!true"
          :timeframe="timeframe"
          :plot-config="selectedPlotConfig"
          :timerange="timerange"
          :strategy="strategy"
          :trades="selectedBacktestResult.trades"
          class="col-md-10 candle-chart-container px-0 w-100 h-100"
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
import BacktestResultSelect from '@/components/ftbot/BacktestResultSelect.vue';
import CandleChartContainer from '@/components/charts/CandleChartContainer.vue';
import StrategySelect from '@/components/ftbot/StrategySelect.vue';
import ValuePair from '@/components/general/ValuePair.vue';
import CumProfitChart from '@/components/charts/CumProfitChart.vue';
import TradesLogChart from '@/components/charts/TradesLog.vue';
import PairSummary from '@/components/ftbot/PairSummary.vue';
import TimeframeSelect from '@/components/ftbot/TimeframeSelect.vue';

import {
  BacktestPayload,
  BacktestSteps,
  BotState,
  PairHistory,
  PairHistoryPayload,
  PlotConfig,
  StrategyBacktestResult,
} from '@/types';

import { getCustomPlotConfig, getPlotConfigName } from '@/shared/storage';
import { formatPercent } from '@/shared/formatters';
import { BotStoreGetters } from '@/store/modules/ftbot';
import StoreModules from '@/store/storeSubModules';

const ftbot = namespace(StoreModules.ftbot);
@Component({
  components: {
    BacktestResultView,
    BacktestResultSelect,
    TimeRangeSelect,
    CandleChartContainer,
    CumProfitChart,
    TradesLogChart,
    StrategySelect,
    ValuePair,
    PairSummary,
    TimeframeSelect,
  },
})
export default class Backtesting extends Vue {
  pollInterval: number | null = null;

  showLeftBar = false;

  selectedTimeframe = '';

  selectedDetailTimeframe = '';

  strategy = '';

  timerange = '';

  enableProtections = false;

  maxOpenTrades = '';

  stakeAmountUnlimited = false;

  stakeAmount = '';

  startingCapital = '';

  btFormMode = 'run';

  selectedPlotConfig: PlotConfig = getCustomPlotConfig(getPlotConfigName());

  @ftbot.Getter [BotStoreGetters.backtestRunning]!: boolean;

  @ftbot.Getter [BotStoreGetters.backtestStep]!: BacktestSteps;

  @ftbot.Getter [BotStoreGetters.botState]?: BotState;

  @ftbot.Getter [BotStoreGetters.backtestProgress]!: number;

  @ftbot.Getter [BotStoreGetters.backtestHistory]!: StrategyBacktestResult[];

  @ftbot.Getter [BotStoreGetters.selectedBacktestResultKey]!: string;

  @ftbot.Getter [BotStoreGetters.history]!: PairHistory;

  @ftbot.Getter [BotStoreGetters.selectedBacktestResult]!: StrategyBacktestResult;

  @ftbot.Getter [BotStoreGetters.canRunBacktest]!: boolean;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action getPairHistory!: (payload: PairHistoryPayload) => void;

  @ftbot.Action getState;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action startBacktest!: (payload: BacktestPayload) => void;

  @ftbot.Action pollBacktest!: () => void;

  @ftbot.Action removeBacktest!: () => void;

  @ftbot.Action stopBacktest!: () => void;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ftbot.Action setBacktestResultKey!: (key: string) => void;

  formatPercent = formatPercent;

  get hasBacktestResult() {
    return this.backtestHistory ? Object.keys(this.backtestHistory).length !== 0 : false;
  }

  get timeframe(): string {
    try {
      return this.selectedBacktestResult.timeframe;
    } catch (err) {
      return '';
    }
  }

  mounted() {
    this.getState();
  }

  setBacktestResult(key: string) {
    this.setBacktestResultKey(key);

    // Set parameters for this result
    this.strategy = this.selectedBacktestResult.strategy_name;
    this.selectedTimeframe = this.selectedBacktestResult.timeframe;
    this.selectedDetailTimeframe = this.selectedBacktestResult.timeframe_detail || '';
    this.timerange = this.selectedBacktestResult.timerange;
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
    if (this.stakeAmountUnlimited) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      btPayload.stake_amount = 'unlimited';
    } else {
      const stakeAmount = Number(this.stakeAmount);
      if (stakeAmount) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        btPayload.stake_amount = stakeAmount;
      }
    }

    const startingCapital = Number(this.startingCapital);
    if (startingCapital) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      btPayload.dry_run_wallet = startingCapital;
    }

    if (this.selectedTimeframe) {
      btPayload.timeframe = this.selectedTimeframe;
    }
    if (this.selectedDetailTimeframe) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      btPayload.timeframe_detail = this.selectedDetailTimeframe;
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

<style lang="scss" scoped>
.candle-chart-container {
  // TODO: Rough estimate - still to fix correctly
  // Applies to all "calc" usages in this file.
  height: calc(100vh - 250px) !important;
}

.cum-profit {
  height: 350px;
  max-height: 350px;
}
.trades-log {
  height: 350px;
  max-height: 350px;
}
.bt-running-label {
  position: absolute;
  right: 2em;
  margin-top: 1em;
}

.sticky-offset {
  top: 2em;
}
.flex-samesize-items {
  flex: 1 1 0;
  @media md {
    flex: unset;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.bt-config {
  @media (min-width: 992px) {
    margin-left: auto;
    margin-right: auto;
    max-width: 75vw;
  }
}
</style>
