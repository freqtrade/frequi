<script setup lang="ts">
import { DownloadDataPayload } from '@/types';

const botStore = useBotStore();
const pairs = ref<string[]>(['XRP/USDT', 'BTC/USDT']);
const timeframes = ref<string[]>(['5m', '1h']);

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
  <div class="d-flex px-3 mb-3 gap-3 flex-column flex-lg-column">
    <h2>Download Data</h2>
    <div class="d-flex flex-row gap-5">
      <div class="d-flex flex-fill align-items-end gap-2">
        <div class="d-flex flex-column flex-shrink">
          <h4 class="text-start">Select Pairs</h4>
          <div v-for="(pair, index) in pairs" :key="index">
            <BFormInput v-model="pairs[index]" placeholder="Pair"></BFormInput>
          </div>
        </div>
        <BButton variant="primary" title="Add Pair" @click="addPair"><i-mdi-plus /></BButton>
      </div>
      <div class="d-flex flex-fill align-items-end gap-2">
        <div class="d-flex flex-column flex-shrink">
          <h4 class="text-start">Select timeframes</h4>
          <div v-for="(tf, index) in timeframes" :key="index">
            <BFormInput v-model="timeframes[index]" placeholder="Timeframe"></BFormInput>
          </div>
        </div>
        <BButton variant="primary" title="Add timeframe" @click="addTimeframe"
          ><i-mdi-plus
        /></BButton>
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
</template>

<style scoped>
.mb-3 {
  margin-bottom: 1rem;
}
</style>
