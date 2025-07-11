<script setup lang="ts">
import { useBtStore } from '@/stores/btStore';
import { useBotStore } from '@/stores/ftbotwrapper';

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

<template>
  <div class="flex flex-row pt-1 me-1 relative" style="height: calc(100vh - 60px)">
    <div
      class="flex md:flex-row h-full w-16"
      :class="{
        'w-96!': showLeftBar,
      }"
    >
      <!-- Left bar -->
      <div
        v-if="btFormMode !== 'visualize'"
        class="me-3 flex flex-col fixed"
        style="max-height: calc(100vh - 60px)"
      >
        <Button
          class="self-start"
          aria-label="Close"
          size="small"
          severity="secondary"
          variant="outlined"
          @click="showLeftBar = !showLeftBar"
        >
          <i-mdi-chevron-right v-if="!showLeftBar" width="24" height="24" />
          <i-mdi-chevron-left v-if="showLeftBar" width="24" height="24" />
        </Button>
        <Transition name="fade">
          <BacktestResultSelect
            v-if="showLeftBar"
            :backtest-history="botStore.activeBot.backtestHistory"
            :selected-backtest-result-key="botStore.activeBot.selectedBacktestResultKey"
            :can-use-modify="botStore.activeBot.botFeatures.backtestSetNotes"
            @selection-change="botStore.activeBot.setBacktestResultKey"
            @remove-result="botStore.activeBot.removeBacktestResultFromMemory"
            @update-result="botStore.activeBot.saveBacktestResultMetadata"
          />
        </Transition>
      </div>
      <!-- End Left bar -->
    </div>
    <div class="flex flex-col w-full">
      <h2 class="ms-5 text-3xl font-bold">Backtesting</h2>
      <p v-if="!botStore.activeBot.canRunBacktest">
        Bot must be in webserver mode to enable Backtesting.
      </p>
      <div class="w-full">
        <Tabs value="run" lazy>
          <TabList>
            <Tab
              v-if="botStore.activeBot.botFeatures.backtestHistory"
              v-model="btFormMode"
              class="flex items-center"
              value="historicResults"
              :disabled="!botStore.activeBot.canRunBacktest"
              ><i-mdi-cloud-download class="me-2" />Load Results</Tab
            >
            <Tab
              v-model="btFormMode"
              class="flex items-center"
              value="run"
              :disabled="!botStore.activeBot.canRunBacktest"
              ><i-mdi-run-fast class="me-2" />Run backtest</Tab
            >
            <Tab
              id="bt-analyze-btn"
              v-model="btFormMode"
              class="flex items-center"
              value="results"
              :disabled="!hasBacktestResult"
              ><i-mdi-table-eye class="me-2" />Analyze result</Tab
            >
            <Tab
              v-if="hasMultiBacktestResult"
              v-model="btFormMode"
              class="flex items-center"
              value="compare-results"
              :disabled="!hasMultiBacktestResult"
              ><i-mdi-compare-horizontal class="me-2" />Compare results</Tab
            >
            <Tab
              v-model="btFormMode"
              class="flex items-center"
              value="visualize-summary"
              :disabled="!hasBacktestResult"
              ><i-mdi-chart-bell-curve-cumulative class="me-2" />Visualize summary</Tab
            >
            <Tab
              v-model="btFormMode"
              class="flex items-center"
              value="visualize"
              :disabled="!hasBacktestResult"
              ><i-mdi-chart-timeline-variant-shimmer class="me-2" />Visualize result</Tab
            >
          </TabList>
          <TabPanels>
            <TabPanel value="historicResults">
              <BacktestHistoryLoad />
            </TabPanel>
            <TabPanel value="run">
              <BacktestRun />
            </TabPanel>
            <TabPanel value="results">
              <BacktestResultAnalysis
                v-if="hasBacktestResult"
                :backtest-result="botStore.activeBot.selectedBacktestResult"
                class="flex-fill"
              />
            </TabPanel>
            <TabPanel value="compare-results">
              <BacktestResultComparison
                v-if="hasMultiBacktestResult"
                :backtest-results="botStore.activeBot.backtestHistory"
                class="flex-fill"
              />
            </TabPanel>
            <TabPanel value="visualize-summary">
              <BacktestGraphs
                v-if="hasBacktestResult"
                :trades="botStore.activeBot.selectedBacktestResult.trades"
                class="flex-fill"
              />
            </TabPanel>
            <TabPanel value="visualize" l>
              <BacktestResultChart
                :timeframe="timeframe"
                :strategy="btStore.strategy"
                :timerange="btStore.timerange"
                :backtest-result="botStore.activeBot.selectedBacktestResult"
                :freqai-model="btStore.freqAI.enabled ? btStore.freqAI.model : undefined"
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <small v-show="botStore.activeBot.backtestRunning" class="text-end bt-running-label"
          >Backtest running: {{ botStore.activeBot.backtestStep }}
          {{ formatPercent(botStore.activeBot.backtestProgress, 2) }}</small
        >
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.bt-running-label {
  position: absolute;
  right: 2em;
  margin-top: 1em;
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
