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
        <backtest-run />
      </div>
      <BacktestResultView
        v-if="hasBacktestResult && btFormMode == 'results'"
        :backtest-result="botStore.activeBot.selectedBacktestResult"
        class="flex-fill"
      />

      <BacktestGraphs
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
import BacktestGraphs from '@/components/ftbot/BacktestGraphs.vue';
import BacktestHistoryLoad from '@/components/ftbot/BacktestHistoryLoad.vue';
import BacktestResultChart from '@/components/ftbot/BacktestResultChart.vue';
import BacktestResultSelect from '@/components/ftbot/BacktestResultSelect.vue';
import BacktestResultView from '@/components/ftbot/BacktestResultView.vue';
import BacktestRun from '@/components/ftbot/BacktestRun.vue';

import { formatPercent } from '@/shared/formatters';
import { useBtStore } from '@/stores/btStore';
import { useBotStore } from '@/stores/ftbotwrapper';
import { computed, onMounted, ref, watch } from 'vue';

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
