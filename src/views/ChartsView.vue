<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { MarginMode, TradingMode } from '@/types';
import type { ExchangeSelection, Markets, MarketsPayload, PairHistoryPayload } from '@/types';

const botStore = useBotStore();
const strategy = ref('');
const timerange = ref('');
const selectedTimeframe = ref('1h');

const finalTimeframe = computed<string>(() => {
  return botStore.activeBot.isWebserverMode
    ? selectedTimeframe.value || botStore.activeBot.strategy.timeframe || ''
    : botStore.activeBot.timeframe;
});

const availablePairs = computed<string[]>(() => {
  if (botStore.activeBot.isWebserverMode) {
    if (useLiveData.value) {
      return Object.keys(markets.value?.markets || {}).sort() || [];
    }
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
      const payload: PairHistoryPayload = {
        pair: pair,
        timeframe: finalTimeframe.value,
        timerange: timerange.value,
        strategy: strategy.value,
        // freqaimodel: freqaiModel.value,
        columns: columns,
        live_mode: useLiveData.value,
      };
      if (exchange.value.customExchange) {
        payload.exchange = exchange.value.selectedExchange.exchange;
        payload.trading_mode = exchange.value.selectedExchange.trade_mode.trading_mode;
        payload.margin_mode = exchange.value.selectedExchange.trade_mode.margin_mode;
      }
      botStore.activeBot.getPairHistory(payload);
    } else {
      botStore.activeBot.getPairCandles({
        pair: pair,
        timeframe: finalTimeframe.value,
        columns: columns,
      });
    }
  }
}
const exchange = ref<{
  customExchange: boolean;
  selectedExchange: ExchangeSelection;
}>({
  customExchange: false,
  selectedExchange: {
    exchange: botStore.activeBot.botState.exchange,
    trade_mode: {
      margin_mode: MarginMode.NONE,
      trading_mode: TradingMode.SPOT,
    },
  },
});

const useLiveData = ref(true);
const markets = ref<Markets | null>(null);
watch(
  useLiveData,
  async () => {
    if (botStore.activeBot.isWebserverMode && useLiveData.value) {
      const payload: MarketsPayload = {};
      if (exchange.value.customExchange) {
        payload.exchange = exchange.value.selectedExchange.exchange;
        payload.trading_mode = exchange.value.selectedExchange.trade_mode.trading_mode;
        payload.margin_mode = exchange.value.selectedExchange.trade_mode.margin_mode;
      }

      markets.value = await botStore.activeBot.getMarkets(payload);
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <div class="d-flex flex-column h-100">
    <!-- <div v-if="isWebserverMode" class="me-auto ms-3"> -->
    <!-- Currently only available in Webserver mode -->
    <!-- <b-form-checkbox v-model="historicView">HistoricData</b-form-checkbox> -->
    <!-- </div> -->
    <div v-if="botStore.activeBot.isWebserverMode" class="mx-md-3 mt-2">
      <div class="d-flex flex-column flex-md-row-reverse border rounded-1 p-1">
        <BButton v-b-toggle.ws-settings class="ms-auto align-self-start col-12 col-md-2"
          >Show/hide setup</BButton
        >
        <BCollapse id="ws-settings" visible class="w-100">
          <div
            v-if="botStore.activeBot.botState.api_version >= 2.42"
            class="mb-2 border rounded-1 p-2 text-start col-12 col-md-6"
          >
            <BFormCheckbox v-model="exchange.customExchange" v-b-toggle.custom-exchange>
              Custom Exchange
            </BFormCheckbox>
            <BCollapse id="custom-exchange">
              <ExchangeSelect v-model="exchange.selectedExchange" />
            </BCollapse>
          </div>
          <div class="d-flex flex-wrap mx-1 gap-1 gap-md-2">
            <div class="col-12 col-md-3 text-start me-md-1">
              <span>Strategy</span>
              <StrategySelect v-model="strategy" class="mt-1 mb-1"></StrategySelect>
              <BFormCheckbox
                v-if="botStore.activeBot.botState.api_version >= 2.42"
                v-model="useLiveData"
                class="align-self-center"
                title="Use live data from the exchange. Only use if you don't have data downloaded locally."
              >
                Use Live Data
              </BFormCheckbox>
            </div>
            <div class="col-12 col-md-3 text-start">
              <span>Timeframe</span>
              <TimeframeSelect v-model="selectedTimeframe" class="mt-1" />
            </div>
            <TimeRangeSelect v-model="timerange"></TimeRangeSelect>
          </div>
        </BCollapse>
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
