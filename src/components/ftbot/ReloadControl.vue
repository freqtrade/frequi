<script setup lang="ts">
const botStore = useBotStore();
const autoRefreshLoc = computed({
  get() {
    return botStore.globalAutoRefresh;
  },
  set(newValue: boolean) {
    botStore.setGlobalAutoRefresh(newValue);
  },
});
</script>

<template>
  <div class="flex items-center ms-2">
    <BaseCheckbox v-model="autoRefreshLoc" size="sm" title="Auto Refresh for all bots" />
    <UButton
      class="m-1"
      color="neutral"
      variant="outline"
      title="Auto Refresh all bots now"
      icon="mdi:refresh"
      @click="botStore.allRefreshFull"
    />
  </div>
</template>
