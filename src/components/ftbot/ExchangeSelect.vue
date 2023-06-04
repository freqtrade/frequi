<template>
  <div class="w-100 d-flex">
    <b-form-select id="exchange-select" v-model="exchangeModel.exchange" :options="exchangeList">
    </b-form-select>
    <b-form-select
      id="tradeMode-select"
      v-model="exchangeModel.trade_mode"
      :options="tradeModes"
      :disabled="tradeModes.length < 2"
    >
    </b-form-select>
    <div class="ms-2">
      <b-button @click="botStore.activeBot.getExchangeList">
        <i-mdi-refresh />
      </b-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';
import { computed, onMounted } from 'vue';
import { ExchangeSelection } from '@/types';

const exchangeModel = defineModel({
  type: Object as () => ExchangeSelection,
  required: true,
});
const botStore = useBotStore();

const exchangeList = computed(() => {
  return botStore.activeBot.exchangeList
    .filter((ex) => ex.valid === true)
    .sort((a, b) => {
      // Sort by supported (alphabetically), then by name (alphabetically).
      if (a.supported && !b.supported) {
        return -1;
      } else if (!a.supported && b.supported) {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    })
    .map((e) => e.name);
});

const tradeModes = computed<Record<string, unknown>[]>(() => {
  const val = botStore.activeBot.exchangeList
    .find((ex) => ex.name === exchangeModel.value.exchange)
    ?.trade_modes.map((tm) => {
      return (
        {
          text: `${tm.margin_mode} ${tm.trading_mode}`,
          value: tm,
        } ?? []
      );
    });
  return (val ?? []) as Record<string, unknown>[];
});

onMounted(() => {
  if (botStore.activeBot.exchangeList.length === 0) {
    botStore.activeBot.getExchangeList();
  }
});
</script>
