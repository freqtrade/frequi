<template>
  <div class="d-flex flex-column">
    <b-button
      v-if="botApiVersion <= 1.1"
      class="btn-xs text-start"
      size="sm"
      title="Forceexit"
      @click="$emit('forceExit', trade)"
    >
      <i-mdi-close-box class="me-1" />Forceexit
    </b-button>
    <b-button
      v-if="botApiVersion > 1.1"
      class="btn-xs text-start"
      size="sm"
      title="Forceexit limit"
      @click="$emit('forceExit', trade, 'limit')"
    >
      <i-mdi-close-box class="me-1" />Forceexit limit
    </b-button>
    <b-button
      v-if="botApiVersion > 1.1"
      class="btn-xs text-start mt-1"
      size="sm"
      title="Forceexit market"
      @click="$emit('forceExit', trade, 'market')"
    >
      <i-mdi-close-box class="me-1" />Forceexit market
    </b-button>
    <b-button
      v-if="botApiVersion > 2.16"
      class="btn-xs text-start mt-1"
      size="sm"
      title="Forceexit partial"
      @click="$emit('forceExitPartial', trade)"
    >
      <i-mdi-close-box-multiple class="me-1" />Forceexit partial
    </b-button>
    <b-button
      v-if="botApiVersion >= 2.24 && trade.open_order_id"
      class="btn-xs text-start mt-1"
      size="sm"
      title="Cancel open orders"
      @click="$emit('cancelOpenOrder', trade)"
    >
      <i-mdi-cancel class="me-1" />Cancel open order
    </b-button>

    <b-button
      class="btn-xs text-start mt-1"
      size="sm"
      title="Delete trade"
      @click="$emit('deleteTrade', trade)"
    >
      <i-mdi-delete class="me-1" />
      Delete
    </b-button>
  </div>
</template>

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
});
defineEmits(['forceExit', 'forceExitPartial', 'cancelOpenOrder', 'deleteTrade']);
</script>

<style scoped lang="scss"></style>
