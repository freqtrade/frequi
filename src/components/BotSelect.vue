<script setup lang="ts">
const botStore = useBotStore();
</script>

<template>
  <USelect
    v-if="botStore.botCount > 1"
    :model-value="botStore.selectedBot"
    label-key="botName"
    value-key="botId"
    class="m-1 min-w-36"
    :items="botStore.availableBotsSorted"
    @update:model-value="botStore.selectBot($event)"
  >
    <template #item="{ item }">
      <BotEntry :bot="item" no-buttons no-refresh-switch />
    </template>
  </USelect>
</template>
