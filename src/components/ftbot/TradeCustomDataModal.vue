<script setup lang="ts">
import type { Trade } from '@/types';
defineProps<{ tradeId: Trade['trade_id'] }>();
defineEmits<{
  close: [value: boolean];
}>();
</script>

<template>
  <UModal :title="`Custom data for trade ${tradeId}`" description="">
    <template #body>
      <TradeCustomData :trade-id="tradeId" />
    </template>
  </UModal>
</template>
