<script setup lang="ts">
import type { Trade } from '@/types';
import type { BotFeatures } from '@/types/features';
import Popover from 'primevue/popover';

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
const popover = ref<InstanceType<typeof Popover> | null>(null);
</script>

<template>
  <div>
    <Button
      :id="`btn-actions-${id}`"
      class="btn-xs"
      size="small"
      severity="secondary"
      title="Actions"
      @click="popover?.toggle"
    >
      <i-mdi-gesture-tap />
    </Button>
    <Popover
      ref="popover"
      :target="`btn-actions-${id}`"
      :title="`Actions for ${trade.pair}`"
      triggers="manual"
      placement="left"
    >
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
      <Button
        class="mt-1 w-full text-start"
        size="small"
        severity="secondary"
        label="Close Actions menu"
        @click="popover?.hide"
      >
        <template #icon><i-mdi-cancel class="me-1" /></template>
      </Button>
    </Popover>
  </div>
</template>
