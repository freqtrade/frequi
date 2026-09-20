<script setup lang="ts">
import type { ChartSliderPosition, StrategyBacktestResult, Trade } from '@/types';

const props = defineProps<{
  timeframe: string;
  strategy: string;
  freqaiModel?: string;
  timerange: string;
  backtestResult: StrategyBacktestResult;
}>();
const botStore = useBotStore();
const plotStore = usePlotConfigStore();
const isBarVisible = ref({ right: true, left: true });
const sliderPosition = ref<ChartSliderPosition>();

const btMetadata = computed(() => botStore.activeBot.selectedBacktestMetadata);
/** Results loaded from disk can be analyzed with the strategy stored in the result */
const canUseBacktestStrategy = computed(
  () => botStore.activeBot.botFeatures.backtestPairHistory && !!btMetadata.value?.filename,
);
const useBacktestStrategy = ref(true);

function navigateChartToTrade(trade: Trade) {
  sliderPosition.value = {
    startValue: trade.open_timestamp,
    endValue: trade.close_timestamp,
  };
}

function refreshOHLCV(pair: string, columns: string[]) {
  const filename = btMetadata.value?.filename;
  if (useBacktestStrategy.value && canUseBacktestStrategy.value && filename) {
    botStore.activeBot.getBacktestPairHistory({
      filename,
      strategy: btMetadata.value?.strategyName ?? props.strategy,
      pair: pair,
      timeframe: props.timeframe,
      timerange: props.timerange || undefined,
      columns: columns,
    });
    return;
  }
  botStore.activeBot.getPairHistory({
    pair: pair,
    timeframe: props.timeframe,
    timerange: props.timerange,
    strategy: props.strategy,
    freqaimodel: props.freqaiModel,
    columns: columns,
    margin_mode: props.backtestResult.margin_mode,
    trading_mode: props.backtestResult.trading_mode,
  });
}
watch(useBacktestStrategy, () => {
  for (const pair of botStore.activeBot.plotMultiPairs) {
    refreshOHLCV(pair, plotStore.usedColumns);
  }
});

onMounted(() => {
  if (!botStore.activeBot.selectedPair && props.backtestResult.pairlist.length > 0) {
    const [firstPair] = props.backtestResult.pairlist;
    if (firstPair) {
      botStore.activeBot.selectedPair = firstPair;
    }
  }
});
</script>

<template>
  <div>
    <div class="flex flex-row mb-1 items-center">
      <div class="me-2">
        <UButton
          aria-label="Close"
          title="Pair Navigation"
          color="neutral"
          variant="outline"
          :icon="isBarVisible.left ? 'mdi:chevron-left' : 'mdi:chevron-right'"
          @click="isBarVisible.left = !isBarVisible.left"
        />
      </div>
      <div class="grow flex flex-col items-center">
        <span v-if="useBacktestStrategy && canUseBacktestStrategy">
          Graph uses the strategy and parameters stored in the backtest result.
        </span>
        <span v-else>Graph will always show the latest values for the selected strategy.</span>
        <span>Timerange: {{ timerange }} - {{ strategy }}</span>
      </div>
      <BaseCheckbox v-if="canUseBacktestStrategy" v-model="useBacktestStrategy" class="me-2">
        <span class="text-nowrap">Use backtest strategy</span>
      </BaseCheckbox>
      <div class="text-end">
        <UButton
          aria-label="Close"
          variant="outline"
          title="Trade Navigation"
          color="neutral"
          :icon="isBarVisible.right ? 'mdi:chevron-right' : 'mdi:chevron-left'"
          @click="isBarVisible.right = !isBarVisible.right"
        />
      </div>
    </div>
    <div class="text-center flex flex-row h-full items-stretch overflow-x-clip">
      <Transition name="fadeleft">
        <PairSummary
          v-if="isBarVisible.left"
          class="overflow-y-auto overflow-x-hidden"
          style="max-height: calc(100vh - 200px)"
          :pairlist="backtestResult.pairlist"
          :trades="backtestResult.trades"
          :starting-balance="backtestResult.starting_balance"
          sort-method="profit"
          :backtest-mode="true"
        />
      </Transition>
      <CandleChartContainer
        :available-pairs="backtestResult.pairlist"
        historic-view
        reload-data-on-switch
        :timeframe="timeframe"
        :timerange="timerange"
        :strategy="strategy"
        :trades="backtestResult.trades"
        class="flex-1 candle-chart-container px-0 h-full align-self-stretch min-w-0 overflow-y-auto"
        :slider-position="sliderPosition"
        :freqai-model="freqaiModel"
        @refresh-data="refreshOHLCV"
      >
      </CandleChartContainer>
      <Transition name="fade">
        <TradeListNav
          v-if="isBarVisible.right"
          class="overflow-y-auto overflow-x-visible min-w-56"
          style="max-height: calc(100vh - 200px)"
          :trades="backtestResult.trades.filter((t) => t.pair === botStore.activeBot.selectedPair)"
          @trade-select="navigateChartToTrade"
        />
      </Transition>
    </div>
    <DraggableContainer header="Single trades" class="row mt-2 w-full">
      <TradeList
        class="row trade-history mt-2 w-full"
        :trades="backtestResult.trades"
        :show-filter="true"
      />
    </DraggableContainer>
  </div>
</template>

<style lang="css" scoped>
.candle-chart-container {
  /* TODO: Rough estimate - still to fix correctly
   Applies to all "calc" usages in this file. */
  height: calc(100vh - 250px) !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.fadeleft-enter-active,
.fadeleft-leave-active {
  transition: all 0.2s;
}

.fadeleft-enter-from,
.fadeleft-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
