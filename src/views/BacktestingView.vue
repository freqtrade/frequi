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

const backtestTabs = computed(() => {
  const tabs: { slot: string; value: string; label: string; icon: string; disabled?: boolean }[] =
    [];
  if (botStore.activeBot.botFeatures.backtestHistory) {
    tabs.push({
      slot: 'historic-results',
      value: BtRunModes.historicresults,
      label: 'Load Results',
      icon: 'i-mdi-cloud-download',
      disabled: !botStore.activeBot.canRunBacktest,
    });
  }
  tabs.push({
    slot: 'run',
    value: BtRunModes.run,
    label: 'Run backtest',
    icon: 'i-mdi-run-fast',
    disabled: !botStore.activeBot.canRunBacktest,
  });
  tabs.push({
    slot: 'results',
    value: BtRunModes.results,
    label: 'Analyze result',
    icon: 'i-mdi-table-eye',
    disabled: !hasBacktestResult.value,
  });
  if (hasMultiBacktestResult.value) {
    tabs.push({
      slot: 'compare-results',
      value: BtRunModes.compareresults,
      label: 'Compare results',
      icon: 'i-mdi-compare-horizontal',
      disabled: !hasMultiBacktestResult.value,
    });
  }
  tabs.push({
    slot: 'visualize-summary',
    value: BtRunModes.visualizesummary,
    label: 'Visualize summary',
    icon: 'i-mdi-chart-bell-curve-cumulative',
    disabled: !hasBacktestResult.value,
  });
  tabs.push({
    slot: 'visualize',
    value: BtRunModes.visualize,
    label: 'Visualize result',
    icon: 'i-mdi-chart-timeline-variant-shimmer',
    disabled: !hasBacktestResult.value,
  });
  return tabs;
});
</script>

<template>
  <div class="flex flex-row pt-1 me-1 relative" style="height: calc(100vh - 60px)">
    <div
      v-if="btFormMode !== 'visualize'"
      class="flex md:flex-row h-full w-16 transition-all duration-200 shrink-0 me-1 border-r border-neutral-200 dark:border-neutral-900"
      :class="{
        'w-78!': showLeftBar,
      }"
    >
      <!-- Left bar -->
      <div class="flex flex-col fixed">
        <UButton
          class="self-start"
          aria-label="Close"
          color="neutral"
          variant="outline"
          :icon="showLeftBar ? 'mdi:chevron-left' : 'mdi:chevron-right'"
          @click="showLeftBar = !showLeftBar"
        />
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
        <UTabs v-model="btFormMode" :items="backtestTabs">
          <template #historic-results>
            <BacktestHistoryLoad />
          </template>
          <template #run>
            <BacktestRun />
          </template>
          <template #results>
            <BacktestResultAnalysis
              v-if="hasBacktestResult && botStore.activeBot.selectedBacktestResult"
              :backtest-result="botStore.activeBot.selectedBacktestResult"
              class="flex-fill"
            />
          </template>
          <template #compare-results>
            <BacktestResultComparison
              v-if="hasMultiBacktestResult"
              :backtest-results="botStore.activeBot.backtestHistory"
              class="flex-fill"
            />
          </template>
          <template #visualize-summary>
            <BacktestGraphs
              v-if="hasBacktestResult && botStore.activeBot.selectedBacktestResult"
              :trades="botStore.activeBot.selectedBacktestResult.trades"
              class="flex-fill"
            />
          </template>
          <template #visualize>
            <BacktestResultChart
              v-if="botStore.activeBot.selectedBacktestResult"
              :timeframe="timeframe"
              :strategy="btStore.strategy"
              :timerange="btStore.timerange"
              :backtest-result="botStore.activeBot.selectedBacktestResult"
              :freqai-model="btStore.freqAI.enabled ? btStore.freqAI.model : undefined"
            />
          </template>
        </UTabs>

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
