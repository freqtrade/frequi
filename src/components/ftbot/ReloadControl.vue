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
    <BaseCheckbox v-model="autoRefreshLoc" size="small" title="Auto Refresh" />
    <Button
      class="m-1"
      severity="contrast"
      variant="outlined"
      size="small"
      title="Auto Refresh all bots now"
      @click="botStore.allRefreshFull"
    >
      <template #icon>
        <i-mdi-refresh />
      </template>
    </Button>
  </div>
</template>
