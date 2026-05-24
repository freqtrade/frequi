<script setup lang="ts">
import { MarginMode, TradingMode } from '@/types';
import type {
  ExchangeSelection,
  Markets,
  MarketsPayload,
  PairHistoryPayload,
  StrategyParameterValue,
} from '@/types';

const botStore = useBotStore();
const chartStore = useChartConfigStore();

const finalTimeframe = computed<string>(() => {
  return botStore.activeBot.isWebserverMode
    ? chartStore.selectedTimeframe || botStore.activeBot.strategy?.timeframe || ''
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
const modifiedParams = ref<Record<string, StrategyParameterValue>>({});
</script>

<template>
  <div class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
    <div v-if="botStore.activeBot.isWebserverMode" class="md:mx-3 mt-2 px-1">
      <BaseCollapsible size="md" open title="Chart Settings">
        <template #title>
          <span class="text-lg font-bold">Chart Settings</span>
          <InfoBox
            hint="These settings only apply to the chart view and do not affect the bot's actual configuration or behavior."
          />
        </template>
        <div class="grid grid-cols-3 md:grid-cols-5 gap-2 m-2">
          <UFormField label="Exchange" class="col-span-2">
            <div
              class="mb-2 border dark:border-neutral-700 border-neutral-300 rounded-md p-1 text-start col-span-2"
            >
              <UCollapsible v-model:open="exchange.customExchange">
                <div class="flex flex-row gap-5 items-center">
                  <BaseCheckbox v-model="exchange.customExchange">Custom Exchange</BaseCheckbox>
                  <span
                    v-show="!exchange.customExchange"
                    class="text-sm"
                    title="Current exchange from the configuration"
                  >
                    Current Exchange:
                    <span class="font-bold">
                      {{ botStore.activeBot.botState.exchange }}
                      {{ botStore.activeBot.botState.trading_mode }}
                    </span>
                  </span>
                </div>
                <template #content>
                  <ExchangeSelect v-model="exchange.selectedExchange" class="mt-2" />
                </template>
              </UCollapsible>
            </div>
            <BaseCheckbox
              v-if="botStore.activeBot.botFeatures.chartLiveData"
              v-model="chartStore.useLiveData"
              class="align-self-center"
              title="Use live data from the exchange. Only use if you don't have data downloaded locally."
            >
              Use Live Data
            </BaseCheckbox>
          </UFormField>
          <div class="flex flex-col text-start">
            <UFormField label="Timeframe">
              <TimeframeSelect v-model="chartStore.selectedTimeframe" class="w-full" />
            </UFormField>
          </div>
          <TimeRangeSelect
            v-model="chartStore.timerange"
            :can-use-time="botStore.activeBot.botFeatures.timerangeWithTime"
            class="col-span-3 md:col-span-2"
          ></TimeRangeSelect>
          <UFormField label="Strategy" class="col-span-3 md:col-span-2">
            <StrategySelect v-model="chartStore.strategy" class="" />
          </UFormField>

          <UFormField
            label="Strategy params"
            class="col-span-3 md:col-span-3"
            v-if="
              botStore.activeBot.botFeatures.strategyParametersModify && botStore.activeBot.strategy
            "
          >
            <BaseCollapsible title="Strategy parameters" size="md">
              <StrategyParameters
                :strategy="botStore.activeBot.strategy"
                class="m-3"
                editable
                v-model:parameters="modifiedParams"
              />
            </BaseCollapsible>
          </UFormField>
        </div>
      </BaseCollapsible>
    </div>

    <div class="md:mx-2 mt-2 flex-1 min-h-0 min-w-0 pb-1 overflow-hidden">
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
