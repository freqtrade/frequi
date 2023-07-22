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
          class="text-end bt-running-label col-8 col-lg-3"
          >Backtest running: {{ botStore.activeBot.backtestStep }}
          {{ formatPercent(botStore.activeBot.backtestProgress, 2) }}</small
        >
      </div>
    </div>

    <div class="d-md-flex">
      <!-- Left bar -->
      <div
        :class="`${showLeftBar ? 'col-md-3' : ''} sticky-top sticky-offset me-3 d-flex flex-column`"
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
            @selection-change="botStore.activeBot.setBacktestResultKey"
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
          <StrategySelect v-model="btStore.strategy"></StrategySelect>
        </div>
        <b-card :disabled="botStore.activeBot.backtestRunning">
          <!-- Backtesting parameters -->
          <b-form-group
            label-cols-lg="2"
            label="Backtest params"
            label-size="sm"
            label-class="fw-bold pt-0"
            class="mb-0"
          >
            <b-form-group
              label-cols-sm="5"
              label="Timeframe:"
              label-align-sm="right"
              label-for="timeframe-select"
            >
              <TimeframeSelect id="timeframe-select" v-model="btStore.selectedTimeframe" />
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
                v-model="btStore.selectedDetailTimeframe"
                :below-timeframe="btStore.selectedTimeframe"
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
            <b-form-group
              v-if="botStore.activeBot.botApiVersion >= 2.22"
              label-cols-sm="5"
              label="Cache Backtest results:"
              label-align-sm="right"
              label-for="enable-cache"
            >
              <b-form-checkbox id="enable-cache" v-model="allowCache"></b-form-checkbox>
            </b-form-group>
            <template v-if="botStore.activeBot.botApiVersion >= 2.22">
              <b-form-group
                label-cols-sm="5"
                label="Enable FreqAI:"
                label-align-sm="right"
                label-for="enable-freqai"
              >
                <template #label>
                  <div class="d-flex justify-content-center">
                    <span class="me-2">Enable FreqAI:</span>
                    <InfoBox
                      hint="Assumes freqAI configuration is setup in the configuration, and the strategy is a freqAI strategy. Will fail if that's not the case."
                    />
                  </div>
                </template>
                <b-form-checkbox
                  id="enable-freqai"
                  v-model="btStore.freqAI.enabled"
                ></b-form-checkbox>
              </b-form-group>
              <b-form-group
                v-if="btStore.freqAI.enabled"
                label-cols-sm="5"
                label="FreqAI identifier:"
                label-align-sm="right"
                label-for="freqai-identifier"
              >
                <b-form-input
                  id="freqai-identifier"
                  v-model="btStore.freqAI.identifier"
                  placeholder="Use config default"
                ></b-form-input>
              </b-form-group>
              <b-form-group
                v-if="btStore.freqAI.enabled"
                label-cols-sm="5"
                label="FreqAI Model"
                label-align-sm="right"
                label-for="freqai-model"
              >
                <FreqaiModelSelect
                  id="freqai-model"
                  v-model="btStore.freqAI.model"
                ></FreqaiModelSelect>
              </b-form-group>
            </template>

            <!-- <b-form-group label-cols-sm="5" label="Fee:" label-align-sm="right" label-for="fee">
              <b-form-input
                id="fee"
                type="number"
                placeholder="Use exchange default"
                step="0.01"
              ></b-form-input>
            </b-form-group> -->
            <hr />
            <TimeRangeSelect v-model="btStore.timerange" class="mt-2"></TimeRangeSelect>
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

      <BacktestGraphsView
        v-if="hasBacktestResult && btFormMode == 'visualize-summary'"
        :trades="botStore.activeBot.selectedBacktestResult.trades"
      />
    </div>

    <div
      v-if="hasBacktestResult && btFormMode == 'visualize'"
      class="container-fluid text-center w-100 mt-2"
    >
      <BacktestResultChart
        :timeframe="timeframe"
        :strategy="btStore.strategy"
        :timerange="btStore.timerange"
        :pairlist="botStore.activeBot.selectedBacktestResult.pairlist"
        :trades="botStore.activeBot.selectedBacktestResult.trades"
        :freqai-model="btStore.freqAI.enabled ? btStore.freqAI.model : undefined"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import TimeRangeSelect from '@/components/ftbot/TimeRangeSelect.vue';
