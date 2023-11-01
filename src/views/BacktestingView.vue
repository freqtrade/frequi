<template>
  <div class="d-flex flex-column pt-1 me-1" style="height: calc(100vh - 60px)">
    <div>
      <div class="d-flex flex-row">
        <h2 class="ms-5">Backtesting</h2>
        <p v-if="!botStore.activeBot.canRunBacktest">
          Bot must be in webserver mode to enable Backtesting.
        </p>
        <div class="w-100">
          <div
            class="mx-md-5 d-flex flex-wrap justify-content-md-center justify-content-between mb-4 gap-2"
          >
            <b-form-radio
              v-if="botStore.activeBot.botApiVersion >= 2.15"
              v-model="btFormMode"
              name="bt-form-radios"
              button
              class="mx-1 flex-samesize-items"
              value="historicResults"
              :disabled="!botStore.activeBot.canRunBacktest"
              ><i-mdi-cloud-download class="me-2" />Load Results</b-form-radio
            >
            <b-form-radio
              v-model="btFormMode"
              name="bt-form-radios"
              button
              class="mx-1 flex-samesize-items"
              value="run"
              :disabled="!botStore.activeBot.canRunBacktest"
              ><i-mdi-run-fast class="me-2" />Run backtest</b-form-radio
            >
            <b-form-radio
              id="bt-analyze-btn"
              v-model="btFormMode"
              name="bt-form-radios"
              button
              class="mx-1 flex-samesize-items"
              value="results"
              :disabled="!hasBacktestResult"
              ><i-mdi-table-eye class="me-2" />Analyze result</b-form-radio
            >
            <b-form-radio
              v-if="hasMultiBacktestResult"
              v-model="btFormMode"
              name="bt-form-radios"
              button
              class="mx-1 flex-samesize-items"
              value="compare-results"
              :disabled="!hasMultiBacktestResult"
              ><i-mdi-chart-bell-curve-cumulative class="me-2" />Compare results</b-form-radio
            >
            <b-form-radio
              v-model="btFormMode"
              name="bt-form-radios"
              button
              class="mx-1 flex-samesize-items"
              value="visualize-summary"
              :disabled="!hasBacktestResult"
              ><i-mdi-chart-bell-curve-cumulative class="me-2" />Visualize summary</b-form-radio
            >
            <b-form-radio
              v-model="btFormMode"
              name="bt-form-radios"
              button
              class="mx-1 flex-samesize-items"
              value="visualize"
              :disabled="!hasBacktestResult"
              ><i-mdi-chart-timeline-variant-shimmer class="me-2" />Visualize result</b-form-radio
            >
          </div>
          <small v-show="botStore.activeBot.backtestRunning" class="text-end bt-running-label"
            >Backtest running: {{ botStore.activeBot.backtestStep }}
            {{ formatPercent(botStore.activeBot.backtestProgress, 2) }}</small
          >
        </div>
      </div>
    </div>
    <div class="d-flex flex-md-row">
      <!-- Left bar -->
      <div
        v-if="btFormMode !== 'visualize'"
        :class="`${showLeftBar ? 'col-md-3' : ''}`"
        class="sticky-top sticky-offset me-3 d-flex flex-column absolute"
        style="max-height: calc(100vh - 60px)"
      >
        <b-button
          class="align-self-start"
          aria-label="Close"
          size="sm"
          variant="outline-secondary"
          @click="showLeftBar = !showLeftBar"
        >
          <i-mdi-chevron-right v-if="!showLeftBar" width="24" height="24" />
          <i-mdi-chevron-left v-if="showLeftBar" width="24" height="24" />
        </b-button>
        <transition name="fade">
          <BacktestResultSelect
            v-if="showLeftBar"
            :backtest-history="botStore.activeBot.backtestHistory"
            :selected-backtest-result-key="botStore.activeBot.selectedBacktestResultKey"
            :can-use-modify="botStore.activeBot.botApiVersion >= 2.32"
            @selection-change="botStore.activeBot.setBacktestResultKey"
            @remove-result="botStore.activeBot.removeBacktestResultFromMemory"
            @update-result="botStore.activeBot.saveBacktestResultMetadata"
          />
        </transition>
      </div>
      <!-- End Left bar -->
      <div class="d-flex flex-column flex-fill mw-100">
        <div class="d-md-flex">
          <div
            v-if="btFormMode === 'historicResults'"
            class="flex-fill d-flex flex-column bt-config"
          >
            <BacktestHistoryLoad />
          </div>
          <div v-if="btFormMode === 'run'" class="flex-fill d-flex flex-column bt-config">
            <BacktestRun />
          </div>
          <BacktestResultAnalysis
            v-if="hasBacktestResult && btFormMode === 'results'"
            :backtest-result="botStore.activeBot.selectedBacktestResult"
            class="flex-fill"
          />

          <BacktestResultComparison
            v-if="hasBacktestResult && btFormMode === 'compare-results'"
            :backtest-results="botStore.activeBot.backtestHistory"
            class="flex-fill"
          />

          <BacktestGraphs
            v-if="hasBacktestResult && btFormMode === 'visualize-summary'"
            :trades="botStore.activeBot.selectedBacktestResult.trades"
            class="flex-fill"
          />
        </div>

        <div v-if="hasBacktestResult && btFormMode === 'visualize'" class="text-center w-100 mt-2">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import BacktestGraphs from '@/components/ftbot/BacktestGraphs.vue';
import BacktestHistoryLoad from '@/components/ftbot/BacktestHistoryLoad.vue';
import BacktestResultChart from '@/components/ftbot/BacktestResultChart.vue';
import BacktestResultSelect from '@/components/ftbot/BacktestResultSelect.vue';
import BacktestResultAnalysis from '@/components/ftbot/BacktestResultAnalysis.vue';
import BacktestResultComparison from '@/components/ftbot/BacktestResultComparison.vue';
import BacktestRun from '@/components/ftbot/BacktestRun.vue';

import { formatPercent } from '@/shared/formatters';
import { useBtStore } from '@/stores/btStore';
import { useBotStore } from '@/stores/ftbotwrapper';
import { computed, onMounted, ref, watch } from 'vue';

enum BtRunModes {
  run = 'run',
  results = 'results',
  visualize = 'visualize',
  visualizesummary = 'visualize-summary',
  compareresults = 'compare-results',
  historicresults = 'historicResults',
}

const botStore = useBotStore();
const btStore = useBtStore();

const hasBacktestResult = computed(() =>
  botStore.activeBot.backtestHistory
    ? Object.keys(botStore.activeBot.backtestHistory).length !== 0
    : false,
);
const hasMultiBacktestResult = computed(() =>
  botStore.activeBot.backtestHistory
    ? Object.keys(botStore.activeBot.backtestHistory).length > 1
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

const btFormMode = ref<BtRunModes>(BtRunModes.run);
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
