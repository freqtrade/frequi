<script setup lang="ts">
import type { Trade } from '@/types';
import type { BotFeatures } from '@/types/features';

withDefaults(
  defineProps<{
    trade: Trade;
    id: number;
    botFeatures: BotFeatures;
    enableForceEntry?: boolean;
  }>(),
  {
    enableForceEntry: false,
  },
);
const emit = defineEmits<{
  forceExit: [trade: Trade, type?: string];
  forceExitPartial: [trade: Trade];
  cancelOpenOrder: [trade: Trade];
  reloadTrade: [trade: Trade];
  deleteTrade: [trade: Trade];
  forceEntry: [trade: Trade];
}>();
const popoverOpen = ref(false);

function forceExitHandler(item: Trade, ordertype: string | undefined = undefined) {
  popoverOpen.value = false;
  emit('forceExit', item, ordertype);
}
function forceExitPartialHandler(item: Trade) {
  popoverOpen.value = false;
  emit('forceExitPartial', item);
}
function cancelOpenOrderHandler(item: Trade) {
  popoverOpen.value = false;
  emit('cancelOpenOrder', item);
}
function handleReloadTrade(item: Trade) {
  popoverOpen.value = false;
  emit('reloadTrade', item);
}
function handleDeleteTrade(item: Trade) {
  popoverOpen.value = false;
  emit('deleteTrade', item);
}
function handleForceEntry(item: Trade) {
  popoverOpen.value = false;
  emit('forceEntry', item);
}
</script>

<template>
  <div>
    <UPopover
      :target="`btn-actions-${id}`"
      :title="`Actions for ${trade.pair}`"
      v-model:open="popoverOpen"
      triggers="manual"
      placement="left"
    >
      <UButton
        :id="`btn-actions-${id}`"
        class="btn-xs"
        size="sm"
        color="neutral"
        title="Actions"
        icon="mdi:gesture-tap"
      />
      <template #content>
        <div class="p-2">
          <TradeActions
            :trade="trade"
            :bot-features="botFeatures"
            :enable-force-entry="enableForceEntry"
            @force-exit="forceExitHandler"
            @force-exit-partial="forceExitPartialHandler"
            @delete-trade="handleDeleteTrade(trade)"
            @cancel-open-order="cancelOpenOrderHandler"
            @reload-trade="handleReloadTrade"
            @force-entry="handleForceEntry"
          />
          <UButton
            class="mt-1 w-full text-start"
            color="neutral"
            label="Close Actions menu"
            icon="mdi:cancel"
            @click="popoverOpen = false"
          />
        </div>
      </template>
    </UPopover>
  </div>
</template>
