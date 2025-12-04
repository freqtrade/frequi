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
const isBarVisible = ref({ right: true, left: true });
const sliderPosition = ref<ChartSliderPosition>();

function navigateChartToTrade(trade: Trade) {
  sliderPosition.value = {
    startValue: trade.open_timestamp,
    endValue: trade.close_timestamp,
  };
}

function refreshOHLCV(pair: string, columns: string[]) {
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
        <Button
          aria-label="Close"
          title="Pair Navigation"
          severity="secondary"
          variant="outlined"
          size="small"
          @click="isBarVisible.left = !isBarVisible.left"
        >
          <i-mdi-chevron-right v-if="!isBarVisible.left" width="24" height="24" />
          <i-mdi-chevron-left v-if="isBarVisible.left" width="24" height="24" />
        </Button>
      </div>
      <span class="grow">
        Graph will always show the latest values for the selected strategy. <br />
        Timerange: {{ timerange }} - {{ strategy }}
      </span>
      <div class="text-end">
        <Button
          aria-label="Close"
          variant="outlined"
          title="Trade Navigation"
          size="small"
          severity="secondary"
          @click="isBarVisible.right = !isBarVisible.right"
        >
          <i-mdi-chevron-right v-if="isBarVisible.right" width="24" height="24" />
          <i-mdi-chevron-left v-if="!isBarVisible.right" width="24" height="24" />
        </Button>
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
