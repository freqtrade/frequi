<script setup lang="ts">
import { Trade } from '@/types';
import { ref } from 'vue';
import TradeActions from './TradeActions.vue';

defineProps({
  trade: { type: Object as () => Trade, required: true },
  id: { type: Number, required: true },
  botApiVersion: { type: Number, required: true },
});
const emit = defineEmits([
  'forceExit',
  'forceExitPartial',
  'cancelOpenOrder',
  'reloadTrade',
  'deleteTrade',
]);
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
</script>

<template>
  <div>
    <b-button
      :id="`btn-actions-${id}`"
      class="btn-xs"
      size="sm"
      title="Actions"
      @click="popoverOpen = !popoverOpen"
    >
      <i-mdi-gesture-tap />
    </b-button>
    <b-popover
      :target="`btn-actions-${id}`"
      :title="`Actions for ${trade.pair}`"
      triggers="manual"
      :show="popoverOpen"
      placement="left"
    >
      <trade-actions
        :trade="trade"
        :bot-api-version="botApiVersion"
        @force-exit="forceExitHandler"
        @force-exit-partial="forceExitPartialHandler"
        @delete-trade="
          popoverOpen = false;
          $emit('deleteTrade', trade);
        "
        @cancel-open-order="cancelOpenOrderHandler"
        @reload-trade="handleReloadTrade"
      />
      <b-button class="mt-1 w-100 text-start" size="sm" @click="popoverOpen = false">
        <i-mdi-cancel class="me-1" />Close Actions menu
      </b-button>
    </b-popover>
  </div>
</template>

<style scoped></style>
