<script setup lang="ts">
import { DownloadDataPayload, ExchangeSelection, MarginMode, TradingMode } from '@/types';

const botStore = useBotStore();
const pairs = ref<string[]>(['XRP/USDT', 'BTC/USDT']);
const timeframes = ref<string[]>(['5m', '1h']);

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
    timerange: '20240101-',
  };

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
  <div class="container">
    <BackgroundJobTracking class="mb-4" />
    <BCard header="Downloading Data">
      <div class="d-flex px-3 mb-3 gap-3 flex-column flex-lg-column">
        <div class="d-flex flex-row gap-5">
          <div class="d-flex flex-fill align-items-end gap-2">
            <div class="d-flex flex-column flex-shrink">
              <h4 class="text-start">Select Pairs</h4>
              <BaseStringList v-model="pairs" placeholder="Pair" size="md" />
            </div>

            <div class="d-flex flex-column gap-1">
              <h6>Pairs from template</h6>
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
          <div class="d-flex flex-fill align-items-end gap-2">
            <div class="d-flex flex-column flex-shrink">
              <h4 class="text-start">Select timeframes</h4>
              <BaseStringList v-model="timeframes" placeholder="Timeframe" size="md" />
            </div>
          </div>
        </div>

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

        <BButton variant="primary" @click="startDownload">Start Download</BButton>
      </div>
    </BCard>
  </div>
</template>
