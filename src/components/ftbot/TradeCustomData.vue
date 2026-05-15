<script setup lang="ts">
import type { Trade } from '@/types';
const props = defineProps<{
  tradeId: Trade['trade_id'];
}>();

const botStore = useBotStore();
const { state: customData, execute } = useAsyncState(
  () => botStore.activeBot.getCustomDataForTrade(props.tradeId),
  null,
  { immediate: true, resetOnExecute: false, shallow: true },
);
</script>

<template>
  <template v-for="x in customData" :key="x.trade_id">
    <template v-for="y in x.custom_data" :key="y.key">
      <ValuePair :description="y.key">{{ y.value }}</ValuePair>
    </template>
  </template>
  <UButton @click="execute()" icon="mdi:reload" label="Reload Custom Data" />
</template>
