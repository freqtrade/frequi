<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';

import { ChartSliderPosition, Trade } from '@/types';

defineProps({
  timeframe: { required: true, type: String },
  strategy: { required: true, type: String },
  freqaiModel: { required: false, default: undefined, type: String },
  timerange: { required: true, type: String },
  pairlist: { required: true, type: Array as () => string[] },
  trades: { required: true, type: Array as () => Trade[] },
});
const botStore = useBotStore();
const isBarVisible = ref({ right: true, left: true });
const sliderPosition = ref<ChartSliderPosition>();

const navigateChartToTrade = (trade: Trade) => {
  sliderPosition.value = {
    startValue: trade.open_timestamp,
    endValue: trade.close_timestamp,
  };
};
</script>

<template>
  <div>
    <div class="d-flex flex-row mb-1 align-items-center">
      <div class="me-2">
        <BButton
          aria-label="Close"
          title="Pair Navigation"
          variant="outline-secondary"
          size="sm"
          @click="isBarVisible.left = !isBarVisible.left"
        >
          <i-mdi-chevron-right v-if="!isBarVisible.left" width="24" height="24" />
          <i-mdi-chevron-left v-if="isBarVisible.left" width="24" height="24" />
        </BButton>
      </div>
      <span class="flex-fill">
        Graph will always show the latest values for the selected strategy. <br />
        Timerange: {{ timerange }} - {{ strategy }}
      </span>
      <div class="col-md-1 text-end">
        <BButton
          aria-label="Close"
          variant="outline-secondary"
          title="Trade Navigation"
          size="sm"
          @click="isBarVisible.right = !isBarVisible.right"
        >
          <i-mdi-chevron-right v-if="isBarVisible.right" width="24" height="24" />
          <i-mdi-chevron-left v-if="!isBarVisible.right" width="24" height="24" />
        </BButton>
      </div>
    </div>
    <div class="text-center d-flex flex-row h-100 align-items-stretch">
      <Transition name="fadeleft">
        <PairSummary
          v-if="isBarVisible.left"
          class="col-md-2 overflow-y-auto overflow-x-hidden"
          style="max-height: calc(100vh - 200px)"
          :pairlist="pairlist"
          :trades="trades"
          sort-method="profit"
          :backtest-mode="true"
        />
      </Transition>
      <CandleChartContainer
        :available-pairs="pairlist"
        :historic-view="!!true"
        :timeframe="timeframe"
        :timerange="timerange"
        :strategy="strategy"
        :trades="trades"
        class="flex-shrink-1 candle-chart-container w-100 px-0 h-100 align-self-stretch"
        :slider-position="sliderPosition"
        :freqai-model="freqaiModel"
      >
      </CandleChartContainer>
      <Transition name="fade">
        <TradeListNav
          v-if="isBarVisible.right"
          class="overflow-y-auto col-md-2 overflow-x-visible"
          style="max-height: calc(100vh - 200px)"
          :trades="trades.filter((t) => t.pair === botStore.activeBot.selectedPair)"
          @trade-select="navigateChartToTrade"
        />
      </Transition>
    </div>
    <BCard header="Single trades" class="row mt-2 w-100">
      <TradeList class="row trade-history mt-2 w-100" :trades="trades" :show-filter="true" />
    </BCard>
  </div>
</template>

<style lang="scss" scoped>
.candle-chart-container {
  // TODO: Rough estimate - still to fix correctly
  // Applies to all "calc" usages in this file.
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
