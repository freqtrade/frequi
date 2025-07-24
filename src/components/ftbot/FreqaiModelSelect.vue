<script setup lang="ts">
const locFreqaiModel = defineModel<string>();
const botStore = useBotStore();

onMounted(() => {
  if (botStore.activeBot.freqaiModelList.length === 0) {
    botStore.activeBot.getFreqAIModelList();
  }
});
</script>

<template>
  <div>
    <div class="w-full flex">
      <Select
        v-model="locFreqaiModel"
        :options="botStore.activeBot.freqaiModelList"
        fluid
        size="small"
      >
      </Select>
      <div class="ms-2">
        <Button
          severity="secondary"
          variant="outlined"
          size="small"
          @click="botStore.activeBot.getFreqAIModelList"
        >
          <template #icon>
            <i-mdi-refresh />
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>
