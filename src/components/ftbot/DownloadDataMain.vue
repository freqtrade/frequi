<script setup lang="ts">
import { DownloadDataPayload, ExchangeSelection, MarginMode, TradingMode } from '@/types';

const botStore = useBotStore();
const pairs = ref<string[]>(['XRP/USDT', 'BTC/USDT']);
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

function addPairs(_pairs: string[]) {
  pairs.value.push(..._pairs);
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
  }

  console.log(payload);
  await botStore.activeBot.startDataDownload(payload);
}
</script>

<template>
  <div class="container-md px-1">
    <BackgroundJobTracking class="mb-4" />
    <BCard header="Downloading Data" class="px-0 mx-1">
      <div class="d-flex mb-3 gap-3 flex-column">
        <div class="d-flex flex-column gap-3">
          <div class="d-flex flex-column flex-lg-row gap-3">
            <!-- Pairs section - keeping template buttons next to input -->
            <div class="flex-fill">
              <div class="d-flex flex-column gap-2">
                <div class="d-flex justify-content-between">
                  <h4 class="text-start">Select Pairs</h4>
                  <h5 class="text-start">Pairs from template</h5>
                </div>
                <div class="d-flex gap-2">
                  <BaseStringList
                    v-model="pairs"
                    placeholder="Pair"
                    size="md"
                    class="flex-grow-1"
                  />
                  <div class="d-flex flex-column gap-1">
                    <div class="d-flex flex-column gap-1">
                      <BButton
                        v-for="pt in pairTemplates"
                        :key="pt.idx"
                        variant="secondary"
                        :title="pt.pairs"
                        @click="addPairs(pt.pairs)"
                      >
                        {{ pt.description }}
                      </BButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timeframes section -->
            <div class="flex-fill px-3">
              <div class="d-flex flex-column gap-2">
                <h4 class="text-start">Select timeframes</h4>
                <BaseStringList v-model="timeframes" placeholder="Timeframe" size="md" />
              </div>
            </div>
          </div>

          <!-- Time selection section -->
          <div class="px-3 border border p-2 rounded-1">
            <div class="d-flex flex-column gap-2">
              <div class="d-flex justify-content-between align-items-center">
                <h4 class="text-start mb-0">Time Selection</h4>
                <BFormCheckbox v-model="timeSelection.useCustomTimerange" class="mb-0" switch>
                  Use custom timerange
                </BFormCheckbox>
              </div>

              <div v-if="timeSelection.useCustomTimerange">
                <TimeRangeSelect v-model="timeSelection.timerange" />
              </div>
              <div v-else class="d-flex align-items-center gap-2">
                <label>Days to download:</label>
                <BFormInput
                  v-model.number="timeSelection.days"
                  type="number"
                  min="1"
                  max="500"
                  style="width: 100px"
                />
              </div>
            </div>
          </div>

          <!-- Advanced options section -->
          <div class="mb-2 border rounded-1 p-2 text-start">
            <BButton
              v-b-toggle.advanced-options
              class="mb-2"
              @click="isAdvancedOpen = !isAdvancedOpen"
            >
              Advanced Options
              <i-mdi-chevron-down v-if="!isAdvancedOpen" />
              <i-mdi-chevron-up v-else />
            </BButton>
            <BCollapse id="advanced-options">
              <BAlert variant="info" :model-value="true" class="mb-2">
                Advanced options (Erase data, Download trades, and Custom Exchange settings) will
                only be applied when this section is expanded.
              </BAlert>
              <div class="mb-2 border rounded-1 p-2 text-start">
                <BFormCheckbox v-model="erase" class="mb-2">Erase existing data</BFormCheckbox>
                <BFormCheckbox v-model="downloadTrades" class="mb-2">
                  Download Trades instead of OHLCV data
                </BFormCheckbox>
              </div>
              <div class="mb-2 border rounded-1 p-2 text-start">
                <BFormCheckbox
                  v-model="exchange.customExchange"
                  v-b-toggle.custom-exchange
                  class="mb-2"
                >
                  Custom Exchange
                </BFormCheckbox>
                <BCollapse id="custom-exchange">
                  <ExchangeSelect v-model="exchange.selectedExchange" />
                </BCollapse>
              </div>
            </BCollapse>
          </div>

          <div class="px-3">
            <BButton variant="primary" @click="startDownload">Start Download</BButton>
          </div>
        </div>
      </div>
    </BCard>
  </div>
</template>
