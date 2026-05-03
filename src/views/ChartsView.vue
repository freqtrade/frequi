<script setup lang="ts">
import { MarginMode, TradingMode } from '@/types';
import type { ExchangeSelection, Markets, MarketsPayload, PairHistoryPayload } from '@/types';

const botStore = useBotStore();
const chartStore = useChartConfigStore();

const finalTimeframe = computed<string>(() => {
  const strategyTimeframe =
    botStore.activeBot.strategy?.timeframe || botStore.activeBot.timeframe || '1m';
  return botStore.activeBot.isWebserverMode
    ? chartStore.selectedTimeframe || strategyTimeframe
    : botStore.activeBot.timeframe || '1m';
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
      margin_mode: MarginMode.ISOLATED,
      trading_mode: TradingMode.FUTURES,
    },
  },
});

const markets = ref<Markets | null>(null);
const chartHeightStorageKey = 'ftGraphChartHeight';
const chartHeight = ref(760);
const chartResizeStart = ref<{ y: number; height: number } | null>(null);

function clampChartHeight(height: number) {
  return Math.min(1400, Math.max(360, Math.round(height)));
}

function saveChartHeight() {
  localStorage.setItem(chartHeightStorageKey, String(chartHeight.value));
}

function startChartResize(event: PointerEvent) {
  chartResizeStart.value = {
    y: event.clientY,
    height: chartHeight.value,
  };
  window.addEventListener('pointermove', resizeChart);
  window.addEventListener('pointerup', stopChartResize, { once: true });
}

function resizeChart(event: PointerEvent) {
  if (!chartResizeStart.value) return;

  chartHeight.value = clampChartHeight(
    chartResizeStart.value.height + event.clientY - chartResizeStart.value.y,
  );
}

function stopChartResize() {
  if (!chartResizeStart.value) return;

  chartResizeStart.value = null;
  window.removeEventListener('pointermove', resizeChart);
  saveChartHeight();
}

onMounted(() => {
  const storedChartHeight = Number(localStorage.getItem(chartHeightStorageKey));
  if (Number.isFinite(storedChartHeight) && storedChartHeight > 0) {
    chartHeight.value = clampChartHeight(storedChartHeight);
  }
});

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
            <TimeframeSelect
              v-model="chartStore.selectedTimeframe"
              include-seconds
              max-timeframe="1h"
              class="mt-1"
            />
          </div>
          <TimeRangeSelect
            v-model="chartStore.timerange"
            class="col-span-3 md:col-span-2"
          ></TimeRangeSelect>
        </div>
      </Panel>
    </div>

    <div
      class="chart-page-resizable md:mx-2 mt-2 pb-1"
      :style="{ height: `${chartHeight}px` }"
    >
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
      <button
        class="chart-height-handle"
        type="button"
        title="Drag to resize chart height"
        @pointerdown.prevent="startChartResize"
      >
        <span></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.chart-page-resizable {
  position: relative;
  min-height: 360px;
  max-height: 1400px;
}

.chart-height-handle {
  position: absolute;
  left: 50%;
  bottom: 5px;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 14px;
  border: 1px solid var(--p-surface-700);
  border-radius: 3px;
  background: color-mix(in srgb, var(--p-surface-900) 92%, transparent);
  cursor: ns-resize;
  transform: translateX(-50%);
}

.chart-height-handle span,
.chart-height-handle span::before,
.chart-height-handle span::after {
  display: block;
  width: 28px;
  height: 1px;
  background: var(--p-surface-400);
  content: '';
}

.chart-height-handle span::before {
  transform: translateY(-4px);
}

.chart-height-handle span::after {
  transform: translateY(3px);
}
</style>
