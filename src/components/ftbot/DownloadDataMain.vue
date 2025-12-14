<script setup lang="ts">
import type { DownloadDataPayload, ExchangeSelection } from '@/types';
import { MarginMode, TradingMode } from '@/types';

const botStore = useBotStore();
const pairlistStore = usePairlistConfigStore();
const pairs = ref<string[]>(['BTC/USDT', 'ETH/USDT', '']);
const timeframes = ref<string[]>(['5m', '1h']);

const timeSelection = ref({
  useCustomTimerange: false,
  timerange: '',
  days: 30,
});

const { pairTemplates } = usePairTemplates();

const exchange = ref<{
  customExchange: boolean;
  selectedExchange: ExchangeSelection;
}>({
  customExchange: false,
  selectedExchange: {
    exchange: 'binance',
    trade_mode: {
      margin_mode: MarginMode.NONE,
      trading_mode: TradingMode.SPOT,
    },
  },
});

const erase = ref(false);
const downloadTrades = ref(false);

// State to track the collapse status
const isAdvancedOpen = ref(false);
const candleType = ref<string[]>([]);
const candleTypes = [
  { text: 'Spot', value: 'spot' },
  { text: 'Futures', value: 'futures' },
  { text: 'Funding Rate', value: 'funding_rate' },
  { text: 'Mark', value: 'mark' },
  { text: 'Index', value: 'index' },
  { text: 'Premium Index', value: 'premiumIndex' },
];

function addPairs(_pairs: string[]) {
  pairs.value.push(..._pairs);
}

function replacePairs(_pairs: string[]) {
  pairs.value = [..._pairs];
}

async function startDownload() {
  const payload: DownloadDataPayload = {
    pairs: pairs.value.filter((pair) => pair !== ''),
    timeframes: timeframes.value.filter((tf) => tf !== ''),
  };

  // Add either timerange or days to the payload
  if (timeSelection.value.useCustomTimerange && timeSelection.value.timerange) {
    payload.timerange = timeSelection.value.timerange;
  } else {
    payload.days = timeSelection.value.days;
  }

  // Include advanced options only if the section is open
  if (isAdvancedOpen.value) {
    payload.erase = erase.value;
    payload.download_trades = downloadTrades.value;

    if (exchange.value.customExchange) {
      payload.exchange = exchange.value.selectedExchange.exchange;
      payload.trading_mode = exchange.value.selectedExchange.trade_mode.trading_mode;
      payload.margin_mode = exchange.value.selectedExchange.trade_mode.margin_mode;
    }
    if (botStore.activeBot.botFeatures.downloadDataCandleTypes && candleType.value.length > 0) {
      payload.candle_types = candleType.value;
    }
  }

  await botStore.activeBot.startDataDownload(payload);
}
</script>

<template>
  <div class="px-1 mx-auto w-full max-w-4xl lg:max-w-7xl">
    <BackgroundJobTracking class="mb-4" />
    <DraggableContainer header="Downloading Data" class="mx-1 p-4">
      <div class="flex mb-3 gap-3 flex-col">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col lg:flex-row gap-3">
            <!-- Pairs section - keeping template buttons next to input -->
            <div class="flex-fill">
              <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                  <h4 class="text-start font-bold text-lg">Select Pairs</h4>
                  <h5 class="text-start font-bold text-lg">Pairs from template</h5>
                </div>
                <div class="flex gap-2">
                  <BaseStringList v-model="pairs" placeholder="Pair" size="small" class="grow" />
                  <div class="flex flex-col gap-1">
                    <div class="flex flex-col gap-1">
                      <Button
                        v-for="pt in pairTemplates"
                        :key="pt.idx"
                        severity="secondary"
                        :title="pt.pairs.reduce((acc, p) => `${acc}${p}\n`, '')"
                        @click="addPairs(pt.pairs)"
                      >
                        {{ pt.description }}
                      </Button>
                    </div>
                    <Divider />
                    <Button
                      :disabled="pairlistStore.whitelist.length === 0"
                      title="Add all pairs from Pairlist Config - requires the pairlist config to have ran first."
                      severity="secondary"
                      @click="replacePairs(pairlistStore.whitelist)"
                    >
                      Use Pairs from Pairlist Config
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timeframes section -->
            <div class="flex-fill px-3">
              <div class="flex flex-col gap-2">
                <h4 class="text-start font-bold text-lg">Select timeframes</h4>
                <BaseStringList v-model="timeframes" placeholder="Timeframe" />
              </div>
            </div>
          </div>

          <!-- Time selection section -->
          <div class="px-3 border dark:border-surface-700 border-surface-300 p-2 rounded-sm">
            <div class="flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <h4 class="text-start mb-0 font-bold text-lg">Time Selection</h4>
                <BaseCheckbox v-model="timeSelection.useCustomTimerange" class="mb-0" switch>
                  Use custom timerange
                </BaseCheckbox>
              </div>

              <div v-if="timeSelection.useCustomTimerange">
                <TimeRangeSelect v-model="timeSelection.timerange" />
              </div>
              <div v-else class="flex items-center gap-2">
                <label>Days to download:</label>
                <InputNumber
                  v-model="timeSelection.days"
                  type="number"
                  aria-label="Days to download"
                  :min="1"
                  :step="1"
                  size="small"
                />
              </div>
            </div>
          </div>

          <!-- Advanced options section -->
          <div
            class="mb-2 border dark:border-surface-700 border-surface-300 rounded-sm p-2 text-start"
          >
            <Button class="mb-2" severity="secondary" @click="isAdvancedOpen = !isAdvancedOpen">
              Advanced Options
              <i-mdi-chevron-down v-if="!isAdvancedOpen" />
              <i-mdi-chevron-up v-else />
            </Button>
            <Transition>
              <div v-show="isAdvancedOpen">
                <Message severity="info" class="mb-2 py-2">
                  Advanced options (Erase data, Download trades, and Custom Exchange settings) will
                  only be applied when this section is expanded.
                </Message>
                <div
                  class="mb-2 border dark:border-surface-700 border-surface-300 rounded-md p-2 text-start"
                >
                  <BaseCheckbox v-model="erase" class="mb-2">Erase existing data</BaseCheckbox>
                  <BaseCheckbox v-model="downloadTrades" class="mb-2">
                    Download Trades instead of OHLCV data
                  </BaseCheckbox>
                  <div class="grid grid-cols md:grid-cols-2 items-center gap-2">
                    <MultiSelect
                      v-if="botStore.activeBot.botFeatures.downloadDataCandleTypes"
                      v-model="candleType"
                      :options="candleTypes"
                      option-label="text"
                      option-value="value"
                      placeholder="Select Candle Types"
                    />
                    <small
                      >When no candle-type is selected, freqtrade will download the necessary candle
                      types for regular operation automatically.</small
                    >
                  </div>
                </div>
                <div
                  class="mb-2 border dark:border-surface-700 border-surface-300 rounded-md p-2 text-start"
                >
                  <BaseCheckbox v-model="exchange.customExchange" class="mb-2">
                    Custom Exchange
                  </BaseCheckbox>
                  <Transition name="fade">
                    <ExchangeSelect
                      v-show="exchange.customExchange"
                      v-model="exchange.selectedExchange"
                    />
                  </Transition>
                </div>
              </div>
            </Transition>
          </div>

          <div class="px-3">
            <Button severity="primary" @click="startDownload">Start Download</Button>
          </div>
        </div>
      </div>
    </DraggableContainer>
  </div>
</template>
