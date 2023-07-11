<template>
  <div class="w-100 d-flex">
    <b-form-select
      id="exchange-select"
      v-model="exchangeModel.exchange"
      size="sm"
      :options="exchangeList"
    >
    </b-form-select>
    <b-form-select
      id="tradeMode-select"
      v-model="exchangeModel.trade_mode"
      size="sm"
      :options="tradeModes"
      :disabled="tradeModes.length < 2"
    >
    </b-form-select>
    <div class="ms-2">
      <b-button size="sm" @click="botStore.activeBot.getExchangeList">
        <i-mdi-refresh />
      </b-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { computed, onMounted, watch } from 'vue';
import { ExchangeSelection } from '@/types';

const exchangeModel = defineModel({
  type: Object as () => ExchangeSelection,
  required: true,
});
const botStore = useBotStore();

const exchangeList = computed(() => {
  const supported = botStore.activeBot.exchangeList
    .filter((ex) => ex.valid && ex.supported)
    .sort((a, b) => a.name.localeCompare(b.name));

  const unsupported = botStore.activeBot.exchangeList
    .filter((ex) => ex.valid && !ex.supported)
    .sort((a, b) => a.name.localeCompare(b.name));

  return [
    { label: 'Supported', options: supported.map((e) => e.name) },
    { label: 'Unsupported', options: unsupported.map((e) => e.name) },
  ];
});

const tradeModesTyped = computed(() => {
  const val = botStore.activeBot.exchangeList.find((ex) => ex.name === exchangeModel.value.exchange)
    ?.trade_modes;
  return val ?? [];
});

const tradeModes = computed<Record<string, unknown>[]>(() => {
  return tradeModesTyped.value.map((tm) => {
    return (
      {
        text: `${tm.margin_mode} ${tm.trading_mode}`,
        value: tm,
      } ?? []
    );
  }) as Record<string, unknown>[];
});

watch(
  () => exchangeModel.value.exchange,
  () => {
    if (tradeModesTyped.value.length < 2) {
      exchangeModel.value.trade_mode = tradeModesTyped.value[0];
    }
  },
);

onMounted(() => {
  if (botStore.activeBot.exchangeList.length === 0) {
    botStore.activeBot.getExchangeList();
  }
});
</script>
