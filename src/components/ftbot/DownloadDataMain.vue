<script setup lang="ts">
import { DownloadDataPayload } from '@/types';

const botStore = useBotStore();
const pairs = ref<string[]>(['XRP/USDT', 'BTC/USDT']);
const timeframes = ref<string[]>(['5m', '1h']);

const { pairTemplates } = usePairTemplates();

const exchange = ref({
  customExchange: false,
  selectedExchange: {
    exchange: 'binance',
    trade_mode: {
      margin_mode: '',
      trading_mode: 'spot',
    },
  },
});

function addPair() {
  pairs.value.push('');
}

function addPairs(_pairs: string[]) {
  pairs.value.push(..._pairs);
}
function addTimeframe() {
  timeframes.value.push('');
}

async function startDownload() {
  const payload: DownloadDataPayload = {
    pairs: pairs.value.filter((pair) => pair !== ''),
    timeframes: timeframes.value.filter((tf) => tf !== ''),
    timerange: '20240101-',
  };
  if (exchange.value.customExchange) {
    console.log('setting custom exchange props');
    payload.exchange = exchange.value.selectedExchange.exchange;
    payload.trading_mode = exchange.value.selectedExchange.trade_mode.trading_mode;
    payload.margin_mode = exchange.value.selectedExchange.trade_mode.margin_mode;
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
          <BFormCheckbox v-model="exchange.customExchange" class="mb-2">
            Custom Exchange
          </BFormCheckbox>
          <ExchangeSelect v-if="exchange.customExchange" v-model="exchange.selectedExchange" />
        </div>
        <BButton variant="primary" @click="startDownload">Start Download</BButton>
      </div>
    </BCard>
  </div>
</template>

<style scoped>
.mb-3 {
  margin-bottom: 1rem;
}
</style>
