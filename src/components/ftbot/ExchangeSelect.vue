<script setup lang="ts">
import type { ExchangeSelection } from '@/types';
import type { SelectMenuItem } from '@nuxt/ui';

const exchangeModel = defineModel<ExchangeSelection>({ required: true });

const botStore = useBotStore();

const exchangeList = computed<SelectMenuItem[]>(() => {
  const supported = botStore.activeBot.exchangeList
    .filter((ex) => ex.valid && ex.supported)
    .sort((a, b) => a.name.localeCompare(b.name));

  const unsupported = botStore.activeBot.exchangeList
    .filter((ex) => ex.valid && !ex.supported)
    .sort((a, b) => a.name.localeCompare(b.name));

  return [
    { label: 'Supported', type: 'label' },
    ...supported.map((e) => ({ value: e.classname ?? e.name, label: e.name })),
    { type: 'separator' },
    { label: 'Unsupported', type: 'label' },
    ...unsupported.map((e) => ({ value: e.classname ?? e.name, label: e.name })),
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
      label: `${tm.margin_mode} ${tm.trading_mode}`,
      value: tm,
    };
  });
});

watch(
  () => exchangeModel.value.exchange,
  () => {
    if (tradeModesTyped.value.length < 2 && tradeModesTyped.value[0]) {
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
  <div class="w-full flex">
    <USelectMenu
      id="exchange-select"
      v-model="exchangeModel.exchange"
      class="min-w-52"
      value-key="value"
      :items="exchangeList"
    >
    </USelectMenu>
    <USelectMenu
      id="tradeMode-select"
      v-model="exchangeModel.trade_mode as any"
      class="min-w-44"
      :items="tradeModes"
      :disabled="tradeModes.length < 2"
    >
    </USelectMenu>
    <UButton
      color="neutral"
      variant="outline"
      class="ms-2 no-min-w"
      size="sm"
      icon="mdi:refresh"
      @click="botStore.activeBot.getExchangeList()"
    />
  </div>
</template>
