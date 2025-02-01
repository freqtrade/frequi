<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';

const botStore = useBotStore();
const strategy = ref('');
const timerange = ref('');
const selectedTimeframe = ref('');

const finalTimeframe = computed<string>(() => {
  return botStore.activeBot.isWebserverMode
    ? selectedTimeframe.value || botStore.activeBot.strategy.timeframe || ''
    : botStore.activeBot.timeframe;
});

const availablePairs = computed<string[]>(() => {
  if (botStore.activeBot.isWebserverMode) {
    if (finalTimeframe.value && finalTimeframe.value !== '') {
      const tf = finalTimeframe.value;
      return botStore.activeBot.pairlistWithTimeframe
        .filter(([_, timeframe]) => {
          // console.log(pair, timeframe, tf);
          return timeframe === tf;
        })
        .map(([pair]) => pair);
    }
    return botStore.activeBot.pairlist;
  }
  return botStore.activeBot.whitelist;
});

onMounted(() => {
  if (botStore.activeBot.isWebserverMode) {
    // Get available pairs for all timeframes
    botStore.activeBot.getAvailablePairs({});
  } else if (!botStore.activeBot.whitelist || botStore.activeBot.whitelist.length === 0) {
    botStore.activeBot.getWhitelist();
  }
});

function refreshOHLCV(pair: string, columns: string[]) {
  if (botStore.activeBot.plotPair && finalTimeframe.value) {
    if (botStore.activeBot.isWebserverMode) {
      botStore.activeBot.getPairHistory({
        pair: pair,
        timeframe: finalTimeframe.value,
        timerange: timerange.value,
        strategy: strategy.value,
        // freqaimodel: freqaiModel.value,
        columns: columns,
      });
    } else {
      botStore.activeBot.getPairCandles({
        pair: pair,
        timeframe: finalTimeframe.value,
        columns: columns,
      });
    }
  }
}
</script>

<template>
  <div class="d-flex flex-column h-100">
    <!-- <div v-if="isWebserverMode" class="me-auto ms-3"> -->
    <!-- Currently only available in Webserver mode -->
    <!-- <b-form-checkbox v-model="historicView">HistoricData</b-form-checkbox> -->
    <!-- </div> -->
    <div v-if="botStore.activeBot.isWebserverMode" class="mx-md-3 mt-2">
      <div class="d-flex flex-wrap mx-1 gap-1 gap-md-2">
        <div class="col-12 col-md-3 text-start me-md-1">
          <span>Strategy</span>
          <StrategySelect v-model="strategy" class="mt-1"></StrategySelect>
        </div>
        <div class="col-12 col-md-3 text-start">
          <span>Timeframe</span>
          <TimeframeSelect v-model="selectedTimeframe" class="mt-1" />
        </div>
        <TimeRangeSelect v-model="timerange"></TimeRangeSelect>
      </div>
    </div>

    <div class="mx-md-2 mt-2 pb-1 h-100">
      <CandleChartContainer
        :available-pairs="availablePairs"
        :historic-view="botStore.activeBot.isWebserverMode"
        :timeframe="finalTimeframe"
        :trades="botStore.activeBot.trades"
        :timerange="botStore.activeBot.isWebserverMode ? timerange : undefined"
        :strategy="botStore.activeBot.isWebserverMode ? strategy : undefined"
        :plot-config-modal="false"
        @refresh-data="refreshOHLCV"
      >
      </CandleChartContainer>
    </div>
  </div>
</template>
