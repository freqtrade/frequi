<script setup lang="ts">
import { Trade } from '@/types';

defineProps({
  botApiVersion: {
    type: Number,
    default: 1.0,
  },
  trade: {
    type: Object as () => Trade,
    required: true,
  },
  enableForceEntry: {
    type: Boolean,
    default: false,
  },
});
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
  <div class="d-flex flex-column">
    <BButton
      v-if="botApiVersion <= 1.1"
      class="btn-xs text-start"
      size="sm"
      title="Forceexit"
      @click="$emit('forceExit', trade)"
    >
      <i-mdi-close-box class="me-1" />Forceexit
    </BButton>
    <BButton
      v-if="botApiVersion > 1.1"
      class="btn-xs text-start"
      size="sm"
      title="Forceexit limit"
      @click="$emit('forceExit', trade, 'limit')"
    >
      <i-mdi-close-box class="me-1" />Forceexit limit
    </BButton>
    <BButton
      v-if="botApiVersion > 1.1"
      class="btn-xs text-start mt-1"
      size="sm"
      title="Forceexit market"
      @click="$emit('forceExit', trade, 'market')"
    >
      <i-mdi-close-box class="me-1" />Forceexit market
    </BButton>
    <BButton
      v-if="botApiVersion > 2.16"
      class="btn-xs text-start mt-1"
      size="sm"
      title="Forceexit partial"
      @click="$emit('forceExitPartial', trade)"
    >
      <i-mdi-close-box-multiple class="me-1" />Forceexit partial
    </BButton>
    <BButton
      v-if="botApiVersion >= 2.24 && (trade.open_order_id || trade.has_open_orders)"
      class="btn-xs text-start mt-1"
      size="sm"
      title="Cancel open orders"
      @click="$emit('cancelOpenOrder', trade)"
    >
      <i-mdi-cancel class="me-1" />Cancel open order
    </BButton>
    <BButton
      v-if="enableForceEntry"
      class="btn-xs text-start mt-1"
      size="sm"
      title="Increase position"
      @click="$emit('forceEntry', trade)"
    >
      <i-mdi-plus-box-multiple-outline class="me-1" />Increase position
    </BButton>
    <BButton
      v-if="botApiVersion >= 2.28"
      class="btn-xs text-start mt-1"
      size="sm"
      title="Reload"
      @click="$emit('reloadTrade', trade)"
    >
      <i-mdi-reload-alert class="me-1" />Reload Trade
    </BButton>
    <BButton
      class="btn-xs text-start mt-1"
      size="sm"
      title="Delete trade"
      @click="$emit('deleteTrade', trade)"
    >
      <i-mdi-delete class="me-1" />
      Delete
    </BButton>
  </div>
</template>

<style scoped lang="scss"></style>
