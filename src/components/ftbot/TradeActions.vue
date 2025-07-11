<script setup lang="ts">
import type { Trade, BotFeatures } from '@/types';

withDefaults(
  defineProps<{
    botFeatures: BotFeatures;
    trade: Trade;
    enableForceEntry?: boolean;
  }>(),
  {
    enableForceEntry: false,
  },
);
defineEmits<{
  forceExit: [trade: Trade, type?: 'limit' | 'market'];
  forceExitPartial: [trade: Trade];
  cancelOpenOrder: [trade: Trade];
  reloadTrade: [trade: Trade];
  deleteTrade: [trade: Trade];
  forceEntry: [trade: Trade];
}>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <Button
      v-if="!botFeatures.forceExitParams"
      class="justify-start!"
      size="small"
      severity="secondary"
      title="Forceexit"
      label="Forceexit"
      @click="$emit('forceExit', trade)"
    >
      <template #icon>
        <i-mdi-close-box />
      </template>
    </Button>
    <Button
      v-if="botFeatures.forceExitParams"
      size="small"
      class="justify-start!"
      severity="secondary"
      title="Forceexit limit"
      label="Forceexit limit"
      @click="$emit('forceExit', trade, 'limit')"
    >
      <template #icon>
        <i-mdi-close-box />
      </template>
    </Button>
    <Button
      v-if="botFeatures.forceExitParams"
      class="justify-start!"
      size="small"
      severity="secondary"
      title="Forceexit market"
      label="Forceexit market"
      @click="$emit('forceExit', trade, 'market')"
    >
      <template #icon>
        <i-mdi-close-box />
      </template>
    </Button>
    <Button
      v-if="botFeatures.forceEntryTag"
      class="justify-start!"
      size="small"
      severity="secondary"
      title="Forceexit partial"
      label="Forceexit partial"
      @click="$emit('forceExitPartial', trade)"
    >
      <template #icon>
        <i-mdi-close-box-multiple />
      </template>
    </Button>
    <Button
      v-if="botFeatures.cancelOpenOrders && (trade.open_order_id || trade.has_open_orders)"
      class="justify-start!"
      size="small"
      severity="secondary"
      title="Cancel open orders"
      label="Cancel open orders"
      @click="$emit('cancelOpenOrder', trade)"
    >
      <template #icon>
        <i-mdi-cancel />
      </template>
    </Button>
    <Button
      v-if="enableForceEntry"
      class="justify-start!"
      size="small"
      severity="secondary"
      title="Increase position"
      label="Increase position"
      @click="$emit('forceEntry', trade)"
    >
      <template #icon>
        <i-mdi-plus-box-multiple-outline />
      </template>
    </Button>
    <Button
      v-if="botFeatures.reloadTrade"
      class="justify-start!"
      size="small"
      severity="secondary"
      title="Reload"
      label="Reload"
      @click="$emit('reloadTrade', trade)"
    >
      <template #icon><i-mdi-reload-alert /> </template>
    </Button>
    <Button
      class="justify-start!"
      size="small"
      severity="secondary"
      title="Delete trade"
      label="Delete trade"
      @click="$emit('deleteTrade', trade)"
    >
      <template #icon>
        <i-mdi-delete />
      </template>
    </Button>
  </div>
</template>
