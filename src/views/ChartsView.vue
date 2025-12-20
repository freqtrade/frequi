<script setup lang="ts">
import { MarginMode, TradingMode } from '@/types';
import type { ExchangeSelection, Markets, MarketsPayload, PairHistoryPayload } from '@/types';

const botStore = useBotStore();
const chartStore = useChartConfigStore();

const finalTimeframe = computed<string>(() => {
  return botStore.activeBot.isWebserverMode
    ? chartStore.selectedTimeframe || botStore.activeBot.strategy.timeframe || ''
    : botStore.activeBot.timeframe;
});

const availablePairs = computed<string[]>(() => {
  if (botStore.activeBot.isWebserverMode) {
    if (chartStore.useLiveData) {
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
  console.log('Refreshing OHLCV for pair:', pair, finalTimeframe.value, 'with columns:', columns);
  if (botStore.activeBot.isWebserverMode && finalTimeframe.value) {
    const payload: PairHistoryPayload = {
      pair: pair,
      timeframe: finalTimeframe.value,
      timerange: chartStore.timerange,
      strategy: chartStore.strategy,
      // freqaimodel: freqaiModel.value,
      columns: columns,
      live_mode: chartStore.useLiveData,
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

const markets = ref<Markets | null>(null);
watch(
  () => chartStore.useLiveData,
  async () => {
    if (botStore.activeBot.isWebserverMode && chartStore.useLiveData) {
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
  <div class="flex flex-col h-full">
    <!-- <div v-if="isWebserverMode" class="me-auto ms-3"> -->
    <!-- Currently only available in Webserver mode -->
    <!-- <b-form-checkbox v-model="historicView">HistoricData</b-form-checkbox> -->
    <!-- </div> -->
    <div v-if="botStore.activeBot.isWebserverMode" class="md:mx-3 mt-2 px-1">
      <Panel header="Settings" toggleable>
        <div
          class="mb-2 border dark:border-surface-700 border-surface-300 rounded-md p-2 text-start"
        >
          <div class="flex flex-row gap-5">
            <BaseCheckbox v-model="exchange.customExchange" class="mb-2">
              Custom Exchange
            </BaseCheckbox>
            <span v-show="!exchange.customExchange">
              Current Exchange:
              {{ botStore.activeBot.botState.exchange }}
              {{ botStore.activeBot.botState.trading_mode }}
            </span>
          </div>
          <Transition name="fade">
            <ExchangeSelect v-show="exchange.customExchange" v-model="exchange.selectedExchange" />
          </Transition>
        </div>
        <div class="grid grid-cols-3 md:grid-cols-5 mx-1 gap-1 md:gap-2">
          <div class="text-start md:me-1 col-span-2">
            <span>Strategy</span>
            <StrategySelect v-model="chartStore.strategy" class="mt-1 mb-1"></StrategySelect>
            <BaseCheckbox
              v-if="botStore.activeBot.botFeatures.chartLiveData"
              v-model="chartStore.useLiveData"
              class="align-self-center"
              title="Use live data from the exchange. Only use if you don't have data downloaded locally."
            >
              Use Live Data
            </BaseCheckbox>
          </div>
          <div class="flex flex-col text-start">
            <span>Timeframe</span>
            <TimeframeSelect v-model="chartStore.selectedTimeframe" class="mt-1" />
          </div>
          <TimeRangeSelect
            v-model="chartStore.timerange"
            class="col-span-3 md:col-span-2"
          ></TimeRangeSelect>
        </div>
      </Panel>
    </div>

    <div class="md:mx-2 mt-2 pb-1 h-full">
      <CandleChartContainer
        :available-pairs="availablePairs"
        :historic-view="botStore.activeBot.isWebserverMode"
        :timeframe="finalTimeframe"
        :trades="botStore.activeBot.allTrades"
        :timerange="botStore.activeBot.isWebserverMode ? chartStore.timerange : undefined"
        :strategy="botStore.activeBot.isWebserverMode ? chartStore.strategy : undefined"
        @refresh-data="refreshOHLCV"
      >
      </CandleChartContainer>
    </div>
  </div>
</template>
