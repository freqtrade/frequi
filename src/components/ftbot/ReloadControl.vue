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
  <div class="d-flex align-items-center ms-2">
    <BFormCheckbox
      v-model="autoRefreshLoc"
      input-class="float-end my-auto mt-1"
      title="AutoRefresh"
    ></BFormCheckbox>
    <BButton
      class="m-1"
      variant="secondary"
      size="sm"
      title="Auto Refresh All bots"
      @click="botStore.allRefreshFull"
    >
      <i-mdi-refresh />
    </BButton>
  </div>
</template>
