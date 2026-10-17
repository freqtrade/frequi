<script setup lang="ts">
import { MarginMode, TradingMode } from '@/types';
import type {
  ExchangeSelection,
  Markets,
  MarketsPayload,
  PairHistoryPayload,
  StrategyParameterValue,
  StrategyResult,
} from '@/types';

const botStore = useBotStore();
const chartStore = useChartConfigStore();
const selectedStrategyDetails = ref<StrategyResult>();

const finalTimeframe = computed<string>(() => {
  return botStore.activeBot.isWebserverMode
    ? chartStore.selectedTimeframe ||
        selectedStrategyDetails.value?.timeframe ||
        botStore.activeBot.strategy?.timeframe ||
        ''
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
const strategyParams = ref<Record<string, StrategyParameterValue>>({});
const strategyParamsModified = computed(() =>
  hasModifiedStrategyParams(selectedStrategyDetails.value, strategyParams.value),
);

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

    const strategyParamsPayload = buildStrategyParamsPayload(
      selectedStrategyDetails.value,
      strategyParams.value,
    );
    if (strategyParamsPayload) {
      payload.strategy_params = strategyParamsPayload;
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
  <div class="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
    <div v-if="botStore.activeBot.isWebserverMode" class="md:mx-3 mt-2 px-1">
      <BaseCollapsible size="md" open title="Chart Settings" :unmount-on-hide="false">
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
            <StrategySelect
              v-model="chartStore.strategy"
              v-model:details="selectedStrategyDetails"
              class=""
            />
          </UFormField>

          <UFormField
            v-if="
              botStore.activeBot.botFeatures.strategyParametersModify && selectedStrategyDetails
            "
            label="Strategy params"
            class="col-span-3 md:col-span-3"
          >
            <BaseCollapsible
              v-if="selectedStrategyDetails?.params.length > 0"
              size="md"
              :unmount-on-hide="false"
            >
              <template #title>
                Open to modify strategy parameters
                <span v-if="strategyParamsModified" class="text-warning"> (modified) </span>
              </template>
              <p class="flex items-center gap-1 mx-3 mt-2 text-sm text-muted">
                <UIcon name="i-mdi-information-outline" />
                Explicitly reload the chart after changing parameters.
              </p>
              <StrategyParameters
                :strategy="selectedStrategyDetails"
                class="m-3 overflow-y-auto max-h-96 pr-1"
                editable
                v-model:parameters="strategyParams"
              />
            </BaseCollapsible>
            <span v-else class="text-md font-bold">No strategy parameters available</span>
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
