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
    <Checkbox v-model="autoRefreshLoc" binary title="AutoRefresh"></Checkbox>
    <Button
      class="m-1"
      severity="secondary"
      size="small"
      title="Auto Refresh All bots"
      @click="botStore.allRefreshFull"
    >
      <i-mdi-refresh />
    </Button>
  </div>
</template>
