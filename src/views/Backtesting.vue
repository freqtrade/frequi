<template>
  <div class="container-fluid" style="max-height: calc(100vh - 60px)">
    <div class="container-fluid">
      <div class="row mb-2"></div>
      <p v-if="!botStore.activeBot.canRunBacktest">
        Bot must be in webserver mode to enable Backtesting.
      </p>
      <div class="row w-100">
        <h2 class="col-4 col-lg-3">Backtesting</h2>
        <div
          class="col-12 col-lg-order-last col-lg-6 mx-md-5 d-flex flex-wrap justify-content-md-center justify-content-between mb-4"
        >
          <b-form-radio
            v-if="botStore.activeBot.botApiVersion >= 2.15"
            v-model="btFormMode"
            name="bt-form-radios"
            button
            class="mx-1 flex-samesize-items"
            value="historicResults"
            :disabled="!botStore.activeBot.canRunBacktest"
            >Load Results</b-form-radio
          >
          <b-form-radio
            v-model="btFormMode"
            name="bt-form-radios"
            button
            class="mx-1 flex-samesize-items"
            value="run"
            :disabled="!botStore.activeBot.canRunBacktest"
            >Run backtest</b-form-radio
          >
          <b-form-radio
            id="bt-analyze-btn"
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
        <small
          v-show="botStore.activeBot.backtestRunning"
          class="text-right bt-running-label col-8 col-lg-3"
          >Backtest running: {{ botStore.activeBot.backtestStep }}
          {{ formatPercent(botStore.activeBot.backtestProgress, 2) }}</small
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
            :backtest-history="botStore.activeBot.backtestHistory"
            :selected-backtest-result-key="botStore.activeBot.selectedBacktestResultKey"
            @selectionChange="setBacktestResult"
          />
        </transition>
      </div>
      <!-- End Left bar -->
      <div
        v-if="btFormMode == 'historicResults'"
        class="flex-fill row d-flex flex-column bt-config"
      >
        <backtest-history-load />
      </div>
      <div v-if="btFormMode == 'run'" class="flex-fill row d-flex flex-column bt-config">
        <div class="mb-2">
          <span>Strategy</span>
          <StrategySelect v-model="strategy"></StrategySelect>
        </div>
        <b-card bg-variant="light" :disabled="botStore.activeBot.backtestRunning">
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
            id="start-backtest"
            variant="primary"
            :disabled="botStore.activeBot.backtestRunning || !botStore.activeBot.canRunBacktest"
            class="mx-1"
            @click="clickBacktest"
          >
            Start backtest
          </b-button>
          <b-button
            variant="primary"
            :disabled="botStore.activeBot.backtestRunning || !botStore.activeBot.canRunBacktest"
            class="mx-1"
            @click="botStore.activeBot.pollBacktest"
          >
            Load backtest result
          </b-button>
          <b-button
            variant="primary"
            class="mx-1"
            :disabled="!botStore.activeBot.backtestRunning"
            @click="botStore.activeBot.stopBacktest"
            >Stop Backtest</b-button
          >
          <b-button
            variant="primary"
            class="mx-1"
            :disabled="botStore.activeBot.backtestRunning || !botStore.activeBot.canRunBacktest"
            @click="botStore.activeBot.removeBacktest"
            >Reset Backtest</b-button
          >
        </div>
      </div>
      <BacktestResultView
        v-if="hasBacktestResult && btFormMode == 'results'"
        :backtest-result="botStore.activeBot.selectedBacktestResult"
        class="flex-fill"
      />

      <div
        v-if="hasBacktestResult && btFormMode == 'visualize-summary'"
        class="text-center flex-fill mt-2 d-flex flex-column"
      >
        <TradesLogChart
          :trades="botStore.activeBot.selectedBacktestResult.trades"
          class="trades-log"
        />
        <CumProfitChart
          :trades="botStore.activeBot.selectedBacktestResult.trades"
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
        Graph will always show the latest values for the selected strategy. Timerange:
        {{ timerange }} - {{ strategy }}
      </p>
      <div class="row text-center">
        <PairSummary
          class="col-md-2 overflow-auto"
          style="max-height: calc(100vh - 200px)"
          :pairlist="botStore.activeBot.selectedBacktestResult.pairlist"
          :trades="botStore.activeBot.selectedBacktestResult.trades"
          sort-method="profit"
          :backtest-mode="true"
        />
        <CandleChartContainer
          :available-pairs="botStore.activeBot.selectedBacktestResult.pairlist"
          :historic-view="!!true"
          :timeframe="timeframe"
          :timerange="timerange"
          :strategy="strategy"
          :trades="botStore.activeBot.selectedBacktestResult.trades"
          class="col-md-10 candle-chart-container px-0 w-100 h-100"
        >
        </CandleChartContainer>
      </div>
      <b-card header="Single trades" class="row mt-2 w-100">
        <TradeList
          class="row trade-history mt-2 w-100"
          :trades="botStore.activeBot.selectedBacktestResult.trades"
          :show-filter="true"
          :stake-currency="botStore.activeBot.selectedBacktestResult.stake_currency"
        />
      </b-card>
    </div>
  </div>
</template>

