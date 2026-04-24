<script setup lang="ts">
import type { ChartSliderPosition, PairHistory, Trade } from '@/types';
import { LoadingStatus } from '@/types';

interface SetupRow {
  pair: string;
  side: 'LONG' | 'SHORT';
  progress: string;
  progress_value: number | null;
  status: string;
  result: string;
}

interface SetupPayload {
  rows: SetupRow[];
  top_setup: SetupRow | null;
  updated_at?: string;
  source?: string;
}

const props = withDefaults(
  defineProps<{
    trades?: Trade[];
    availablePairs: string[];
    timeframe: string;
    historicView?: boolean;
    pair?: string;
    sliderPosition?: ChartSliderPosition;
    isSinglePairView?: boolean;
  }>(),
  {
    trades: () => [],
    historicView: false,
    pair: '',
    sliderPosition: undefined,
    isSinglePairView: true,
  },
);

const emit = defineEmits<{
  refreshData: [pair: string, columns: string[]];
}>();

const settingsStore = useSettingsStore();
const colorStore = useColorStore();
const botStore = useBotStore();
const plotStore = usePlotConfigStore();

const API_BASE = 'http://localhost:5001';
const setupsPayload = ref<SetupPayload>({
  rows: [],
  top_setup: null,
});
let setupPollInterval: number | undefined;

const dataset = computed((): PairHistory => {
  if (props.historicView) {
    return botStore.activeBot.history[`${props.pair}__${props.timeframe}`]?.data;
  }
  return botStore.activeBot.candleData[`${props.pair}__${props.timeframe}`]?.data;
});

const chartDataset = computed(() => {
  if (!dataset.value || !dataset.value.data?.length || !dataset.value.columns?.length) {
    return dataset.value;
  }

  const highIndex = dataset.value.columns.findIndex((c) => c === 'high');
  const lowIndex = dataset.value.columns.findIndex((c) => c === 'low');
  const volumeIndex = dataset.value.columns.findIndex((c) => c === 'volume');

  if (highIndex < 0 || lowIndex < 0 || volumeIndex < 0) {
    return dataset.value;
  }

  const recentCandles = dataset.value.data.slice(-50);

  const highs = recentCandles.map((row) => Number(row[highIndex])).filter((v) => !Number.isNaN(v));
  const lows = recentCandles.map((row) => Number(row[lowIndex])).filter((v) => !Number.isNaN(v));

  if (!highs.length || !lows.length) {
    return dataset.value;
  }

  const recentHigh = Math.max(...highs);
  const recentLow = Math.min(...lows);

  const volumeCandles = dataset.value.data.slice(-20);
  const volumes = volumeCandles
    .map((row) => Number(row[volumeIndex]))
    .filter((v) => !Number.isNaN(v));

  const lastRow = dataset.value.data[dataset.value.data.length - 1];
  const currentVolume = Number(lastRow?.[volumeIndex]);

  const avgVolume20 =
    volumes.length > 0 ? volumes.reduce((sum, v) => sum + v, 0) / volumes.length : null;

  const volumeRatio =
    avgVolume20 && avgVolume20 > 0 && !Number.isNaN(currentVolume)
      ? currentVolume / avgVolume20
      : null;

  const highVolumeEvent = volumeRatio !== null ? volumeRatio >= 1.5 : false;

  return {
    ...dataset.value,
    zones: {
      support: [{ low: recentLow * 0.998, high: recentLow * 1.002 }],
      resistance: [{ low: recentHigh * 0.998, high: recentHigh * 1.002 }],
    },
    levels: {
      breakout_above: recentHigh * 1.001,
      breakout_below: recentLow * 0.999,
    },
    volumeContext: {
      current_volume: !Number.isNaN(currentVolume) ? currentVolume : null,
      avg_volume_20: avgVolume20,
      volume_ratio: volumeRatio,
      high_volume_event: highVolumeEvent,
    },
  };
});

const currentPairSetup = computed(() => {
  const pair = props.pair;
  if (!pair) return null;
  return setupsPayload.value.rows.find((row) => row.pair === pair) ?? null;
});

const datasetColumns = computed(() =>
  dataset.value ? (dataset.value.all_columns ?? dataset.value.columns) : [],
);

const datasetLoadedColumns = computed(() =>
  dataset.value ? (dataset.value.columns ?? dataset.value.all_columns) : [],
);

const hasDataset = computed(() => !!chartDataset.value && chartDataset.value.data.length > 0);

const isLoadingDataset = computed((): boolean => {
  if (props.historicView) {
    return botStore.activeBot.historyStatus === LoadingStatus.loading;
  }

  return botStore.activeBot.candleDataStatus === LoadingStatus.loading;
});

const noDatasetText = computed((): string => {
  const status = props.historicView
    ? botStore.activeBot.historyStatus
    : botStore.activeBot.candleDataStatus;

  switch (status) {
    case LoadingStatus.not_loaded:
      return 'Not loaded yet.';
    case LoadingStatus.loading:
      return 'Loading...';
    case LoadingStatus.success:
      return 'No data available';
    case LoadingStatus.error:
      return 'Failed to load data';
    default:
      return 'Unknown';
  }
});

function bannerStatusClass(status: string): string {
  if (status.startsWith('Waiting:')) return 'text-orange-600';
  if (status === 'Entered') return 'text-green-600';
  return 'text-surface-900 dark:text-surface-100';
}

function bannerResultClass(result: string): string {
  if (!result) return 'text-surface-900 dark:text-surface-100';
  if (result.startsWith('Open ')) return 'text-green-600';
  if (result.includes('+')) return 'text-blue-600';
  if (result.includes('-')) return 'text-red-600';
  return 'text-surface-900 dark:text-surface-100';
}

