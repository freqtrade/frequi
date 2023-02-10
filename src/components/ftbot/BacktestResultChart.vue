<template>
  <div>
    <div class="row">
      <div class="col-md-11 text-start">
        <p>
          Graph will always show the latest values for the selected strategy. Timerange:
          {{ timerange }} - {{ strategy }}
        </p>
      </div>
      <div class="col-md-1 text-end">
        <b-button
          aria-label="Close"
          title="Trade Navigation"
          size="sm"
          @click="showRightBar = !showRightBar"
          >{{ showRightBar ? '&gt;' : '&lt;' }}
        </b-button>
      </div>
    </div>
    <div class="row text-center h-100 d-flex align-items-stretch">
      <PairSummary
        class="col-md-2 overflow-auto"
        style="max-height: calc(100vh - 200px)"
        :pairlist="pairlist"
        :trades="trades"
        sort-method="profit"
        :backtest-mode="true"
      />
      <CandleChartContainer
        :available-pairs="pairlist"
        :historic-view="!!true"
        :timeframe="timeframe"
        :timerange="timerange"
        :strategy="strategy"
        :trades="trades"
        :class="`${
          showRightBar ? 'col-md-8' : 'col-md-10'
        } candle-chart-container px-0 h-100 align-self-stretch`"
        :slider-position="sliderPosition"
      >
      </CandleChartContainer>
      <TradeListNav
        v-if="showRightBar"
        class="overflow-auto col-md-2"
        style="max-height: calc(100vh - 200px)"
        :trades="trades.filter((t) => t.pair === botStore.activeBot.selectedPair)"
        @trade-select="navigateChartToTrade"
      />
    </div>
    <b-card header="Single trades" class="row mt-2 w-100">
      <TradeList class="row trade-history mt-2 w-100" :trades="trades" :show-filter="true" />
    </b-card>
  </div>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import TradeList from '@/components/ftbot/TradeList.vue';
import TradeListNav from '@/components/ftbot/TradeListNav.vue';
import PairSummary from '@/components/ftbot/PairSummary.vue';
import CandleChartContainer from '@/components/charts/CandleChartContainer.vue';
import { ref } from 'vue';
import { ChartSliderPosition, Trade } from '@/types';

defineProps({
  timeframe: { required: true, type: String },
  strategy: { required: true, type: String },
  timerange: { required: true, type: String },
  pairlist: { required: true, type: Array as () => string[] },
  trades: { required: true, type: Array as () => Trade[] },
});
const botStore = useBotStore();
const showRightBar = ref(true);
const sliderPosition = ref<ChartSliderPosition>();

const navigateChartToTrade = (trade: Trade) => {
  sliderPosition.value = {
    startValue: trade.open_timestamp,
    endValue: trade.close_timestamp,
  };
};
</script>

<style lang="scss" scoped>
.candle-chart-container {
  // TODO: Rough estimate - still to fix correctly
  // Applies to all "calc" usages in this file.
  height: calc(100vh - 250px) !important;
}
</style>
