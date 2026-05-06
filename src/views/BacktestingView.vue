<script setup lang="ts">
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
const { t } = useUiText();

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
  return botStore.activeBot.selectedBacktestResult?.timeframe ?? '';
});

const showLeftBar = ref(false);

const btFormMode = ref<BtRunModes>(BtRunModes.run);
const pollInterval = ref<number | null>(null);

function selectBacktestResult() {
  if (!botStore.activeBot.selectedBacktestResult) {
    return;
  }
  // Set parameters for this result
  btStore.strategy = botStore.activeBot.selectedBacktestResult.strategy_name;
  botStore.activeBot.getStrategy(btStore.strategy);
  btStore.selectedTimeframe = botStore.activeBot.selectedBacktestResult.timeframe;
  btStore.selectedDetailTimeframe =
    botStore.activeBot.selectedBacktestResult.timeframe_detail || '';
  // TODO: maybe this should not use timerange, but the actual backtest start/end results instead?
  btStore.timerange = botStore.activeBot.selectedBacktestResult.timerange;
  btStore.enableProtections = botStore.activeBot.selectedBacktestResult.enable_protections;
  btStore.freqAI.enabled = !!botStore.activeBot.selectedBacktestResult.freqaimodel;
  btStore.freqAI.model = botStore.activeBot.selectedBacktestResult.freqaimodel || '';
  btStore.freqAI.identifier = botStore.activeBot.selectedBacktestResult.freqai_identifier || '';
}

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
      v-if="btFormMode !== 'visualize'"
      class="flex md:flex-row h-full w-16 transition-all duration-200 shrink-0 me-1 border-r border-surface-200 dark:border-surface-900"
      :class="{
        'w-78!': showLeftBar,
      }"
    >
      <!-- Left bar -->
      <div class="flex flex-col fixed">
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
      <h2 class="ms-5 text-3xl font-bold">{{ t('backtesting') }}</h2>
      <p v-if="!botStore.activeBot.canRunBacktest">
        {{ t('webserverRequiredForBacktest') }}
      </p>
      <div class="w-full">
        <Tabs v-model:value="btFormMode" lazy>
          <TabList>
            <Tab
              v-if="botStore.activeBot.botFeatures.backtestHistory"
              class="flex items-center"
              value="historicResults"
              :disabled="!botStore.activeBot.canRunBacktest"
              ><i-mdi-cloud-download class="me-2" />{{ t('loadResults') }}</Tab
            >
            <Tab
              class="flex items-center"
              value="run"
              :disabled="!botStore.activeBot.canRunBacktest"
              ><i-mdi-run-fast class="me-2" />{{ t('runBacktest') }}</Tab
            >
            <Tab
              id="bt-analyze-btn"
              class="flex items-center"
              value="results"
              :disabled="!hasBacktestResult"
              ><i-mdi-table-eye class="me-2" />{{ t('analyzeResult') }}</Tab
            >
            <Tab
              v-if="hasMultiBacktestResult"
              class="flex items-center"
              value="compare-results"
              :disabled="!hasMultiBacktestResult"
              ><i-mdi-compare-horizontal class="me-2" />{{ t('compareResults') }}</Tab
            >
            <Tab class="flex items-center" value="visualize-summary" :disabled="!hasBacktestResult"
              ><i-mdi-chart-bell-curve-cumulative class="me-2" />{{ t('visualizeSummary') }}</Tab
            >
            <Tab class="flex items-center" value="visualize" :disabled="!hasBacktestResult"
              ><i-mdi-chart-timeline-variant-shimmer class="me-2" />{{ t('visualizeResult') }}</Tab
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
                v-if="hasBacktestResult && botStore.activeBot.selectedBacktestResult"
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
                v-if="hasBacktestResult && botStore.activeBot.selectedBacktestResult"
                :trades="botStore.activeBot.selectedBacktestResult.trades"
                class="flex-fill"
              />
            </TabPanel>
            <TabPanel value="visualize" l>
              <BacktestResultChart
                v-if="botStore.activeBot.selectedBacktestResult"
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
          >{{ t('backtestRunning') }} {{ botStore.activeBot.backtestStep }}
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