async function fetchSetups() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/setups`);
    if (!res.ok) return;
    const data = await res.json();
    setupsPayload.value = {
      rows: Array.isArray(data?.rows) ? data.rows : [],
      top_setup: data?.top_setup ?? null,
      updated_at: data?.updated_at,
      source: data?.source,
    };
  } catch (error) {
    console.error('SingleCandleChartContainer setups fetch failed', error);
  }
}

function refresh() {
  emit('refreshData', props.pair, plotStore.usedColumns);
}

function refreshIfNecessary() {
  if (!hasDataset.value) {
    refresh();
  }
}

function assignFirstPair() {
  const [firstPair] = props.availablePairs;
  if (firstPair) {
    // props.pair = firstPair;
  }
}

watch(
  () => props.availablePairs,
  () => {
    if (!props.availablePairs.find((p) => p === props.pair)) {
      assignFirstPair();
      refresh();
    }
  },
);

watch(
  () => plotStore.plotConfig,
  () => {
    const hasAllColumns = plotStore.usedColumns.some(
      (c) => datasetColumns.value.includes(c) && !datasetLoadedColumns.value.includes(c),
    );

    if (settingsStore.useReducedPairCalls && hasAllColumns) {
      refresh();
    }
  },
);

watch(
  () => props.timeframe,
  () => {
    refreshIfNecessary();
  },
);

onMounted(() => {
  fetchSetups();
  setupPollInterval = window.setInterval(fetchSetups, 3000);
});

onBeforeUnmount(() => {
  if (setupPollInterval) {
    window.clearInterval(setupPollInterval);
  }
});
</script>

<template>
  <div
    class="flex-fill w-full flex-col align-items-stretch flex"
    :class="{
      'h-full': isSinglePairView,
      'h-150 border border-r border-b border-surface-300 dark:border-surface-700':
        !isSinglePairView,
    }"
  >
    <div
      v-if="currentPairSetup"
      class="mx-1 mt-1 mb-2 rounded border border-surface-300 dark:border-surface-700 px-3 py-2 bg-surface-50 dark:bg-surface-900"
    >
      <div class="text-xs uppercase tracking-wide text-surface-500 dark:text-surface-400">
        Trade Readiness
      </div>
      <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span class="font-semibold">{{ currentPairSetup.pair }}</span>
        <span>{{ currentPairSetup.side }}</span>
        <span>{{ currentPairSetup.progress }}</span>
        <span :class="bannerStatusClass(currentPairSetup.status)">{{
          currentPairSetup.status
        }}</span>
        <span v-if="currentPairSetup.result" :class="bannerResultClass(currentPairSetup.result)">
          {{ currentPairSetup.result }}
        </span>
      </div>
    </div>

    <div class="flex me-0 w-full items-center justify-between">
      <div class="ms-1 md:ms-2 flex flex-wrap md:flex-nowrap items-center gap-1">
        <div class="flex flex-col md:flex-row md:gap-2">
          <div class="flex flex-row flex-wrap gap-2">
            <small v-if="dataset" class="text-sm text-nowrap">
              Long entries: {{ dataset.enter_long_signals || dataset.buy_signals }}
            </small>
            <small v-if="dataset" class="text-sm text-nowrap">
              Long exit: {{ dataset.exit_long_signals || dataset.sell_signals }}
            </small>
          </div>
          <div class="flex flex-row flex-wrap gap-2">
            <small v-if="dataset && dataset.enter_short_signals" class="text-sm text-nowrap">
              Short entries: {{ dataset.enter_short_signals }}
            </small>
            <small v-if="dataset && dataset.exit_short_signals" class="text-sm text-nowrap">
              Short exits: {{ dataset.exit_short_signals }}
            </small>
          </div>
        </div>

        <div class="flex flex-row flex-wrap gap-2">
          <small v-if="(chartDataset as any)?.volumeContext">
            Vol Ratio:
            {{ (chartDataset as any).volumeContext.volume_ratio?.toFixed?.(2) ?? 'n/a' }}
          </small>

          <small v-if="(chartDataset as any)?.volumeContext">
            High Vol:
            {{ (chartDataset as any).volumeContext.high_volume_event ? 'YES' : 'NO' }}
          </small>
        </div>
      </div>

      <div>
        {{ pair || 'Pair' }}
      </div>

      <div v-if="isLoadingDataset">
        <ProgressSpinner class="w-4 h-4" stroke-width="4" small />
      </div>
      <div v-else class="w-4 h-4"></div>
    </div>

    <div class="h-full flex">
      <div class="min-w-0 w-full flex-1">
        <CandleChart
          v-if="hasDataset"
          :dataset="chartDataset"
          :trades="trades"
          :plot-config="plotStore.plotConfig"
          :heikin-ashi="settingsStore.useHeikinAshiCandles"
          :show-mark-area="settingsStore.showMarkArea"
          :show-zones="true"
          :use-u-t-c="settingsStore.timezone === 'UTC'"
          :theme="settingsStore.chartTheme"
          :slider-position="sliderPosition"
          :color-up="colorStore.colorUp"
          :color-down="colorStore.colorDown"
          :start-candle-count="settingsStore.chartDefaultCandleCount"
          :label-side="settingsStore.chartLabelSide"
        />

        <div v-else class="m-auto">
          <ProgressSpinner v-if="isLoadingDataset" class="w-5 h-5" />
          <div v-else class="text-lg">
            {{ noDatasetText }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
