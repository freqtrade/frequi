<script setup lang="ts">
import type { ChartSliderPosition, PairHistory, Trade } from '@/types';
import { LoadingStatus } from '@/types';

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
const colorStore = useColorStore();
const botStore = useBotStore();
const plotStore = usePlotConfigStore();

const showPlotConfig = ref<boolean>();


const dataset = computed((): PairHistory => {
  let firstpair = botStore.activeBot.plotMultiPairs[0];
  if (props.historicView) {
    return botStore.activeBot.history[`${firstpair}__${props.timeframe}`]?.data;
  }
  return botStore.activeBot.candleData[`${firstpair}__${props.timeframe}`]?.data;
});

const datasetColumns = computed(() =>
  dataset.value ? (dataset.value.all_columns ?? dataset.value.columns) : [],
);


const showPlotConfigModal = ref(false);
const strategyName = computed(() => props.strategy || dataset.value?.strategy || '');
function showConfigurator() {
  showPlotConfigModal.value = !showPlotConfigModal.value;
}

watch(
  () => botStore.activeBot.selectedPair,
  () => {
    botStore.activeBot.plotMultiPairs = [botStore.activeBot.selectedPair];
    refresh();
  },
);

onMounted(() => {
  showPlotConfig.value = true;
  if (botStore.activeBot.selectedPair) {
    botStore.activeBot.plotPair = botStore.activeBot.selectedPair;
  }
  plotStore.plotConfigChanged();
});

function refresh() {
  for (const pair of botStore.activeBot.plotMultiPairs) {
    emit('refreshData', pair, plotStore.usedColumns);
  }
}
</script>

<template>
  <div class="flex h-full">
    <div class="flex-fill w-full flex-col align-items-stretch flex h-full">
      <div class="flex me-0">
        <div class="ms-1 md:ms-2 flex flex-wrap md:flex-nowrap items-center gap-1">
          <span class="md:ms-2 text-nowrap">{{ strategyName }} | {{ timeframe || '' }}</span>
          <MultiSelect v-model="botStore.activeBot.plotMultiPairs" class="md:ms-2 w-80"
            :options="availablePairs.slice(0, 100)" optionlabel="" placeholder="Select pairs to plot" size="small"
            filter @before-hide="refresh">
          </MultiSelect>

          <Button title="Refresh chart" severity="secondary" :disabled="botStore.activeBot.plotMultiPairs.length == 0"
            size="small" @click="refresh">
            <i-mdi-refresh />
          </Button>
          <div class="ms-auto flex items-center gap-2">
            <BaseCheckbox v-model="settingsStore.showMarkArea">
              <span class="text-nowrap">Show Chart Areas</span>
            </BaseCheckbox>
            <BaseCheckbox v-model="settingsStore.useHeikinAshiCandles">
              <span class="text-nowrap">Heikin Ashi</span>
            </BaseCheckbox>

            <PlotConfigSelect></PlotConfigSelect>

            <div class="me-0 md:me-1">
              <Button size="small" title="Plot configurator" severity="secondary" @click="showConfigurator">
                <template #icon>
                  <i-mdi-cog width="12" height="12" />
                </template>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="botStore.activeBot.plotMultiPairs.length == 1" class="h-full flex">
        <div class="min-w-0 w-full flex-1">
          <SingleCandleChartContainer :available-pairs="availablePairs" :pair="botStore.activeBot.plotMultiPairs[0]"
            :historic-view="botStore.activeBot.isWebserverMode" :timeframe="timeframe"
            :trades="props.trades" :strategy="props.strategy"
            :slider-position="props.sliderPosition"
            @refresh-data="refresh()" :isSinglePairView="true">
          </SingleCandleChartContainer>
        </div>
      </div>
      <div v-else class="flex flex-wrap gap-4 mt-2">
        <div v-for="pair in botStore.activeBot.plotMultiPairs" :key="pair" class="flex-[1_1_30%] p-4">
          <div class="font-bold mt-2 mb-1">{{ pair }}</div>
          <SingleCandleChartContainer :available-pairs="availablePairs" :pair="pair"
            :historic-view="botStore.activeBot.isWebserverMode" :timeframe="timeframe"
            :trades="props.trades" :strategy="props.strategy"
            :slider-position="props.sliderPosition"
            @refresh-data="refresh()" :isSinglePairView="false">
          </SingleCandleChartContainer>
        </div>
      </div>
    </div>
    <Dialog id="plotConfiguratorModal" v-model:visible="showPlotConfigModal"
      header="Plot Configurator" ok-only hide-backdrop>
      <PlotConfigurator :is-visible="showPlotConfigModal" :columns="datasetColumns" />
    </Dialog>
  </div>
</template>

<style scoped lang="css">
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