<script lang="ts">
import TimeRangeSelect from '@/components/ftbot/TimeRangeSelect.vue';
import BacktestResultView from '@/components/ftbot/BacktestResultView.vue';
import BacktestResultSelect from '@/components/ftbot/BacktestResultSelect.vue';
import CandleChartContainer from '@/components/charts/CandleChartContainer.vue';
import StrategySelect from '@/components/ftbot/StrategySelect.vue';
import CumProfitChart from '@/components/charts/CumProfitChart.vue';
import TradesLogChart from '@/components/charts/TradesLog.vue';
import PairSummary from '@/components/ftbot/PairSummary.vue';
import TimeframeSelect from '@/components/ftbot/TimeframeSelect.vue';
import TradeList from '@/components/ftbot/TradeList.vue';
import BacktestHistoryLoad from '@/components/ftbot/BacktestHistoryLoad.vue';

import { BacktestPayload } from '@/types';

import { formatPercent } from '@/shared/formatters';
import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';

export default defineComponent({
  name: 'Backtesting',
  components: {
    BacktestResultView,
    BacktestResultSelect,
    BacktestHistoryLoad,
    TimeRangeSelect,
    CandleChartContainer,
    CumProfitChart,
    TradesLogChart,
    StrategySelect,
    PairSummary,
    TimeframeSelect,
    TradeList,
  },
  setup() {
    const botStore = useBotStore();

    const hasBacktestResult = computed(() =>
      botStore.activeBot.backtestHistory
        ? Object.keys(botStore.activeBot.backtestHistory).length !== 0
        : false,
    );
    const timeframe = computed((): string => {
      try {
        return botStore.activeBot.selectedBacktestResult.timeframe;
      } catch (err) {
        return '';
      }
    });

    const strategy = ref('');
    const selectedTimeframe = ref('');
    const selectedDetailTimeframe = ref('');
    const timerange = ref('');
    const showLeftBar = ref(false);
    const enableProtections = ref(false);
    const stakeAmountUnlimited = ref(false);
    const maxOpenTrades = ref('');
    const stakeAmount = ref('');
    const startingCapital = ref('');
    const btFormMode = ref('run');
    const pollInterval = ref<number | null>(null);

    const setBacktestResult = (key: string) => {
      botStore.activeBot.setBacktestResultKey(key);

      // Set parameters for this result
      strategy.value = botStore.activeBot.selectedBacktestResult.strategy_name;
      selectedTimeframe.value = botStore.activeBot.selectedBacktestResult.timeframe;
      selectedDetailTimeframe.value =
        botStore.activeBot.selectedBacktestResult.timeframe_detail || '';
      timerange.value = botStore.activeBot.selectedBacktestResult.timerange;
    };

    const clickBacktest = () => {
      const btPayload: BacktestPayload = {
        strategy: strategy.value,
        timerange: timerange.value,
        // eslint-disable-next-line @typescript-eslint/camelcase
        enable_protections: enableProtections.value,
      };
      const openTradesInt = parseInt(maxOpenTrades.value, 10);
      if (openTradesInt) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        btPayload.max_open_trades = openTradesInt;
      }
      if (stakeAmountUnlimited.value) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        btPayload.stake_amount = 'unlimited';
      } else {
        const stakeAmountLoc = Number(stakeAmount.value);
        if (stakeAmountLoc) {
          // eslint-disable-next-line @typescript-eslint/camelcase
          btPayload.stake_amount = stakeAmountLoc.toString();
        }
      }

      const startingCapitalLoc = Number(startingCapital.value);
      if (startingCapitalLoc) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        btPayload.dry_run_wallet = startingCapitalLoc;
      }

      if (selectedTimeframe.value) {
        btPayload.timeframe = selectedTimeframe.value;
      }
      if (selectedDetailTimeframe.value) {
        // eslint-disable-next-line @typescript-eslint/camelcase
        btPayload.timeframe_detail = selectedDetailTimeframe.value;
      }

      botStore.activeBot.startBacktest(btPayload);
    };
    onMounted(() => botStore.activeBot.getState());
    watch(
      () => botStore.activeBot.backtestRunning,
      () => {
        if (botStore.activeBot.backtestRunning === true) {
          pollInterval.value = window.setInterval(botStore.activeBot.pollBacktest, 1000);
        } else if (pollInterval.value) {
          clearInterval(pollInterval.value);
          pollInterval.value = null;
        }
      },
    );
    return {
      botStore,

      formatPercent,
      hasBacktestResult,
      timeframe,
      setBacktestResult,
      strategy,
      selectedTimeframe,
      selectedDetailTimeframe,
      timerange,
      enableProtections,
      showLeftBar,
      stakeAmountUnlimited,
      maxOpenTrades,
      stakeAmount,
      startingCapital,
      btFormMode,
      clickBacktest,
    };
  },
});
</script>

<style lang="scss" scoped>
.candle-chart-container {
  // TODO: Rough estimate - still to fix correctly
  // Applies to all "calc" usages in this file.
  height: calc(100vh - 250px) !important;
}

.cum-profit {
  height: 350px !important;
  max-height: 350px;
}
.trades-log {
  height: 350px !important;
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