import BacktestResultView from '@/components/ftbot/BacktestResultView.vue';
import BacktestResultSelect from '@/components/ftbot/BacktestResultSelect.vue';
import StrategySelect from '@/components/ftbot/StrategySelect.vue';
import FreqaiModelSelect from '@/components/ftbot/FreqaiModelSelect.vue';
import TimeframeSelect from '@/components/ftbot/TimeframeSelect.vue';
import BacktestHistoryLoad from '@/components/ftbot/BacktestHistoryLoad.vue';
import BacktestGraphsView from '@/components/ftbot/BacktestGraphsView.vue';
import BacktestResultChart from '@/components/ftbot/BacktestResultChart.vue';
import InfoBox from '@/components/general/InfoBox.vue';

import { BacktestPayload } from '@/types';

import { formatPercent } from '@/shared/formatters';
import { computed, ref, onMounted, watch } from 'vue';
import { useBotStore } from '@/stores/ftbotwrapper';
import { useBtStore } from '@/stores/btStore';

const botStore = useBotStore();
const btStore = useBtStore();

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

const showLeftBar = ref(false);
const enableProtections = ref(false);
const stakeAmountUnlimited = ref(false);
const allowCache = ref(true);
const maxOpenTrades = ref('');
const stakeAmount = ref('');
const startingCapital = ref('');
const btFormMode = ref('run');
const pollInterval = ref<number | null>(null);

const selectBacktestResult = () => {
  // Set parameters for this result
  btStore.strategy = botStore.activeBot.selectedBacktestResult.strategy_name;
  botStore.activeBot.getStrategy(btStore.strategy);
  btStore.selectedTimeframe = botStore.activeBot.selectedBacktestResult.timeframe;
  btStore.selectedDetailTimeframe =
    botStore.activeBot.selectedBacktestResult.timeframe_detail || '';
  // TODO: maybe this should not use timerange, but the actual backtest start/end results instead?
  btStore.timerange = botStore.activeBot.selectedBacktestResult.timerange;
};

watch(
  () => botStore.activeBot.selectedBacktestResultKey,
  () => {
    selectBacktestResult();
  },
);

const clickBacktest = () => {
  const btPayload: BacktestPayload = {
    strategy: btStore.strategy,
    timerange: btStore.timerange,
    enable_protections: enableProtections.value,
  };
  const openTradesInt = parseInt(maxOpenTrades.value, 10);
  if (openTradesInt) {
    btPayload.max_open_trades = openTradesInt;
  }
  if (stakeAmountUnlimited.value) {
    btPayload.stake_amount = 'unlimited';
  } else {
    const stakeAmountLoc = Number(stakeAmount.value);
    if (stakeAmountLoc) {
      btPayload.stake_amount = stakeAmountLoc.toString();
    }
  }

  const startingCapitalLoc = Number(startingCapital.value);
  if (startingCapitalLoc) {
    btPayload.dry_run_wallet = startingCapitalLoc;
  }

  if (btStore.selectedTimeframe) {
    btPayload.timeframe = btStore.selectedTimeframe;
  }
  if (btStore.selectedDetailTimeframe) {
    btPayload.timeframe_detail = btStore.selectedDetailTimeframe;
  }
  if (!allowCache.value) {
    btPayload.backtest_cache = 'none';
  }
  if (btStore.freqAI.enabled) {
    btPayload.freqaimodel = btStore.freqAI.model;
    if (btStore.freqAI.identifier !== '') {
      btPayload.freqai = { identifier: btStore.freqAI.identifier };
    }
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
</script>

<style lang="scss" scoped>
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
