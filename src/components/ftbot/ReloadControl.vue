<script setup lang="ts">
import { useBotStore } from '@/stores/ftbotwrapper';

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
      severity="secondary"
      size="small"
      title="Auto Refresh all bots now"
      @click="botStore.allRefreshFull"
    >
      <i-mdi-refresh />
    </Button>
  </div>
</template>
