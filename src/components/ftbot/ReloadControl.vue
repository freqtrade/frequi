<script setup lang="ts">
const botStore = useBotStore();
const { t } = useUiText();
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
    <BaseCheckbox v-model="autoRefreshLoc" size="small" :title="t('autoRefresh')" />
    <Button
      class="m-1"
      severity="contrast"
      variant="outlined"
      size="small"
      :title="t('autoRefreshAllNow')"
      @click="botStore.allRefreshFull"
    >
      <template #icon>
        <i-mdi-refresh />
      </template>
    </Button>
  </div>
</template>
