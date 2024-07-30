<script setup lang="ts">
import { Trade } from '@/types';

defineProps({
  trade: { type: Object as () => Trade, required: true },
  id: { type: Number, required: true },
  botApiVersion: { type: Number, required: true },
  enableForceEntry: { type: Boolean, default: false },
});
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
    <BButton
      :id="`btn-actions-${id}`"
      class="btn-xs"
      size="sm"
      title="Actions"
      @click="popoverOpen = !popoverOpen"
    >
      <i-mdi-gesture-tap />
    </BButton>
    <BPopover
      teleport-to="body"
      :target="`btn-actions-${id}`"
      :title="`Actions for ${trade.pair}`"
      triggers="manual"
      :show="popoverOpen"
      placement="left"
    >
      <TradeActions
        :trade="trade"
        :bot-api-version="botApiVersion"
        :enable-force-entry="enableForceEntry"
        @force-exit="forceExitHandler"
        @force-exit-partial="forceExitPartialHandler"
        @delete-trade="handleDeleteTrade(trade)"
        @cancel-open-order="cancelOpenOrderHandler"
        @reload-trade="handleReloadTrade"
        @force-entry="handleForceEntry"
      />
      <BButton class="mt-1 w-100 text-start" size="sm" @click="popoverOpen = false">
        <i-mdi-cancel class="me-1" />Close Actions menu
      </BButton>
    </BPopover>
  </div>
</template>
