<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';

type BtView = 'new' | 'result' | 'compare';

const botStore = useBotStore();
const btStore = useBtStore();
const { confirm } = useConfirmBox();

const hasBacktestResult = computed(() =>
  botStore.activeBot.backtestHistory
    ? Object.keys(botStore.activeBot.backtestHistory).length !== 0
    : false,
);

const timeframe = computed((): string => {
  return botStore.activeBot.selectedBacktestResult?.timeframe ?? '';
});

const view = ref<BtView>(hasBacktestResult.value ? 'result' : 'new');
const resultTab = ref('overview');
const railCollapsed = ref(false);
// Width of the rail - only follows railCollapsed once the old content has faded out,
// so charts in the main area resize once instead of on every animation frame.
const railNarrow = ref(railCollapsed.value);
const showHistoryLoad = ref(false);
const pollInterval = ref<number | null>(null);

const compareKeys = ref<string[]>([]);
const compareResults = computed(() =>
  Object.fromEntries(
    Object.entries(botStore.activeBot.backtestHistory).filter(([key]) =>
      compareKeys.value.includes(key),
    ),
  ),
);
const canCompare = computed(() => Object.keys(compareResults.value).length > 1);

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
    if (botStore.activeBot.selectedBacktestResult) {
      view.value = 'result';
    }
  },
);

watch(resultTab, (tab) => {
  // The pair chart needs all the horizontal space it can get
  if (tab === 'pair-chart') {
    railCollapsed.value = true;
  }
});

onMounted(async () => {
  await botStore.activeBot.getState();
  if (botStore.activeBot.canRunBacktest) {
    // Pick up a backtest that's still running (e.g. after a page reload)
    botStore.activeBot.getBacktestStatus();
  }
});
watch(
  () => botStore.activeBot.backtestRunning,
  () => {
    if (botStore.activeBot.backtestRunning === true) {
      pollInterval.value ??= window.setInterval(botStore.activeBot.pollBacktest, 1000);
    } else if (pollInterval.value) {
      clearInterval(pollInterval.value);
      pollInterval.value = null;
    }
  },
  { immediate: true },
);
onUnmounted(() => {
  if (pollInterval.value) {
    clearInterval(pollInterval.value);
  }
});

const resultTabs: TabsItem[] = [
  { slot: 'overview', value: 'overview', label: 'Overview', icon: 'i-mdi-view-dashboard' },
  { slot: 'breakdowns', value: 'breakdowns', label: 'Breakdowns', icon: 'i-mdi-table-eye' },
  { slot: 'trades', value: 'trades', label: 'Trades', icon: 'i-mdi-format-list-bulleted' },
  {
    slot: 'charts',
    value: 'charts',
    label: 'Charts',
    icon: 'i-mdi-chart-bell-curve-cumulative',
  },
  {
    slot: 'pair-chart',
    value: 'pair-chart',
    label: 'Pair chart',
    icon: 'i-mdi-chart-timeline-variant-shimmer',
  },
];

async function resetBacktest() {
  if (
    await confirm({
      title: 'Reset backtest',
      message: 'Unload all results from the UI and reset the backtest state on the server?',
    })
  ) {
    compareKeys.value = [];
    botStore.activeBot.removeBacktest();
  }
}

const resultSelectItems = computed(() =>
  Object.entries(botStore.activeBot.backtestHistory).map(([key, result]) => ({
    label: `${result.metadata.strategyName} - ${result.strategy.timeframe} (${formatPercent(result.strategy.profit_total)})`,
    value: key,
  })),
);
</script>

