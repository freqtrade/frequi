<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';

import type { ExchangeSelection } from '@/types';

const exchangeModel = defineModel<ExchangeSelection>({ required: true });

const botStore = useBotStore();

const exchangeList = computed(() => {
  const supported = botStore.activeBot.exchangeList
    .filter((ex) => ex.valid && ex.supported)
    .sort((a, b) => a.name.localeCompare(b.name));

  const unsupported = botStore.activeBot.exchangeList
    .filter((ex) => ex.valid && !ex.supported)
    .sort((a, b) => a.name.localeCompare(b.name));

  return [
    {
      label: 'Supported',
      options: supported.map((e) => ({ value: e.classname ?? e.name, text: e.name })),
    },
    {
      label: 'Unsupported',
      options: unsupported.map((e) => ({ value: e.classname ?? e.name, text: e.name })),
    },
  ];
});

const tradeModesTyped = computed(() => {
  const val = botStore.activeBot.exchangeList.find(
    (ex) =>
      ex.name === exchangeModel.value.exchange || ex.classname === exchangeModel.value.exchange,
  )?.trade_modes;
  return val ?? [];
});

const tradeModes = computed(() => {
  return tradeModesTyped.value.map((tm) => {
    return {
      text: `${tm.margin_mode} ${tm.trading_mode}`,
      value: tm,
    };
  });
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

<template>
  <div class="w-100 d-flex">
    <BFormSelect
      id="exchange-select"
      v-model="exchangeModel.exchange"
      size="sm"
      :options="exchangeList"
    >
    </BFormSelect>
    <BFormSelect
      id="tradeMode-select"
      v-model="exchangeModel.trade_mode"
      size="sm"
      :options="tradeModes"
      :disabled="tradeModes.length < 2"
    >
    </BFormSelect>
    <BButton class="ms-2 no-min-w" size="sm" @click="botStore.activeBot.getExchangeList">
      <i-mdi-refresh />
    </BButton>
  </div>
</template>
