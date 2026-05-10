<script setup lang="ts">
import type { ChartSliderPosition, PairHistory, Trade } from '@/types';

const props = withDefaults(
  defineProps<{
    trades?: Trade[];
    availablePairs: string[];
    timeframe: string;
    historicView?: boolean;
    /** Reload data on pair switch if in historic view */
    reloadDataOnSwitch?: boolean;
    strategy?: string;
    sliderPosition?: ChartSliderPosition;
  }>(),
  {
    trades: () => [],
    historicView: false,
    reloadDataOnSwitch: false,
    strategy: '',
    sliderPosition: undefined,
  },
);

const emit = defineEmits<{
  refreshData: [pair: string, columns: string[]];
}>();

const settingsStore = useSettingsStore();
const botStore = useBotStore();
const plotStore = usePlotConfigStore();

const dataset = computed((): PairHistory => {
  const firstpair = botStore.activeBot.plotMultiPairs[0];
  if (props.historicView) {
    return botStore.activeBot.history[`${firstpair}__${props.timeframe}`]?.data;
  }
  return botStore.activeBot.candleData[`${firstpair}__${props.timeframe}`]?.data;
});

const datasetColumns = computed(() =>
  dataset.value ? (dataset.value.all_columns ?? dataset.value.columns) : [],
);

const strategyName = computed(() => props.strategy || dataset.value?.strategy || '');

const showPlotConfigModal = ref(false);
function showConfigurator() {
  showPlotConfigModal.value = !showPlotConfigModal.value;
}

const isSinglePairView = computed(() => botStore.activeBot.plotMultiPairs.length === 1);

watch(
  () => botStore.activeBot.selectedPair,
  () => {
    botStore.activeBot.plotMultiPairs = [botStore.activeBot.selectedPair];
  },
);

onMounted(() => {
  if (botStore.activeBot.selectedPair) {
    botStore.activeBot.plotMultiPairs = [botStore.activeBot.selectedPair];
  } else if (props.availablePairs.length > 0) {
    assignFirstPair();
  }
  plotStore.plotConfigChanged();
});

function refresh() {
  for (const pair of botStore.activeBot.plotMultiPairs) {
    emit('refreshData', pair, plotStore.usedColumns);
  }
}

function refreshIfNecessary(newValue: string[], oldValue: string[] | undefined) {
  for (const pair of newValue) {
    if (oldValue?.includes(pair)) {
      continue;
    }
    emit('refreshData', pair, plotStore.usedColumns);
  }
}

function assignFirstPair() {
  const [firstPair] = props.availablePairs;
  if (firstPair) {
    botStore.activeBot.plotMultiPairs = [firstPair];
  }
}

watch(
  () => props.availablePairs,
  () => {
    if (
      botStore.activeBot.plotMultiPairs.length === 0 ||
      botStore.activeBot.plotMultiPairs.some((p) => !props.availablePairs.includes(p))
    ) {
      assignFirstPair();
      refresh();
    }
  },
);

watch(
  () => botStore.activeBot.plotMultiPairs,
  (newValue, oldValue) => {
    if (newValue.length === 0) return;

    if (!props.historicView || props.reloadDataOnSwitch) {
      refreshIfNecessary(newValue, oldValue);
    }
  },
  {
    immediate: true,
  },
);

watch(
  () => settingsStore.multiPairSelection,
  () => {
    if (
      !settingsStore.multiPairSelection &&
      botStore.activeBot.plotMultiPairs.length > 1 &&
      botStore.activeBot.plotMultiPairs[0]
    ) {
      // Select only the first pair if switching to single pair mode
      botStore.activeBot.plotMultiPairs = [botStore.activeBot.plotMultiPairs[0]];
    }
  },
);

const singlePairSelection = computed({
  get() {
    return botStore.activeBot.plotMultiPairs[0] || '';
  },
  set(value: string) {
    botStore.activeBot.plotMultiPairs = [value];
  },
});
</script>

<template>
  <div class="flex h-full">
    <div class="flex-fill w-full flex-col align-items-stretch flex h-full">
      <div class="flex me-0 items-center md:gap-2 gap-1 flex-wrap mx-1 md:mx-0">
        <span class="md:ms-2 text-nowrap">{{ strategyName }} | {{ timeframe || '' }}</span>

        <div class="flex gap-1 md:gap-2 w-full md:w-auto">
          <USelectMenu
            multiple
            v-if="settingsStore.multiPairSelection"
            v-model="botStore.activeBot.plotMultiPairs"
            class="md:w-80 w-full"
            :items="availablePairs"
            optionlabel=""
            virtualize
            placeholder="Select pairs to plot"
            size="md"
            filter
          >
          </USelectMenu>
          <USelectMenu
            v-else
            v-model="singlePairSelection"
            class="md:w-80 w-full"
            :items="availablePairs"
            size="md"
            :clearable="false"
            virtualize
            @input="refresh"
          >
          </USelectMenu>
          <UButton
            title="Refresh chart"
            color="neutral"
            :disabled="botStore.activeBot.plotMultiPairs.length === 0"
            icon="mdi:refresh"
            @click="refresh"
          />
        </div>
        <BaseCheckbox v-model="settingsStore.multiPairSelection">
          <span class="text-nowrap">Multi pair</span>
        </BaseCheckbox>
        <div class="ms-auto flex flex-wrap items-center gap-2">
          <BaseCheckbox v-model="settingsStore.showMarkArea">
            <span class="text-nowrap">Show Chart Areas</span>
          </BaseCheckbox>
          <BaseCheckbox v-model="settingsStore.useHeikinAshiCandles">
            <span class="text-nowrap">Heikin Ashi</span>
          </BaseCheckbox>

          <div class="me-0 md:me-1 flex grow">
            <PlotConfigSelect class="grow min-w-40"></PlotConfigSelect>

            <UButton
              title="Plot configurator"
              color="neutral"
              icon="mdi:cog"
              @click="showConfigurator"
            />
          </div>
        </div>
      </div>
      <div
        v-if="botStore.activeBot.plotMultiPairs?.length > 0"
        :class="{
          'min-w-0 w-full h-full ': isSinglePairView,
          'grid grid-cols-1 lg:grid-cols-2': !isSinglePairView,
        }"
      >
        <SingleCandleChartContainer
          v-for="pair in botStore.activeBot.plotMultiPairs"
          :key="pair"
          :available-pairs="availablePairs"
          :pair="pair"
          :historic-view="botStore.activeBot.isWebserverMode"
          :timeframe="timeframe"
          :trades="props.trades"
          :slider-position="props.sliderPosition"
          :is-single-pair-view="isSinglePairView"
          @refresh-data="refresh()"
        >
        </SingleCandleChartContainer>
      </div>
      <div v-else class="flex flex-col items-center justify-center h-full w-full">
        <span class="text-2xl font-semibold">No pair selected</span>
      </div>
    </div>
    <DraggableModal
      v-model:open="showPlotConfigModal"
      title="Plot Configurator"
      class="max-w-xl"
      description="Configure chart plot indicators and subplots"
      :overlay="false"
      :modal="false"
      :dismissible="false"
    >
      <template #body>
        <PlotConfigurator :is-visible="showPlotConfigModal" :columns="datasetColumns" />
      </template>
    </DraggableModal>
  </div>
</template>