<template>
  <div class="flex flex-col p-1 pt-2" style="height: calc(100vh - 60px)">
    <div class="flex flex-row grow min-h-0 gap-2">
      <!-- Result list -->
      <aside
        class="hidden md:flex flex-col gap-1 shrink-0 border-r border-default pe-2 overflow-x-clip"
        :class="railNarrow ? 'w-10' : 'w-72'"
      >
        <Transition
          mode="out-in"
          enter-active-class="transition duration-75"
          leave-active-class="transition duration-75"
          enter-from-class="opacity-0 -translate-x-4"
          leave-to-class="opacity-0 -translate-x-4"
          @before-enter="railNarrow = railCollapsed"
        >
          <div v-if="!railCollapsed" class="flex flex-col gap-1 grow min-h-0">
            <UButton
              icon="i-mdi-plus"
              block
              :variant="view === 'new' ? 'solid' : 'outline'"
              :disabled="!botStore.activeBot.canRunBacktest"
              @click="view = 'new'"
            >
              New backtest
            </UButton>
            <div class="flex gap-1">
              <UButton
                v-if="botStore.activeBot.botFeatures.backtestHistory"
                icon="i-mdi-cloud-download"
                color="neutral"
                variant="outline"
                block
                class="grow"
                :disabled="!botStore.activeBot.canRunBacktest"
                @click="showHistoryLoad = true"
              >
                Load from disk
              </UButton>
              <UTooltip text="Reset backtest">
                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-mdi-replay"
                  aria-label="Reset backtest"
                  :disabled="
                    botStore.activeBot.backtestRunning || !botStore.activeBot.canRunBacktest
                  "
                  @click="resetBacktest"
                />
              </UTooltip>
            </div>
            <BacktestRunningStatus />
            <USeparator label="Results" />
            <div class="grow min-h-0 overflow-y-auto">
              <BacktestResultSelect
                v-model:compare-keys="compareKeys"
                :backtest-history="botStore.activeBot.backtestHistory"
                :selected-backtest-result-key="botStore.activeBot.selectedBacktestResultKey"
                :can-use-modify="botStore.activeBot.botFeatures.backtestSetNotes"
                @selection-change="botStore.activeBot.setBacktestResultKey"
                @remove-result="botStore.activeBot.removeBacktestResultFromMemory"
                @update-result="botStore.activeBot.saveBacktestResultMetadata"
              />
              <p v-if="!hasBacktestResult" class="text-sm text-muted text-center p-2">
                No results loaded yet.
              </p>
            </div>
            <UButton
              icon="i-mdi-compare-horizontal"
              color="neutral"
              :variant="view === 'compare' ? 'solid' : 'outline'"
              block
              :disabled="!canCompare"
              :title="canCompare ? '' : 'Tick at least 2 results to compare them'"
              @click="view = 'compare'"
            >
              Compare ({{ Object.keys(compareResults).length }})
            </UButton>
          </div>
          <div v-else class="flex flex-col gap-1 grow min-h-0">
            <UTooltip text="New backtest">
              <UButton
                icon="i-mdi-plus"
                :variant="view === 'new' ? 'solid' : 'outline'"
                :disabled="!botStore.activeBot.canRunBacktest"
                @click="view = 'new'"
              />
            </UTooltip>
            <UTooltip v-if="botStore.activeBot.botFeatures.backtestHistory" text="Load from disk">
              <UButton
                icon="i-mdi-cloud-download"
                color="neutral"
                variant="outline"
                :disabled="!botStore.activeBot.canRunBacktest"
                @click="showHistoryLoad = true"
              />
            </UTooltip>
            <UTooltip text="Reset backtest">
              <UButton
                color="neutral"
                variant="outline"
                icon="i-mdi-delete"
                aria-label="Reset backtest"
                :disabled="botStore.activeBot.backtestRunning || !botStore.activeBot.canRunBacktest"
                @click="resetBacktest"
              />
            </UTooltip>
            <UTooltip v-if="botStore.activeBot.backtestRunning" text="Backtest running">
              <UIcon name="i-mdi-loading" class="animate-spin text-primary size-5 mx-auto" />
            </UTooltip>
          </div>
        </Transition>
        <UButton
          :icon="railCollapsed ? 'i-mdi-chevron-double-right' : 'i-mdi-chevron-double-left'"
          color="neutral"
          variant="ghost"
          class="mt-auto self-start"
          :aria-label="railCollapsed ? 'Expand result list' : 'Collapse result list'"
          @click="railCollapsed = !railCollapsed"
        />
      </aside>

      <!-- Main area -->
      <div class="flex flex-col grow min-w-0 overflow-y-auto gap-2 p-0.5 pe-1 *:shrink-0">
        <UAlert
          v-if="!botStore.activeBot.canRunBacktest"
          color="warning"
          variant="subtle"
          icon="i-mdi-alert"
          title="Bot must be in webserver mode to enable Backtesting."
        />
        <!-- Mobile result selection -->
        <div class="flex md:hidden items-center gap-1">
          <USelect
            v-if="hasBacktestResult"
            :model-value="botStore.activeBot.selectedBacktestResultKey"
            :items="resultSelectItems"
            class="grow"
            @update:model-value="botStore.activeBot.setBacktestResultKey($event as string)"
          />
          <UButton
            icon="i-mdi-plus"
            :disabled="!botStore.activeBot.canRunBacktest"
            aria-label="New backtest"
            @click="view = 'new'"
          />
          <UButton
            v-if="botStore.activeBot.botFeatures.backtestHistory"
            icon="i-mdi-cloud-download"
            color="neutral"
            variant="outline"
            aria-label="Load from disk"
            :disabled="!botStore.activeBot.canRunBacktest"
            @click="showHistoryLoad = true"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-mdi-delete"
            aria-label="Reset backtest"
            :disabled="botStore.activeBot.backtestRunning || !botStore.activeBot.canRunBacktest"
            @click="resetBacktest"
          />
        </div>
        <BacktestRunningStatus class="md:hidden" />

        <template v-if="view === 'new'">
          <h3 class="text-xl font-bold">New backtest</h3>
          <BacktestRun :can-cancel="hasBacktestResult" @cancel="view = 'result'" />
        </template>

        <template v-else-if="view === 'compare' && canCompare">
          <div class="flex items-center gap-2">
            <h3 class="text-xl font-bold">
              Comparing {{ Object.keys(compareResults).length }} results
            </h3>
            <UButton
              class="ms-auto"
              color="neutral"
              variant="outline"
              icon="i-mdi-close"
              @click="view = 'result'"
            >
              Exit comparison
            </UButton>
          </div>
          <BacktestResultComparison :backtest-results="compareResults" />
        </template>

        <template v-else-if="hasBacktestResult && botStore.activeBot.selectedBacktestResult">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 class="text-xl font-bold">
              {{ botStore.activeBot.selectedBacktestResult.strategy_name }}
            </h3>
            <span class="text-muted text-sm">
              {{ botStore.activeBot.selectedBacktestResult.timeframe }}
              <template v-if="botStore.activeBot.selectedBacktestResult.timeframe_detail">
                (detail {{ botStore.activeBot.selectedBacktestResult.timeframe_detail }})
              </template>
              · {{ timestampms(botStore.activeBot.selectedBacktestResult.backtest_start_ts) }} →
              {{ timestampms(botStore.activeBot.selectedBacktestResult.backtest_end_ts) }}
            </span>
            <UButton
              class="ms-auto"
              size="sm"
              color="neutral"
              variant="outline"
              icon="i-mdi-replay"
              :disabled="!botStore.activeBot.canRunBacktest"
              title="Open the backtest form with the settings of this result"
              @click="view = 'new'"
            >
              Re-run with these settings
            </UButton>
          </div>
          <BacktestResultKpis :backtest-result="botStore.activeBot.selectedBacktestResult" />
          <UTabs v-model="resultTab" :items="resultTabs" variant="link" class="w-full">
            <template #overview>
              <BacktestResultOverview
                :backtest-result="botStore.activeBot.selectedBacktestResult"
              />
            </template>
            <template #breakdowns>
              <BacktestResultBreakdowns
                :backtest-result="botStore.activeBot.selectedBacktestResult"
              />
            </template>
            <template #trades>
              <TradeList
                :trades="botStore.activeBot.selectedBacktestResult.trades"
                :show-filter="true"
                :stake-currency="botStore.activeBot.selectedBacktestResult.stake_currency"
              />
            </template>
            <template #charts>
              <BacktestGraphs
                :key="botStore.activeBot.selectedBacktestResultKey"
                :trades="botStore.activeBot.selectedBacktestResult.trades"
              />
            </template>
            <template #pair-chart>
              <BacktestResultChart
                :timeframe="timeframe"
                :strategy="btStore.strategy"
                :timerange="btStore.timerange"
                :backtest-result="botStore.activeBot.selectedBacktestResult"
                :freqai-model="btStore.freqAI.enabled ? btStore.freqAI.model : undefined"
              />
            </template>
          </UTabs>
        </template>

        <UEmpty
          v-else
          icon="i-mdi-chart-box-outline"
          title="No backtest result selected"
          description="Run a new backtest or load a previous result from disk."
          :actions="[
            {
              label: 'New backtest',
              icon: 'i-mdi-plus',
              disabled: !botStore.activeBot.canRunBacktest,
              onClick: () => (view = 'new'),
            },
            ...(botStore.activeBot.botFeatures.backtestHistory
              ? [
                  {
                    label: 'Load from disk',
                    icon: 'i-mdi-cloud-download',
                    color: 'neutral' as const,
                    variant: 'outline' as const,
                    disabled: !botStore.activeBot.canRunBacktest,
                    onClick: () => (showHistoryLoad = true),
                  },
                ]
              : []),
          ]"
        />
      </div>
    </div>

    <UModal
      v-model:open="showHistoryLoad"
      title="Load results from disk"
      :ui="{ content: 'sm:max-w-6xl' }"
    >
      <template #body>
        <BacktestHistoryLoad />
      </template>
    </UModal>
  </div>
</template>
