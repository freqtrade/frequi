<script setup lang="ts">
import type { PairHistoryPayload } from '@/types';

const botStore = useBotStore();
const pairlistStore = usePairlistConfigStore();

const selectedTimeframe = ref<string | null>('1h');
// TimeframeSelect offers "Use strategy default" (null) - there's no strategy here, so use 1h.
const timeframe = computed(() => selectedTimeframe.value || '1h');

// Bumped on every new evaluation result, so the chart remounts and reloads its data
// (the exchange may have changed, and cached candles would be stale).
const evaluationId = ref(0);

watch(
  () => pairlistStore.whitelist,
  (pairs) => {
    evaluationId.value += 1;
    // Don't keep showing a pair (e.g. from the trade view) that isn't part of the result.
    if (!pairs.includes(botStore.activeBot.selectedPair) && pairs[0]) {
      botStore.activeBot.selectedPair = pairs[0];
    }
  },
  { immediate: true },
);

function refreshOHLCV(pair: string, columns: string[]) {
  const payload: PairHistoryPayload = {
    pair,
    timeframe: timeframe.value,
    // Empty timerange + live mode loads the last 30 days from the exchange.
    timerange: '',
    strategy: '',
    columns,
    live_mode: true,
  };
  if (pairlistStore.customExchange) {
    payload.exchange = pairlistStore.selectedExchange.exchange;
    payload.trading_mode = pairlistStore.selectedExchange.trade_mode.trading_mode;
    payload.margin_mode = pairlistStore.selectedExchange.trade_mode.margin_mode;
  }
  botStore.activeBot.getPairHistory(payload);
}
</script>

<template>
  <div class="flex flex-col gap-2 h-[calc(100dvh-60px)] min-h-[32rem]">
    <div class="flex items-center gap-5">
      <span class="text-xl font-bold self-start">Chart</span>
      <UFormField label="Timeframe">
        <TimeframeSelect v-model="selectedTimeframe" class="w-44" />
      </UFormField>
      <span class="text-muted text-sm self-end"
        >Candles are loaded live from the exchange (last 30 days).<br />Filtered to pairs from the
        above pairlist evaluation results.</span
      >
    </div>
    <div class="grow min-h-0">
      <CandleChartContainer
        :key="`${timeframe}-${evaluationId}`"
        :available-pairs="pairlistStore.whitelist"
        :timeframe="timeframe"
        historic-view
        reload-data-on-switch
        @refresh-data="refreshOHLCV"
      />
    </div>
  </div>
</template>
